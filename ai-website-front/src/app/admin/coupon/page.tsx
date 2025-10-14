import { Metadata } from "next"
import CouponManagement from "@/features/admin/Coupon"

export const metadata: Metadata = {
    title: "쿠폰 관리 | 관리자",
    description: "쿠폰 등록 및 관리 페이지입니다.",
}

export default function CouponPage() {
    return <CouponManagement />
}
