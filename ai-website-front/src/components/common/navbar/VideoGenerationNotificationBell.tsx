import React, { useEffect, useRef, useState, useCallback } from "react";
import { Bell, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GenerationNotificationService, GenerationNotificationResponse } from "@/features/admin/services/GenerationNotificationService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/features/user/AuthContext";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import CreationDetail from "@/features/video/creation/CreationDetail";

export const VideoGenerationNotificationBell = () => {
    const { toast } = useToast();
    const { id: userId } = useAuth();
    const [notifications, setNotifications] = useState<GenerationNotificationResponse[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const refObj = useRef<HTMLDivElement | null>(null);
    const [selectedNotificationId, setSelectedNotificationId] = useState<number | null>(null);

    // 알림 목록 조회
    const fetchNotifications = useCallback(async (showLoading = false) => {
        if (!userId) return;
        
        try {
            if (showLoading) {
                setIsLoading(true);
            }
            
            const response = await GenerationNotificationService.getNotifications(0, 10);
            setNotifications(response.notifications);
            
        } catch (error) {
            console.error("알림 조회 오류:", error);
            toast({
                title: "알림 조회 실패",
                description: "알림을 불러오는데 실패했습니다.",
                variant: "destructive",
            });
        } finally {
            if (showLoading) {
                setIsLoading(false);
            }
        }
    }, [userId, toast]);

    // 알림 메뉴가 열릴 때 데이터 가져오기
    useEffect(() => {
        if (isOpen && userId) {
            fetchNotifications(true);
        }
    }, [isOpen, userId, fetchNotifications]);

    // 바깥 클릭 또는 ESC로 닫기
    useEffect(() => {
        if (!isOpen) return;

        const handleClick = (e: MouseEvent) => {
            if (refObj.current && !refObj.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };

        document.addEventListener('mousedown', handleClick);
        document.addEventListener('keydown', handleEsc);

        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen]);

    // 수동 새로고침
    const handleRefresh = useCallback(() => {
        fetchNotifications(true);
    }, [fetchNotifications]);

    // 알림 클릭 처리
    const handleNotificationClick = useCallback((notification: GenerationNotificationResponse) => {
        if (notification.status === 'COMPLETED') {
            if (notification.videoId) {
                // 영상 ID가 있는 경우 상세 보기 모달 열기
                setSelectedNotificationId(notification.videoId);
                setIsOpen(false);
            } else {
                // 영상 ID가 없는 경우 내 작업물 페이지로 이동
                toast({ 
                    title: "작업 완료", 
                    description: "작업이 완료되었습니다! 내 작업물에서 확인하세요.", 
                    duration: 4000 
                });
                window.location.href = '/my';
            }
        } else if (notification.status === 'PROCESSING') {
            toast({ 
                title: "작업 처리 중", 
                description: "작업이 아직 처리 중입니다. 잠시 후 다시 확인해주세요.", 
                duration: 3000 
            });
        } else if (notification.status === 'FAILED') {
            const errorMsg = notification.errorMessage || '알 수 없는 오류가 발생했습니다.';
            toast({ 
                title: "작업 실패", 
                description: errorMsg, 
                duration: 5000, 
                variant: "destructive" 
            });
        } else if (notification.status === 'REQUESTED') {
            toast({ 
                title: "작업 대기 중", 
                description: "작업 요청이 대기 중입니다.", 
                duration: 3000 
            });
        }
    }, [toast]);

    // 처리 중인 알림 개수 계산
    const processingCount = notifications.filter(n => n.status === 'PROCESSING').length;
    const hasNotifications = notifications.length > 0;

    return (
        <div className="relative" ref={refObj}>
            <Button
                variant="ghost"
                size="icon"
                className="relative hover:text-gray-100 transition-colors duration-300"
                onClick={() => setIsOpen((prev) => !prev)}
            >
                <Bell className="w-5 h-5 text-gray-300" />
                {hasNotifications && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-gray-400 rounded-full" />
                )}
                {processingCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                        {processingCount}
                    </span>
                )}
            </Button>
            
            {isOpen && (
                <div className="fixed right-0 top-16 w-80 bg-black/70 border border-gray-800/50 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden z-50">
                    <div className="flex justify-between items-center px-4 py-2 border-b border-gray-800/50">
                        <span className="text-sm font-medium text-white">알림</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRefresh}
                            className="h-8 px-2 text-xs text-gray-200 hover:text-white hover:bg-gray-700/30"
                            disabled={isLoading}
                        >
                            <Loader2 className={`w-3 h-3 mr-1 text-gray-400 ${isLoading ? 'animate-spin' : ''}`} /> 
                            새로고침
                        </Button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex justify-center items-center p-4">
                                <Loader2 className="w-5 h-5 text-gray-300 animate-spin" />
                            </div>
                        ) : notifications.length > 0 ? (
                            <div className="divide-y divide-gray-800/50">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className="p-4 flex items-center gap-2 transition-colors hover:bg-black/60 cursor-pointer"
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        {notification.status === "PROCESSING" && (
                                            <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                                        )}
                                        {notification.status === "COMPLETED" && (
                                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                                        )}
                                        {notification.status === "FAILED" && (
                                            <XCircle className="w-4 h-4 text-red-400" />
                                        )}
                                        {notification.status === "REQUESTED" && (
                                            <div className="w-4 h-4 bg-gray-400 rounded-full" />
                                        )}
                                        
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-200 mb-1 text-left">
                                                {notification.title.length > 25 ? notification.title.slice(0, 25) + '...' : notification.title}
                                            </p>
                                            
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs text-gray-400">
                                                    {notification.status === "COMPLETED" ? "완료" :
                                                     notification.status === "PROCESSING" ? "처리 중" :
                                                     notification.status === "FAILED" ? "실패" :
                                                     "대기 중"}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(notification.updatedAt).toLocaleDateString('ko-KR', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                            
                                            {notification.status === "FAILED" && notification.errorMessage && (
                                                <p className="text-xs text-red-400 mt-1 text-left truncate">
                                                    {notification.errorMessage}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 text-center text-gray-500">
                                알림이 없습니다
                            </div>
                        )}
                    </div>
                </div>
            )}

            {selectedNotificationId !== null && (
                <Dialog open={selectedNotificationId !== null} onOpenChange={(isOpenDialog) => {
                    if (!isOpenDialog) {
                        setSelectedNotificationId(null);
                    }
                }}>
                    <DialogContent className="max-w-4xl w-full h-[90vh] md:h-[85vh] p-0 bg-transparent border-none overflow-hidden flex items-center justify-center">
                        <VisuallyHidden.Root>
                            <DialogTitle>비디오 상세 보기</DialogTitle>
                        </VisuallyHidden.Root>
                        <CreationDetail
                            videoId={selectedNotificationId}
                            onBack={() => setSelectedNotificationId(null)}
                        />
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}; 