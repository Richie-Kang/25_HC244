import React from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
    children,
    title,
    description,
    action,
    className,
}) => {
    return (
        <div className={cn("space-y-6", className)}>
            {(title || description || action) && (
                <div className="flex justify-between items-center">
                    <div>
                        {title && (
                            <h1 className="text-2xl font-bold text-white">{title}</h1>
                        )}
                        {description && (
                            <p className="text-gray-400 mt-1">{description}</p>
                        )}
                    </div>
                    {action && <div>{action}</div>}
                </div>
            )}
            {children}
        </div>
    );
}; 