import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useToast } from '@/hooks/use-toast';

interface VideoGenerationCompletedData {
  jobId: string;
  videoId: number;
  videoUrl: string;
  thumbnailUrl?: string;
  model: string;
  status: 'completed';
  timestamp: string;
}

interface VideoGenerationFailedData {
  jobId: string;
  error: string;
  model: string;
  status: 'failed';
  timestamp: string;
}

interface VideoGenerationStartedData {
  jobId: string;
  model: string;
  status: 'started';
  timestamp: string;
}

interface VideoGenerationProgressData {
  jobId: string;
  progress: unknown;
  status: 'in_progress';
  timestamp: string;
}

export function useWebSocket(userId: string | null) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) {
      console.log('❌ [WebSocket] userId가 없어 연결하지 않음');
      return;
    }

    // WebSocket 연결 설정
    const baseUrl = process.env.NEXT_PUBLIC_NESTJS_URL || 'http://localhost:4000';
    console.log('🚀 [WebSocket] 연결 시도 중...', {
      userId,
      baseUrl,
      fullUrl: `${baseUrl}/video`,
      timestamp: new Date().toISOString()
    });

    const socket = io(`${baseUrl}/video`, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    // 연결 이벤트
    socket.on('connect', () => {
      console.log('✅ [WebSocket] 연결 성공!', {
        socketId: socket.id,
        userId,
        timestamp: new Date().toISOString(),
        connected: socket.connected,
        transport: socket.io.engine.transport.name
      });
      setIsConnected(true);

      // 사용자 방에 참여
      console.log('📤 [WebSocket] join-user-room 이벤트 발송:', { userId });
      socket.emit('join-user-room', { userId });
    });

    // 연결 해제 이벤트
    socket.on('disconnect', (reason: string) => {
      console.log('🔌 [WebSocket] 연결 해제됨', {
        reason,
        timestamp: new Date().toISOString(),
        socketId: socket.id
      });
      setIsConnected(false);
    });

    // 사용자 방 참여 확인
    socket.on('joined-user-room', (data: { success: boolean; userId: string }) => {
      console.log('📥 [WebSocket] joined-user-room 응답 수신:', {
        data,
        timestamp: new Date().toISOString()
      });
    });

    // 영상 생성 시작 알림
    socket.on('video-generation-started', (data: VideoGenerationStartedData) => {
      console.log('📥 [WebSocket] 🎬 video-generation-started 수신:', {
        data,
        timestamp: new Date().toISOString(),
        dataSize: JSON.stringify(data).length
      });
      toast({
        title: "영상 생성 시작",
        description: `영상 생성이 시작되었습니다 (${data.model})`,
      });
    });

    // 영상 생성 진행 알림
    socket.on('video-generation-progress', (data: VideoGenerationProgressData) => {
      console.log('📥 [WebSocket] 📊 video-generation-progress 수신:', {
        jobId: data.jobId,
        status: data.status,
        progressType: typeof data.progress,
        timestamp: new Date().toISOString()
      });
      // 필요시 진행률 표시 로직 추가
    });

    // 영상 생성 완료 알림
    socket.on('video-generation-completed', (data: VideoGenerationCompletedData) => {
      console.log('📥 [WebSocket] ✅ video-generation-completed 수신:', {
        data,
        timestamp: new Date().toISOString(),
        hasVideoUrl: !!data.videoUrl,
        hasThumbnail: !!data.thumbnailUrl
      });
      toast({
        title: "영상 생성 완료",
        description: `영상 생성이 완료되었습니다! (${data.model})`,
      });
      
      // 완료된 영상 페이지로 이동하거나 다른 액션 수행
      // window.dispatchEvent(new CustomEvent('video-generation-completed', { detail: data }));
    });

    // 영상 생성 실패 알림
    socket.on('video-generation-failed', (data: VideoGenerationFailedData) => {
      console.log('📥 [WebSocket] ❌ video-generation-failed 수신:', {
        data,
        timestamp: new Date().toISOString(),
        errorLength: data.error?.length || 0
      });
      toast({
        title: "영상 생성 실패",
        description: `영상 생성에 실패했습니다: ${data.error} (${data.model})`,
        variant: "destructive",
      });
    });

    // 일반 알림
    socket.on('notification', (data: { type: string; title: string; message: string; data?: unknown; timestamp: string }) => {
      console.log('📥 [WebSocket] 🔔 notification 수신:', {
        type: data.type,
        title: data.title,
        message: data.message,
        hasData: !!data.data,
        timestamp: new Date().toISOString()
      });
      toast({
        title: data.title || "알림",
        description: data.message,
      });
    });

    // 오류 처리
    socket.on('connect_error', (error: Error) => {
      console.error('📥 [WebSocket] 🚫 connect_error 수신:', {
        error: error.message,
        errorType: error.name,
        timestamp: new Date().toISOString(),
        baseUrl
      });
      setIsConnected(false);
    });

    // 모든 이벤트 수신 로깅 (개발용)
    socket.onAny((eventName: string, ...args: unknown[]) => {
      console.log('📥 [WebSocket] 이벤트 수신:', {
        eventName,
        argsCount: args.length,
        timestamp: new Date().toISOString(),
        socketId: socket.id
      });
    });

    return () => {
      console.log('🧹 [WebSocket] 정리 중...', {
        userId,
        socketId: socket.id,
        timestamp: new Date().toISOString()
      });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId]);

  const emit = (event: string, data: unknown) => {
    if (socketRef.current?.connected) {
      console.log('📤 [WebSocket] 이벤트 발송:', {
        event,
        hasData: !!data,
        dataType: typeof data,
        timestamp: new Date().toISOString(),
        socketId: socketRef.current.id
      });
      socketRef.current.emit(event, data);
    } else {
      console.warn('⚠️ [WebSocket] 연결되지 않아 이벤트 발송 실패:', {
        event,
        isConnected: !!socketRef.current?.connected,
        hasSocket: !!socketRef.current,
        timestamp: new Date().toISOString()
      });
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    emit,
  };
} 