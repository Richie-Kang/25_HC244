"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import apiClient from '@/lib/api/apiClient';

const Contact = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [inquiryType, setInquiryType] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const inquiryTypes = [
        { value: 'model', label: '브랜드에 맞는 모델 생성' },
        { value: 'video', label: '영상 생성' },
        { value: 'other', label: '기타' }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // 선택된 유형을 문의 내용에 포함
            const selectedTypeLabel = inquiryTypes.find(type => type.value === inquiryType)?.label;
            const fullMessage = inquiryType
                ? `[문의 유형: ${selectedTypeLabel}]\n\n${message}`
                : message;

            const response = await apiClient.post('/contact', {
                name,
                email,
                message: fullMessage
            });

            setError('');
            setSuccess('문의가 성공적으로 전송되었습니다.');
            setName('');
            setEmail('');
            setMessage('');
            setInquiryType('');
        } catch (error) {
            // apiClient의 에러 처리를 활용
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { data?: { message?: string } }; request?: unknown };
                if (axiosError.response) {
                    // 서버에서 응답한 에러 메시지 사용
                    const errorMessage = axiosError.response.data?.message || '문의 전송에 실패했습니다.';
                    setError(errorMessage);
                } else if (axiosError.request) {
                    setError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
                } else {
                    setError('문의 전송 중 오류가 발생했습니다.');
                }
            } else {
                setError('문의 전송 중 알 수 없는 오류가 발생했습니다.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-6xl mx-auto px-8 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
                    {/* 왼쪽: 회사 정보 및 문의 안내 */}
                    <div className="lg:col-span-2 space-y-12">
                        <div>
                            <h1 className="text-4xl lg:text-5xl font-light text-white mb-6 leading-tight">
                                문의하기
                            </h1>
                            <p className="text-lg text-gray-300 leading-relaxed mb-8">
                                전문적인 서비스와 최고의 경험을 제공하기 위해 최선을 다하고 있습니다.
                                궁금한 점이나 문의사항이 있으시면 언제든 연락해 주세요.
                            </p>
                        </div>

                        <div className="space-y-8">
                            <div className="border-l-2 border-white pl-6">
                                <h3 className="text-xl font-medium text-white mb-3">
                                    전문 상담
                                </h3>
                                <p className="text-gray-300 leading-relaxed">
                                    풍부한 경험을 바탕으로 한 전문가들이
                                    고객의 요구사항을 정확히 파악하여 최적의 솔루션을 제공합니다.
                                </p>
                            </div>

                            <div className="border-l-2 border-white pl-6">
                                <h3 className="text-xl font-medium text-white mb-3">
                                    신속한 대응
                                </h3>
                                <p className="text-gray-300 leading-relaxed">
                                    모든 문의에 대해 영업일 기준 24시간 이내 회신하며,
                                    긴급한 사안의 경우 우선적으로 처리됩니다.
                                </p>
                            </div>

                            <div className="border-l-2 border-white pl-6">
                                <h3 className="text-xl font-medium text-white mb-3">
                                    안전한 처리
                                </h3>
                                <p className="text-gray-300 leading-relaxed">
                                    고객의 모든 정보는 엄격한 보안 정책에 따라 관리되며,
                                    개인정보보호법을 준수하여 안전하게 처리됩니다.
                                </p>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-gray-700">
                            <h4 className="text-lg font-medium text-white mb-4">
                                운영 시간
                            </h4>
                            <div className="space-y-2 text-gray-300">
                                <p>평일: 오전 9:00 - 오후 6:00</p>
                                <p>토요일: 오전 9:00 - 오후 1:00</p>
                                <p>일요일 및 공휴일: 휴무</p>
                            </div>
                        </div>
                    </div>

                    {/* 오른쪽: 문의 폼 */}
                    <div className="lg:col-span-3">
                        <div className="max-w-lg">
                            <div className="mb-8">
                                <h2 className="text-2xl font-light text-white mb-3">
                                    문의 양식
                                </h2>
                                <p className="text-gray-300">
                                    정확한 상담을 위해 아래 정보를 상세히 작성해 주세요.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div>
                                    <label htmlFor="inquiryType" className="block text-sm font-medium text-white mb-2">
                                        문의 유형 *
                                    </label>
                                    <Select value={inquiryType} onValueChange={setInquiryType} required>
                                        <SelectTrigger className="w-full border-0 border-b-2 border-gray-600 bg-transparent px-0 py-3 text-white focus:border-white focus:ring-0 text-base rounded-none h-auto">
                                            <SelectValue placeholder="문의 유형을 선택해 주세요" className="text-gray-400" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-black border-gray-600">
                                            {inquiryTypes.map((type) => (
                                                <SelectItem
                                                    key={type.value}
                                                    value={type.value}
                                                    className="text-white hover:bg-gray-800 hover:text-white focus:bg-gray-800 focus:text-white"
                                                >
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                                        성함 *
                                    </label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        placeholder="성함을 입력해 주세요"
                                        className="w-full border-0 border-b-2 border-gray-600 bg-transparent px-0 py-3 text-white placeholder-gray-400 focus:border-white focus:ring-0 text-lg"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                                        이메일 주소 *
                                    </label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        placeholder="이메일 주소를 입력해 주세요"
                                        className="w-full border-0 border-b-2 border-gray-600 bg-transparent px-0 py-3 text-white placeholder-gray-400 focus:border-white focus:ring-0 text-lg"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-white mb-2">
                                        문의 내용 *
                                    </label>
                                    <textarea
                                        id="message"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        required
                                        rows={6}
                                        placeholder="문의하실 내용을 자세히 작성해 주세요"
                                        className="w-full border-0 border-b-2 border-gray-600 bg-transparent px-0 py-3 text-white placeholder-gray-400 focus:border-white focus:outline-none resize-none text-lg"
                                    />
                                </div>

                                {error && (
                                    <div className="py-4">
                                        <p className="text-red-400 text-sm">
                                            {error}
                                        </p>
                                    </div>
                                )}

                                {success && (
                                    <div className="py-4">
                                        <p className="text-green-400 text-sm">
                                            {success}
                                        </p>
                                    </div>
                                )}

                                <div className="pt-6">
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="bg-white hover:bg-gray-200 text-black font-medium py-4 px-8 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-3"></div>
                                                전송 중...
                                            </div>
                                        ) : (
                                            '문의 전송'
                                        )}
                                    </Button>
                                </div>
                            </form>

                            <div className="mt-8 pt-6 border-t border-gray-700">
                                <p className="text-sm text-gray-400">
                                    문의해 주셔서 감사합니다. 신속하고 정확한 답변을 위해 최선을 다하겠습니다.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;