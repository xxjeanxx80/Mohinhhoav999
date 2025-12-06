import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST') || 'smtp.gmail.com',
      port: parseInt(this.configService.get<string>('SMTP_PORT') || '587', 10),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASSWORD'),
      },
    });
  }

  async sendPasswordResetEmail(email: string, newPassword: string): Promise<void> {
    const mailOptions = {
      from: this.configService.get<string>('SMTP_FROM') || this.configService.get<string>('SMTP_USER'),
      to: email,
      subject: 'Mật khẩu mới - Beauty Booking Hub',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              border: 1px solid #ddd;
              border-radius: 5px;
            }
            .header {
              background-color: #f59e0b;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              padding: 20px;
              background-color: #f9fafb;
            }
            .password-box {
              background-color: white;
              padding: 15px;
              border: 2px solid #f59e0b;
              border-radius: 5px;
              text-align: center;
              font-size: 20px;
              font-weight: bold;
              color: #f59e0b;
              margin: 20px 0;
            }
            .footer {
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
            .warning {
              background-color: #fef3c7;
              padding: 15px;
              border-left: 4px solid #f59e0b;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Beauty Booking Hub</h1>
            </div>
            <div class="content">
              <h2>Yêu cầu đặt lại mật khẩu</h2>
              <p>Xin chào,</p>
              <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình. Mật khẩu mới của bạn là:</p>
              
              <div class="password-box">
                ${newPassword}
              </div>

              <div class="warning">
                <strong>⚠️ Lưu ý:</strong> Vui lòng đăng nhập ngay và thay đổi mật khẩu này để đảm bảo tính bảo mật cho tài khoản của bạn.
              </div>

              <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng liên hệ với chúng tôi ngay lập tức.</p>
            </div>
            <div class="footer">
              <p>Trân trọng,<br>Đội ngũ Beauty Booking Hub</p>
              <p>Email này được gửi tự động, vui lòng không trả lời email này.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${email}`, error instanceof Error ? error.stack : String(error));
      throw new Error('Failed to send password reset email');
    }
  }
}

