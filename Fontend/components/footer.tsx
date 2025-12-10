"use client"

import Link from "next/link"
import { Logo } from "@/components/brand/logo"

export function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Column 1: Company Information */}
          <div>
            <div className="mb-4">
              <Logo size="md" showLink={true} variant="default" />
            </div>
            <p className="text-base text-slate-700 mb-2 leading-relaxed">
              Công ty 1 Mình tao
            </p>
            <p className="text-base text-slate-600 mb-2 leading-relaxed">
              Giấy phép đăng ký : 12345678
            </p>
            <p className="text-base text-slate-600 mb-4 leading-relaxed">
              Cơ quan cấp: Không cấp
            </p>
          </div>

          {/* Column 2: Addresses */}
          <div>
            <h3 className="font-bold text-slate-900 mb-4 text-lg">Địa chỉ</h3>
            <div className="space-y-3 text-base text-slate-700 leading-relaxed">
              <p>
                <span className="font-semibold">Trụ sở tại Hà Nội:</span><br />
                Số 1 Trịnh Văn Bô
              </p>
            </div>
          </div>

          {/* Column 3: About Us */}
          <div>
            <h3 className="font-bold text-slate-900 mb-4 text-lg">Về chúng tôi</h3>
            <ul className="space-y-2 text-base text-slate-700">
              <li>
                <Link href="/about" className="hover:text-amber-500 transition">
                  Giới thiệu MOGGO
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-amber-500 transition">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/recruitment" className="hover:text-amber-500 transition">
                  Tuyển dụng
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-amber-500 transition">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: For Customers */}
          <div>
            <h3 className="font-bold text-slate-900 mb-4 text-lg">Đối với khách hàng</h3>
            <ul className="space-y-2 text-base text-slate-700">
              <li>
                <Link href="/payment-guide" className="hover:text-amber-500 transition">
                  Hướng dẫn thanh toán
                </Link>
              </li>
              <li>
                <Link href="/shopping-guide" className="hover:text-amber-500 transition">
                  Hướng dẫn mua hàng
                </Link>
              </li>
              <li>
                <Link href="/booking-policy" className="hover:text-amber-500 transition">
                  Chính sách đặt lịch
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-amber-500 transition">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link href="/terms-of-use" className="hover:text-amber-500 transition">
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link href="/partner-terms" className="hover:text-amber-500 transition">
                  Điều khoản đối tác
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-200 pt-6 flex items-center justify-between">
          <p className="text-base text-slate-500">Copyright © MOGGO. All Rights Reserved.</p>
          <div className="flex items-center gap-3">
            <a href="#" className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-amber-500 hover:text-white transition">
              <span className="text-sm font-bold">f</span>
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-amber-500 hover:text-white transition">
              <span className="text-sm font-bold">in</span>
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-amber-500 hover:text-white transition">
              <span className="text-sm font-bold">yt</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
