"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Info, CreditCard, Trash2, AlertCircle } from "lucide-react";
import { BillingService, CreditResponse, CreditTransactionResponse } from "./services/BillingService";
import { toast } from "react-hot-toast";
import useSWR from 'swr';

// SWR fetcher 함수 (CouponService.validateCoupon 를 사용한다고 가정)
// FIXME: CouponService에 validateCoupon 메서드가 없습니다.
// const couponFetcher = (code: string) => CouponService.validateCoupon(code);

export default function BillingPage() {
  const [selectedPlan] = useState("20");
  const [balanceThreshold, setBalanceThreshold] = useState("");
  const [creditInfo, setCreditInfo] = useState<CreditResponse | null>(null);
  const [transactions, setTransactions] = useState<CreditTransactionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // useSWR 훅 사용 (couponCode가 있을 때만 실행) - 반환값 일단 사용 안 함
  useSWR(
    couponCode ? `coupon/${couponCode}` : null,
    // () => couponFetcher(couponCode), // couponFetcher 주석 처리됨
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    loadCreditInfo();
    loadTransactionHistory();
    // fetchPlans(); // fetchPlans 호출 주석 처리
  }, []);

  const loadCreditInfo = async () => {
    try {
      const response = await BillingService.getCurrentCredit();
      setCreditInfo(response);
    } catch /* error */ { // error 변수 제거
      toast.error("크레딧 정보를 불러오는데 실패했습니다.");
    }
  };

  const loadTransactionHistory = async () => {
    try {
      const response = await BillingService.getCreditHistory();
      setTransactions(response);
    } catch /* error */ { // error 변수 제거
      toast.error("거래 내역을 불러오는데 실패했습니다.");
    }
  };

  /* // fetchPlans 함수 제거 (BillingService.getPlans 없음, plans 상태 없음)
  const fetchPlans = async () => {
    try {
      // const data = await BillingService.getPlans();
      // setPlans(data);
    } catch {
      toast.error("요금제를 불러오는데 실패했습니다.");
    } finally {
      // setIsLoadingPlans(false);
    }
  };
  */

  const handlePurchaseCredit = async () => {
    if (isLoading) return;

    const amount = selectedPlan === "custom" ? parseInt(balanceThreshold) : parseInt(selectedPlan);

    if (amount < 10) {
      toast.error("최소 10 크레딧부터 구매 가능합니다.");
      return;
    }

    setIsLoading(true);

    try {
      await BillingService.chargeCredit({ amount });
      toast.success("크레딧 충전이 완료되었습니다.");
      loadCreditInfo();
      loadTransactionHistory();
    } catch /* error */ { // error 변수 제거
      toast.error("크레딧 충전에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("쿠폰 코드를 입력해주세요.");
      return;
    }
    setIsApplyingCoupon(true);
    try {
      // FIXME: CouponService.validateCoupon 메서드가 없습니다.
      // const coupon = await CouponService.validateCoupon(couponCode);
      // if (coupon && coupon.isValid) {
      //   // setAppliedCoupon(coupon); // appliedCoupon 상태 제거됨
      //   toast.success(`쿠폰(${coupon.code})이 적용되었습니다.`);
      // } else {
      //   toast.error(coupon?.message || "유효하지 않은 쿠폰입니다.");
      //   // setAppliedCoupon(null);
      // }
      toast.error("쿠폰 검증 기능이 아직 구현되지 않았습니다."); // warn -> error
    } catch (err: unknown) {
      toast.error("쿠폰 적용 중 오류가 발생했습니다.");
      console.error("Coupon application error:", err);
      // setAppliedCoupon(null);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-[1200px]">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">크레딧 충전</h1>
            <p className="text-gray-400">
              크레딧을 충전하여 AI 영상을 생성하세요
            </p>
          </div>
          <Button variant="outline" className="h-10 bg-black/40 backdrop-blur-xl border-white/20 text-white hover:bg-black/60 hover:border-white/30">
            청구지 주소 수정
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <Card className="p-6 border border-white/20 bg-black/40 backdrop-blur-xl">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-xl font-semibold text-white">크레딧 현황</h2>
                <div className="flex items-center text-gray-400 text-sm">
                  <Info className="h-4 w-4 mr-1" />
                  <span>
                    크레딧 잔액은 최근 사용량이 반영되는데 최대 1시간이 소요될 수 있습니다
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-400 mb-1">
                    현재 크레딧
                  </p>
                  <p className="text-3xl font-semibold text-white">{creditInfo?.currentCredit || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">
                    이번 달 사용량
                  </p>
                  <p className="text-3xl font-semibold text-white">
                    {transactions.reduce((acc, curr) => curr.amount < 0 ? acc + Math.abs(curr.amount) : acc, 0)}
                  </p>
                </div>
              </div>

              <div className="border border-white/20 rounded-md p-4 mb-6 bg-black/40 backdrop-blur-xl">
                <div className="flex items-center gap-2 text-amber-400 mb-2">
                  <AlertCircle className="h-5 w-5" />
                  <h3 className="font-medium text-white">크레딧 알림 설정</h3>
                </div>
                <p className="text-gray-400 mb-4">
                  크레딧이 설정한 값 이하로 떨어지면 이메일로 알려드립니다
                </p>
                <div className="flex gap-2 items-center">
                  <span className="text-sm font-medium text-white">크레딧</span>
                  <Input
                    type="number"
                    value={balanceThreshold}
                    onChange={(e) => setBalanceThreshold(e.target.value)}
                    className="w-32 h-9 bg-black/40 backdrop-blur-xl border-white/20 text-white"
                    placeholder="0"
                  />
                  <Button variant="outline" size="sm" className="h-9 bg-black/40 backdrop-blur-xl border-white/20 text-white hover:bg-black/60 hover:border-white/30">
                    설정
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" className="bg-black/40 backdrop-blur-xl border-white/20 text-white hover:bg-black/60 hover:border-white/30">크레딧 내역</Button>
              <Button variant="outline" className="bg-black/40 backdrop-blur-xl border-white/20 text-white hover:bg-black/60 hover:border-white/30">사용 내역</Button>
            </div>
          </Card>

          {/* Right Column - Add Credits */}
          <Card className="p-6 border border-white/20 bg-black/40 backdrop-blur-xl">
            <h2 className="text-xl font-semibold mb-4 text-white">크레딧 구매</h2>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-medium text-white">구매할 크레딧</h3>
                <div className="flex items-center text-gray-400 text-sm">
                  <Info className="h-4 w-4 mr-1" />
                  <span>1000원 = 10크레딧 (최소 10크레딧부터 구매 가능)</span>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  value={balanceThreshold}
                  onChange={(e) => setBalanceThreshold(e.target.value)}
                  className="w-32 h-9 bg-black/40 backdrop-blur-xl border-white/20 text-white"
                  placeholder="크레딧 수량"
                  min="10"
                />
                <span className="text-gray-400">크레딧</span>
                <span className="text-gray-400 ml-2">
                  = ₩{balanceThreshold ? (parseInt(balanceThreshold) * 100).toLocaleString() : '0'}
                </span>
              </div>
            </div>

            <div className="flex gap-2 mb-6">
              <Button
                className="bg-sky-500 hover:bg-sky-600 text-white"
                onClick={handlePurchaseCredit}
                disabled={isLoading || !balanceThreshold || parseInt(balanceThreshold) < 10}
              >
                {isLoading ? "처리중..." : `${balanceThreshold || '0'} 크레딧 구매하기`}
              </Button>
              <Input
                placeholder="쿠폰 코드 입력"
                className="max-w-[200px] bg-black/40 backdrop-blur-xl border-white/20 text-white"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
              <Button
                variant="secondary"
                className="bg-black/40 backdrop-blur-xl border-white/20 text-white hover:bg-black/60 hover:border-white/30"
                onClick={handleApplyCoupon}
                disabled={isApplyingCoupon || !couponCode.trim()}
              >
                {isApplyingCoupon ? "적용 중..." : "적용"}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium text-white">자동 충전 설정</span>
              <Button variant="outline" size="sm" className="bg-black/40 backdrop-blur-xl border-white/20 text-white hover:bg-black/60 hover:border-white/30">
                설정하기
              </Button>
            </div>
          </Card>

          {/* Payment Methods */}
          <Card className="p-6 border border-white/20 bg-black/40 backdrop-blur-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">결제 수단</h2>
              <Button className="bg-sky-500 hover:bg-sky-600 text-white">추가</Button>
            </div>

            <div className="flex justify-between items-center p-2">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-white" />
                <div>
                  <span className="font-medium text-white">마스터카드</span> **** 7726
                  <div className="text-sm text-gray-400">
                    만료일: 2027/04
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-white hover:bg-black/60">
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          </Card>

          {/* Receipts */}
          <Card className="p-6 border border-white/20 bg-black/40 backdrop-blur-xl">
            <h2 className="text-xl font-semibold mb-4 text-white">결제 내역</h2>

            <div className="grid grid-cols-2 text-sm text-gray-400 mb-2">
              <span>날짜</span>
              <span className="text-right">금액</span>
            </div>

            <div className="border-t border-white/20 py-4 space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex justify-between items-center">
                  <span className="text-white">{new Date(transaction.createdAt).toLocaleString()}</span>
                  <div className="flex items-center gap-4">
                    <span className={`${transaction.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount} 크레딧
                    </span>
                    <span className="text-gray-400">{transaction.reason}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
