"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Ticket, ArrowRight, Copy, Sparkles } from "lucide-react"
import Link from "next/link"
import { useVouchers } from "@/hooks/use-vouchers"
import { useToast } from "@/hooks/use-toast"

export default function CustomerVouchers() {
  const { vouchers, loading } = useVouchers()
  const { toast } = useToast()

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({
      title: "Đã sao chép",
      description: `Mã voucher ${code} đã được sao chép`,
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Đang tải voucher...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Ticket className="w-8 h-8 text-amber-500" />
          Voucher giảm giá
        </h1>
        <p className="mt-2 text-slate-600">Sao chép mã voucher và sử dụng khi đặt lịch</p>
      </div>

      {vouchers.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="text-center py-12">
            <div className="flex justify-center mb-4">
              <Ticket className="w-16 h-16 text-slate-300" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-900 mb-2">Chưa có voucher nào</h3>
            <p className="text-slate-600 mb-6">Hiện tại chưa có voucher giảm giá nào</p>
            <Link href="/spas">
              <Button className="bg-amber-500 hover:bg-amber-600">
                Khám phá spa
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.isArray(vouchers) && vouchers.map((voucher) => (
            <Card key={voucher.id} className="border-0 shadow-sm hover:shadow-md transition overflow-hidden">
              <div className={`p-6 text-white relative overflow-hidden ${
                voucher.isGlobal 
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                  : 'bg-gradient-to-br from-amber-500 to-orange-500'
              }`}>
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {voucher.isGlobal ? (
                        <Sparkles className="w-6 h-6" />
                      ) : (
                        <Ticket className="w-6 h-6" />
                      )}
                      <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">
                        {voucher.isGlobal ? 'TOÀN HỆ THỐNG' : voucher.spa?.name}
                      </span>
                    </div>
                    <span className="text-2xl font-bold">{voucher.discountPercent}%</span>
                  </div>
                  
                  <h3 className="font-bold text-lg mb-2">
                    Giảm {voucher.discountPercent}%
                  </h3>
                  <p className="text-sm opacity-90 mb-3">
                    {voucher.isGlobal 
                      ? 'Áp dụng cho tất cả spa' 
                      : `Chỉ áp dụng tại ${voucher.spa?.name}`
                    }
                  </p>
                  <div className="text-xs opacity-75">
                    {voucher.expiresAt 
                      ? `Hết hạn: ${new Date(voucher.expiresAt).toLocaleDateString('vi-VN')}`
                      : 'Không hết hạn'
                    }
                  </div>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-mono bg-slate-100 px-3 py-2 rounded border-2 border-dashed border-slate-300">
                    {voucher.code}
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => copyCode(voucher.code)}
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Sao chép
                  </Button>
                </div>
                <p className="text-xs text-slate-500 mt-2 text-center">
                  Sao chép mã và nhập khi đặt lịch để được giảm giá
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
