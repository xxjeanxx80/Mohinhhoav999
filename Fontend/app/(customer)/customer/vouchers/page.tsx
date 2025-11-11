"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Ticket, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"

export default function CustomerVouchers() {
  const { t } = useLanguage()
  const vouchers = [] // Empty state

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900" suppressHydrationWarning>{t.vouchersTitle}</h1>
        <p className="mt-2 text-slate-600" suppressHydrationWarning>{t.vouchersDescription}</p>
      </div>

      {vouchers.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="text-center py-12">
            <div className="flex justify-center mb-4">
              <Ticket className="w-16 h-16 text-slate-300" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-900 mb-2" suppressHydrationWarning>{t.noVouchersYet}</h3>
            <p className="text-slate-600 mb-6" suppressHydrationWarning>{t.noVouchersDescription}</p>
            <Link href="/spas">
              <Button className="bg-amber-500 hover:bg-amber-600" suppressHydrationWarning>
                {t.backToHome}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {vouchers.map((voucher, i) => (
            <Card key={i} className="border-0 shadow-sm hover:shadow-md transition overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-amber-500 p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <Ticket className="w-8 h-8" />
                  <span className="text-sm font-semibold">{voucher.discount}</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">{voucher.title}</h3>
                <p className="text-sm opacity-90">{voucher.description}</p>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600" suppressHydrationWarning>{t.expires}: {voucher.expiry}</span>
                  <Button size="sm" variant="outline" suppressHydrationWarning>
                    {t.use}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
