"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { CouponService, CouponDto } from "./services/CouponService"
import { useToast } from "@/hooks/use-toast"

export default function CouponManagement() {
    const [coupons, setCoupons] = useState<CouponDto[]>([])
    const [newCoupon, setNewCoupon] = useState({
        code: "",
        creditAmount: 0,
        expiresAt: "",
    })
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const handleAddCoupon = async () => {
        try {
            setIsLoading(true)
            const response = await CouponService.registerCoupon({
                code: newCoupon.code,
                creditAmount: newCoupon.creditAmount,
                expiresAt: newCoupon.expiresAt
            })

            if (response.success) {
                toast({ title: "성공", description: response.message, duration: 3000 })
                // 쿠폰 목록 새로고침
                await loadCoupons();
                // 입력 폼 초기화
                setNewCoupon({ code: "", creditAmount: 0, expiresAt: "" });
            } else {
                toast({ title: "오류", description: response.message, duration: 3000, variant: "destructive" })
            }
        } catch (error: Error | unknown) {
            toast({ title: "오류", description: error instanceof Error ? error.message : "쿠폰 등록에 실패했습니다.", duration: 3000, variant: "destructive" })
        } finally {
            setIsLoading(false)
        }
    }

    const handleToggleCoupon = async (code: string, expired: boolean) => {
        if (expired) {
            toast({ title: "오류", description: "만료된 쿠폰은 상태를 변경할 수 없습니다.", duration: 3000, variant: "destructive" })
            return;
        }

        try {
            const response = await CouponService.releaseCoupon(code);
            if (response.success) {
                toast({ title: "성공", description: response.message, duration: 3000 })
                await loadCoupons();
            } else {
                toast({ title: "오류", description: response.message, duration: 3000, variant: "destructive" })
            }
        } catch (error: Error | unknown) {
            toast({ title: "오류", description: error instanceof Error ? error.message : "쿠폰 상태 변경에 실패했습니다.", duration: 3000, variant: "destructive" })
        }
    }

    const formatCreditAmount = (amount: number) => {
        return new Intl.NumberFormat('ko-KR').format(amount)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    const loadCoupons = async () => {
        try {
            const response = await CouponService.getAllCoupons();
            if (response.success && response.coupons) {
                setCoupons(response.coupons);
            } else {
                toast({ title: "오류", description: response.message, duration: 3000, variant: "destructive" })
            }
        } catch {
            toast({ title: "오류", description: "쿠폰 목록을 불러오는데 실패했습니다.", duration: 3000, variant: "destructive" })
        }
    }

    // 컴포넌트 마운트 시 쿠폰 목록 로드
    useEffect(() => {
        loadCoupons();
    }, [])

    return (
        <div className="p-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>새 쿠폰 등록</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="code">쿠폰 코드</Label>
                            <Input
                                id="code"
                                value={newCoupon.code}
                                onChange={(e) =>
                                    setNewCoupon({ ...newCoupon, code: e.target.value })
                                }
                                placeholder="CREDIT2024"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="creditAmount">충전 크레딧</Label>
                            <Input
                                id="creditAmount"
                                type="number"
                                value={newCoupon.creditAmount}
                                onChange={(e) =>
                                    setNewCoupon({
                                        ...newCoupon,
                                        creditAmount: Number(e.target.value),
                                    })
                                }
                                placeholder="10000"
                                min="0"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="expiryDate">만료일</Label>
                            <Input
                                id="expiryDate"
                                type="datetime-local"
                                value={newCoupon.expiresAt}
                                onChange={(e) =>
                                    setNewCoupon({
                                        ...newCoupon,
                                        expiresAt: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>
                    <Button
                        className="mt-4"
                        onClick={handleAddCoupon}
                        disabled={isLoading || !newCoupon.code || !newCoupon.creditAmount || !newCoupon.expiresAt}
                    >
                        {isLoading ? "등록 중..." : "쿠폰 등록"}
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>쿠폰 목록</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>쿠폰 코드</TableHead>
                                <TableHead>충전 크레딧</TableHead>
                                <TableHead>생성일</TableHead>
                                <TableHead>만료일</TableHead>
                                <TableHead>상태</TableHead>
                                <TableHead>사용 횟수</TableHead>
                                <TableHead>관리</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {coupons.map((coupon) => (
                                <TableRow key={coupon.code}>
                                    <TableCell>{coupon.code}</TableCell>
                                    <TableCell>{formatCreditAmount(coupon.creditAmount)} 크레딧</TableCell>
                                    <TableCell>{formatDate(coupon.createdAt)}</TableCell>
                                    <TableCell>{formatDate(coupon.expiresAt)}</TableCell>
                                    <TableCell>
                                        {coupon.expired ? "만료됨" : "활성"}
                                    </TableCell>
                                    <TableCell>{coupon.redemptionCount}회</TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={!coupon.expired}
                                            onCheckedChange={() => handleToggleCoupon(coupon.code, coupon.expired)}
                                            disabled={coupon.expired}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
