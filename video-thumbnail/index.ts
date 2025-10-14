import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

// Get the default VPC and subnets
const defaultVpc = aws.ec2.getVpc({ default: true });
const defaultSubnets = aws.ec2.getSubnets({
    filters: [{ name: "default-for-az", values: ["true"] }],
});

// Create an ECS cluster
const cluster = new aws.ecs.Cluster("ffmpeg-cluster", {
    name: "ffmpeg-cluster",
});

// A bucket to store videos and thumbnails
const bucket = new aws.s3.Bucket("trynicbucket");

// Export the bucket name
export const bucketName = bucket.id;

// Create IAM role for ECS task execution
const taskExecutionRole = new aws.iam.Role("taskExecutionRole", {
    assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
            Action: "sts:AssumeRole",
            Effect: "Allow",
            Principal: { Service: "ecs-tasks.amazonaws.com" },
        }],
    }),
});

// Attach the required policy for ECS task execution
new aws.iam.RolePolicyAttachment("taskExecutionRolePolicy", {
    role: taskExecutionRole.name,
    policyArn: "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy",
});

// Create IAM role for ECS task (for S3 access)
const taskRole = new aws.iam.Role("taskRole", {
    assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
            Action: "sts:AssumeRole",
            Effect: "Allow",
            Principal: { Service: "ecs-tasks.amazonaws.com" },
        }],
    }),
});

// Attach S3 access policy to task role
new aws.iam.RolePolicyAttachment("taskRolePolicy", {
    role: taskRole.name,
    policyArn: "arn:aws:iam::aws:policy/AmazonS3FullAccess",
});

// Create CloudWatch log group
const logGroup = new aws.cloudwatch.LogGroup("ffmpeg-logs", {
    name: "/ecs/ffmpeg-thumbnail",
    retentionInDays: 7,
});

// Create ECS task definition
const taskDefinition = new aws.ecs.TaskDefinition("ffmpegThumbTask", {
    family: "ffmpeg-thumbnail-task",
    networkMode: "awsvpc",
    requiresCompatibilities: ["FARGATE"],
    cpu: "512",
    memory: "1024",
    executionRoleArn: taskExecutionRole.arn,
    taskRoleArn: taskRole.arn,
    containerDefinitions: pulumi.all([logGroup.name]).apply(([logGroupName]) => 
        JSON.stringify([{
            name: "ffmpeg-container",
            image: "jrottenberg/ffmpeg:4.1-alpine",
            essential: true,
            entryPoint: ["/bin/sh"],
            command: [
                "-c",
                "set -e && " +
                "echo 'Installing AWS CLI...' && " +
                "apk add --no-cache aws-cli curl && " +
                "echo 'Starting ffmpeg task...' && " +
                "echo 'Environment variables:' && " +
                "echo 'S3_BUCKET='$S3_BUCKET && " +
                "echo 'INPUT_VIDEO='$INPUT_VIDEO && " +
                "echo 'TIME_OFFSET='$TIME_OFFSET && " +
                "echo 'OUTPUT_FILE='$OUTPUT_FILE && " +
                "echo 'Downloading video from s3://'$S3_BUCKET'/'$INPUT_VIDEO'...' && " +
                "aws s3 cp s3://$S3_BUCKET/$INPUT_VIDEO ./$INPUT_VIDEO && " +
                "echo 'Video downloaded successfully. File info:' && " +
                "ls -la ./$INPUT_VIDEO && " +
                "echo 'Getting video information...' && " +
                "ffprobe -v quiet -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ./$INPUT_VIDEO && " +
                "echo 'Running ffmpeg to extract thumbnail at '$TIME_OFFSET'...' && " +
                "timeout 60 ffmpeg -y -i ./$INPUT_VIDEO -ss $TIME_OFFSET -vframes 1 -f image2 -q:v 2 $OUTPUT_FILE -v info && " +
                "echo 'Thumbnail created successfully. File info:' && " +
                "ls -la ./$OUTPUT_FILE && " +
                "echo 'Uploading thumbnail to S3://'$S3_BUCKET'/'$OUTPUT_FILE'...' && " +
                "aws s3 cp ./$OUTPUT_FILE s3://$S3_BUCKET/$OUTPUT_FILE && " +
                "echo 'Task completed successfully!' && " +
                "echo 'Cleaning up...' && " +
                "rm -f ./$INPUT_VIDEO ./$OUTPUT_FILE && " +
                "echo 'Thumbnail generation completed. Exit code: 0' && " +
                "exit 0"
            ],
            environment: [],
            logConfiguration: {
                logDriver: "awslogs",
                options: {
                    "awslogs-group": logGroupName,
                    "awslogs-region": "us-east-1",
                    "awslogs-stream-prefix": "ecs"
                }
            }
        }])
    )
});

// Lambda function to trigger ECS task on video upload
bucket.onObjectCreated("onNewVideo", new aws.lambda.CallbackFunction<aws.s3.BucketEvent, void>("onNewVideo", {
    policies: [
        aws.iam.ManagedPolicy.AWSLambdaExecute,
        aws.iam.ManagedPolicy.AmazonECSFullAccess,
    ],
    runtime: aws.lambda.Runtime.NodeJS18dX,
    callback: async bucketArgs => {
        console.log("onNewVideo called");
        if (!bucketArgs.Records) {
            return;
        }

        const { ECSClient, RunTaskCommand } = require('@aws-sdk/client-ecs');
        const ecsClient = new ECSClient({ region: process.env.AWS_REGION });

        for (const record of bucketArgs.Records) {
            console.log(`*** New video: file ${record.s3.object.key} was uploaded at ${record.eventTime}.`);
            const file = decodeURIComponent(record.s3.object.key);

            // 파일명만 추출 (경로 제거)
            const fileName = file.split('/').pop() || file;
            
            // 안전한 파일명 처리
            const underscoreIndex = fileName.indexOf('_');
            const dotIndex = fileName.lastIndexOf('.');
            
            if (underscoreIndex === -1 || dotIndex === -1 || underscoreIndex >= dotIndex) {
                console.error(`Invalid filename format: ${fileName}. Expected format: filename_HH-MM-SS.mp4`);
                continue;
            }

            const baseName = fileName.substring(0, underscoreIndex);
            const timeString = fileName.substring(underscoreIndex + 1, dotIndex);
            
            // 썸네일 파일은 원본 파일과 같은 경로에 저장
            const filePath = file.substring(0, file.lastIndexOf('/') + 1);
            const thumbnailFile = `${filePath}${baseName}.jpg`;
            
            // 시간 형식 검증 및 변환
            let framePos = "00:00:01"; // 기본값: 1초
            if (timeString.match(/^\d{2}-\d{2}-\d{2}$/)) {
                framePos = timeString.replace(/-/g, ':');
            } else {
                console.warn(`Invalid time format: ${timeString}. Using default: ${framePos}`);
            }

            console.log(`Processing: ${file} -> ${thumbnailFile} at time ${framePos}`);

            try {
                const command = new RunTaskCommand({
                    cluster: process.env.CLUSTER_ARN,
                    taskDefinition: process.env.TASK_DEFINITION_ARN,
                    launchType: "FARGATE",
                    networkConfiguration: {
                        awsvpcConfiguration: {
                            assignPublicIp: "ENABLED",
                            subnets: process.env.SUBNET_IDS?.split(',') || [],
                        }
                    },
                    overrides: {
                        containerOverrides: [{
                            name: "ffmpeg-container",
                            environment: [
                                { name: "S3_BUCKET", value: process.env.BUCKET_NAME },
                                { name: "INPUT_VIDEO", value: file },
                                { name: "TIME_OFFSET", value: framePos },
                                { name: "OUTPUT_FILE", value: thumbnailFile },
                            ],
                        }],
                    },
                });

                console.log(`Sending ECS task command for ${file}...`);
                const result = await ecsClient.send(command);
                console.log(`ECS task started successfully for ${file}. Task ARN: ${result.tasks?.[0]?.taskArn || 'unknown'}`);
            } catch (error) {
                console.error(`Error running ECS task for ${file}:`, error);
                // 개별 파일 처리 실패 시 전체 Lambda 실행을 중단하지 않음
                continue;
            }
        }
    },
    environment: {
        variables: {
            BUCKET_NAME: bucketName,
            CLUSTER_ARN: cluster.arn,
            TASK_DEFINITION_ARN: taskDefinition.arn,
            SUBNET_IDS: defaultSubnets.then(subnets => subnets.ids.join(',')),
        }
    }
}), { filterSuffix: ".mp4" });

// Lambda function to log thumbnail creation
bucket.onObjectCreated("onNewThumbnail", new aws.lambda.CallbackFunction<aws.s3.BucketEvent, void>("onNewThumbnail", {
    policies: [aws.iam.ManagedPolicy.AWSLambdaExecute],
    runtime: aws.lambda.Runtime.NodeJS18dX,
    callback: async bucketArgs => {
        console.log("onNewThumbnail called");
        if (!bucketArgs.Records) {
            return;
        }

        for (const record of bucketArgs.Records) {
            console.log(`*** New thumbnail: file ${record.s3.object.key} was saved at ${record.eventTime}.`);
        }
    }
}), { filterSuffix: ".jpg" });

// Export cluster ARN for reference
export const clusterArn = cluster.arn;
export const taskDefinitionArn = taskDefinition.arn;