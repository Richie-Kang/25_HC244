// src/app/providers.tsx
"use client";

import React, { createContext, useContext, useCallback, useRef } from "react";
import { AuthProvider, useAuth } from "@/features/user/AuthContext";
import { CreditProvider } from "@/features/payment/context/CreditContext";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { io, Socket } from "socket.io-client";

// 웹소켓 컨텍스트 타입 정의
interface WebSocketContextType {
    connectForVideoGeneration: () => Promise<void>;
    disconnect: () => void;
    isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

// 웹소켓 Hook
export const useVideoWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useVideoWebSocket must be used within WebSocketNotificationProvider');
    }
    return context;
};

// 웹소켓 알림을 처리하는 Provider
function WebSocketNotificationProvider({ children }: { children: React.ReactNode }) {
    const { id: userId } = useAuth();
    const { toast } = useToast();
    const socketRef = useRef<Socket | null>(null);
    const isConnectedRef = useRef(false);

    // 영상 생성용 웹소켓 연결
    const connectForVideoGeneration = useCallback(async () => {
        if (!userId) {
            console.warn('❌ [WebSocket-Provider] 사용자 ID가 없어 연결할 수 없습니다.');
            return;
        }

        if (isConnectedRef.current) {
            console.log('✅ [WebSocket-Provider] 이미 연결되어 있습니다.', {
                socketId: socketRef.current?.id,
                connected: socketRef.current?.connected
            });
            return;
        }

        try {
            console.log('🚀 [WebSocket-Provider] 영상 생성용 연결 시작...', {
                userId,
                timestamp: new Date().toISOString()
            });
            
            const baseUrl = process.env.NEXT_PUBLIC_NESTJS_URL || 'http://localhost:4000';
            console.log('🔗 [WebSocket-Provider] 연결 설정:', {
                baseUrl,
                fullUrl: `${baseUrl}/video`,
                withCredentials: true,
                transports: ['websocket', 'polling']
            });

            const socket = io(`${baseUrl}/video`, {
                withCredentials: true,
                transports: ['websocket', 'polling'],
            });

            socketRef.current = socket;

            // 연결 성공
            socket.on('connect', () => {
                console.log('✅ [WebSocket-Provider] 영상 생성용 연결 성공!', {
                    socketId: socket.id,
                    userId,
                    timestamp: new Date().toISOString(),
                    transport: socket.io.engine.transport.name
                });
                isConnectedRef.current = true;
                
                // 사용자 방에 참여
                console.log('📤 [WebSocket-Provider] join-user-room 이벤트 발송:', { userId });
                socket.emit('join-user-room', { userId });
            });

            // 사용자 방 참여 확인
            socket.on('joined-user-room', (data: { success: boolean; userId: string }) => {
                console.log('📥 [WebSocket-Provider] joined-user-room 응답 수신:', {
                    data,
                    timestamp: new Date().toISOString()
                });
            });

            // 영상 생성 완료 처리
            socket.on('video-generation-completed', (data: {
                jobId?: string;
                videoId?: number;
                model: string;
                status: string;
                timestamp: string;
            }) => {
                console.log('📥 [WebSocket-Provider] ✅ video-generation-completed 수신:', {
                    data,
                    timestamp: new Date().toISOString(),
                    hasJobId: !!data.jobId,
                    hasVideoId: !!data.videoId
                });
                
                toast({
                    title: "영상 생성 완료",
                    description: `영상이 성공적으로 생성되었습니다! (${data.model})`,
                    duration: 4000,
                });

                // 완료 후 웹소켓 연결 해제
                console.log('🔌 [WebSocket-Provider] 영상 생성 완료 후 연결 해제');
                disconnect();
            });

            // 영상 생성 실패 처리
            socket.on('video-generation-failed', (data: {
                jobId?: string;
                model: string;
                status: string;
                error?: string;
                timestamp: string;
            }) => {
                console.log('📥 [WebSocket-Provider] ❌ video-generation-failed 수신:', {
                    data,
                    timestamp: new Date().toISOString(),
                    hasJobId: !!data.jobId,
                    errorLength: data.error?.length || 0
                });
                
                toast({
                    title: "영상 생성 실패",
                    description: `영상 생성에 실패했습니다: ${data.error || '알 수 없는 오류'} (${data.model})`,
                    variant: "destructive",
                    duration: 5000,
                });

                // 실패 후 웹소켓 연결 해제
                console.log('🔌 [WebSocket-Provider] 영상 생성 실패 후 연결 해제');
                disconnect();
            });

            // 연결 에러 처리
            socket.on('connect_error', (error: Error) => {
                console.error('📥 [WebSocket-Provider] 🚫 connect_error 수신:', {
                    error: error.message,
                    errorType: error.name,
                    timestamp: new Date().toISOString()
                });
                isConnectedRef.current = false;
            });

            // 연결 해제 처리
            socket.on('disconnect', (reason: string) => {
                console.log('📥 [WebSocket-Provider] 🔌 disconnect 수신:', {
                    reason,
                    timestamp: new Date().toISOString(),
                    socketId: socket.id
                });
                isConnectedRef.current = false;
            });

            // 모든 이벤트 수신 로깅 (개발용)
            socket.onAny((eventName: string, ...args: unknown[]) => {
                console.log('📥 [WebSocket-Provider] 이벤트 수신:', {
                    eventName,
                    argsCount: args.length,
                    timestamp: new Date().toISOString(),
                    socketId: socket.id
                });
            });

        } catch (error) {
            console.error('❌ [WebSocket-Provider] 연결 실패:', {
                error: error instanceof Error ? error.message : String(error),
                timestamp: new Date().toISOString()
            });
            isConnectedRef.current = false;
        }
    }, [userId, toast]);

    // 웹소켓 연결 해제
    const disconnect = useCallback(() => {
        if (socketRef.current) {
            console.log('🔌 [WebSocket-Provider] 수동 연결 해제', {
                socketId: socketRef.current.id,
                connected: socketRef.current.connected,
                timestamp: new Date().toISOString()
            });
            socketRef.current.disconnect();
            socketRef.current = null;
            isConnectedRef.current = false;
        } else {
            console.log('⚠️ [WebSocket-Provider] 해제할 연결이 없음');
        }
    }, []);

    const contextValue: WebSocketContextType = {
        connectForVideoGeneration,
        disconnect,
        isConnected: isConnectedRef.current,
    };

    return (
        <WebSocketContext.Provider value={contextValue}>
            {children}
        </WebSocketContext.Provider>
    );
}

interface ProvidersProps {
    children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
    return (
        <CreditProvider>
            <AuthProvider>
                <WebSocketNotificationProvider>
                    {children}
                    <Toaster />
                </WebSocketNotificationProvider>
            </AuthProvider>
        </CreditProvider>
    );
}
