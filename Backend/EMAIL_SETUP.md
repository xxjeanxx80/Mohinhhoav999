# Cấu hình Email Service

## Biến môi trường cần thiết

Thêm các biến sau vào file `.env` của Backend:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-email@gmail.com
```

## Cấu hình Gmail

1. Bật 2-Step Verification cho tài khoản Gmail của bạn
2. Tạo App Password:
   - Vào Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Tạo app password mới cho "Mail"
   - Sử dụng mật khẩu này cho `SMTP_PASSWORD`

## Test email service

Sau khi cấu hình, bạn có thể test bằng cách gọi endpoint:
```
POST /auth/forgot-password
Body: { "email": "test@example.com" }
```

## Lưu ý

- Nếu không cấu hình SMTP, chức năng quên mật khẩu sẽ không hoạt động
- Email sẽ được gửi với mật khẩu mới được tạo tự động
- Người dùng nên đổi mật khẩu ngay sau khi đăng nhập

