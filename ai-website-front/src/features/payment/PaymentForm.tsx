"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CreditCard, CheckCircle, Lock } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// 결제 상태 타입

// 결제 상태 타입
type PaymentStatus = "idle" | "processing" | "success" | "error";

// 로딩 컴포넌트
function LoadingComponent() {
  return <div className="p-4 text-white">로딩 중...</div>;
}

// 실제 결제 폼 내용을 담당하는 컴포넌트
function PaymentFormContent() {
  const searchParams = useSearchParams();
  const planTitle = searchParams.get("plan") || "";
  const planPrice = searchParams.get("price") || "";
  const planCredits = searchParams.get("credits") || "";

  const [paymentMethod, setPaymentMethod] = useState<string>("card");
  const [cardNumber, setCardNumber] = useState<string>("");
  const [cardExpiry, setCardExpiry] = useState<string>("");
  const [cardCvc, setCardCvc] = useState<string>("");
  const [cardName, setCardName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // 결제 처리 함수
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 폼 유효성 검사
    if (!cardNumber || !cardExpiry || !cardCvc || !cardName || !email) {
      setErrorMessage("모든 필드를 입력해주세요.");
      setStatus("error");
      return;
    }

    setStatus("processing");

    try {
      // 여기에 실제 결제 처리 API 호출 코드를 추가
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 결제 처리 시뮬레이션

      setStatus("success");
    } catch (_) {
      setStatus("error");
      setErrorMessage("결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  // 결제 완료 화면
  if (status === "success") {
    return (
      <div className="bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200 min-h-screen py-12 relative overflow-hidden">
        {/* 배경 장식 요소 */}
        <div className="absolute top-0 left-0 right-0 h-full overflow-hidden opacity-10 pointer-events-none">
          <div className="absolute -top-[10%] -right-[10%] w-[35%] h-[35%] rounded-full bg-sky-300 blur-[100px]" />
          <div className="absolute top-[10%] -left-[5%] w-[25%] h-[25%] rounded-full bg-blue-300 blur-[120px]" />
        </div>

        <div className="container max-w-2xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-6"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.7, type: "spring" }}
              className="flex justify-center mb-8"
            >
              <div className="h-24 w-24 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="h-14 w-14 text-white" />
              </div>
            </motion.div>

            <Card className="border-green-100 bg-gradient-to-br from-white to-green-50 shadow-lg overflow-hidden">
              <CardContent className="pt-8 pb-10 text-center">
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-3xl font-bold mb-3 text-gray-900"
                >
                  결제가 완료되었습니다!
                </motion.h2>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-lg text-gray-600 mb-8"
                >
                  <span className="font-medium text-green-600">
                    {planTitle} 플랜
                  </span>{" "}
                  구매가 성공적으로 완료되었습니다.
                  <br />
                  <span className="font-medium">{planCredits} 크레딧</span>이
                  계정에 추가되었습니다.
                </motion.p>

                <Separator className="my-6" />

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="flex gap-4 justify-center mt-6"
                >
                  <Link href="/dashboard">
                    <Button className="bg-sky-500 hover:bg-sky-600 active:bg-sky-700 shadow-sm hover:shadow transition-all duration-300 px-6">
                      대시보드로 이동
                    </Button>
                  </Link>
                  <Link href="/generation/video">
                    <Button
                      variant="outline"
                      className="hover:bg-sky-50 border-sky-200 text-sky-600 shadow-sm hover:shadow transition-all duration-300"
                    >
                      영상 생성하기
                    </Button>
                  </Link>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-6xl bg-black">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Payment</h1>
          <p className="text-gray-400">
            Complete your payment
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - Payment Information */}
        <Card className="p-6 border border-white/20 bg-black/40 backdrop-blur-xl">
          <h2 className="text-xl font-semibold mb-4 text-white">Payment Information</h2>

          <RadioGroup
            value={paymentMethod}
            onValueChange={setPaymentMethod}
            className="space-y-4 mb-6"
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="card" id="card" className="border-white/20 text-sky-500" />
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-white" />
                <Label htmlFor="card" className="font-medium text-white">
                  Credit Card
                </Label>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <RadioGroupItem value="paypal" id="paypal" className="border-white/20 text-sky-500" />
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-white" />
                <Label htmlFor="paypal" className="font-medium text-white">
                  PayPal
                </Label>
              </div>
            </div>
          </RadioGroup>

          {paymentMethod === "card" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="cardNumber" className="text-white">Card Number</Label>
                <Input
                  id="cardNumber"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  className="mt-1 bg-black/40 backdrop-blur-xl border-white/20 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiryDate" className="text-white">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="MM/YY"
                    className="mt-1 bg-black/40 backdrop-blur-xl border-white/20 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="cvv" className="text-white">CVV</Label>
                  <Input
                    id="cvv"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    placeholder="123"
                    className="mt-1 bg-black/40 backdrop-blur-xl border-white/20 text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="name" className="text-white">Name on Card</Label>
                <Input
                  id="name"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="John Doe"
                  className="mt-1 bg-black/40 backdrop-blur-xl border-white/20 text-white"
                />
              </div>
            </div>
          )}

          {paymentMethod === "paypal" && (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">
                You will be redirected to PayPal to complete your payment.
              </p>
              <Button className="bg-sky-500 hover:bg-sky-600 text-white">
                Continue with PayPal
              </Button>
            </div>
          )}
        </Card>

        {/* Right Column - Order Summary */}
        <Card className="p-6 border border-white/20 bg-black/40 backdrop-blur-xl">
          <h2 className="text-xl font-semibold mb-4 text-white">Order Summary</h2>

          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Subtotal</span>
              <span className="text-white">${planPrice}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">Tax</span>
              <span className="text-white">$2.00</span>
            </div>

            <div className="border-t border-white/20 pt-4">
              <div className="flex justify-between">
                <span className="font-medium text-white">Total</span>
                <span className="font-medium text-white">${planPrice}</span>
              </div>
            </div>

            <div className="pt-4">
              <Button
                className="w-full bg-sky-500 hover:bg-sky-600 text-white"
                onClick={handleSubmit}
                disabled={status === "processing"}
              >
                {status === "processing" ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    처리 중...
                  </span>
                ) : (
                  "Pay $22.00"
                )}
              </Button>
            </div>

            <div className="text-center text-sm text-gray-400">
              <p>By completing your purchase, you agree to our</p>
              <div className="flex justify-center gap-2 mt-1">
                <a href="#" className="text-sky-400 hover:text-sky-300">Terms of Service</a>
                <span>and</span>
                <a href="#" className="text-sky-400 hover:text-sky-300">Privacy Policy</a>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// 결제 폼 컴포넌트
export default function PaymentForm() {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <PaymentFormContent />
    </Suspense>
  );
}
