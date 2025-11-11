import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { Booking, BookingStatus } from '../bookings/entities/booking.entity';
import { User } from '../users/entities/user.entity';
import { SendNotificationDto } from './dto/send-notification.dto';
import { Notification, NotificationChannel, NotificationStatus } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification) private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(Booking) private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async send(dto: SendNotificationDto) {
    if (dto.userId) {
      // Send to specific user
      const notification = this.notificationRepository.create({
        channel: dto.channel,
        user: { id: dto.userId } as any,
        payload: { message: dto.message, meta: dto.meta ?? null },
        status: NotificationStatus.QUEUED,
      });

      const saved = await this.notificationRepository.save(notification);
      saved.status = NotificationStatus.SENT;
      const updated = await this.notificationRepository.save(saved);

      return new ApiResponseDto({ 
        success: true, 
        message: 'Notification dispatched.', 
        data: updated 
      });
    } else {
      // Broadcast to all users
      const users = await this.userRepository.find({
        select: ['id'],
      });

      if (users.length === 0) {
        return new ApiResponseDto({ 
          success: false, 
          message: 'No users found to send notification to.', 
          data: null 
        });
      }

      // Create notification for each user
      const notifications = users.map(user => 
        this.notificationRepository.create({
          channel: dto.channel,
          user: { id: user.id } as any,
          payload: { message: dto.message, meta: dto.meta ?? null },
          status: NotificationStatus.QUEUED,
        })
      );

      const saved = await this.notificationRepository.save(notifications);
      
      // Update all to SENT status
      saved.forEach(n => n.status = NotificationStatus.SENT);
      const updated = await this.notificationRepository.save(saved);

      return new ApiResponseDto({ 
        success: true, 
        message: `Notification dispatched to ${updated.length} users.`, 
        data: { count: updated.length, notifications: updated.slice(0, 5) } // Return first 5 as sample
      });
    }
  }

  async findAll() {
    const notifications = await this.notificationRepository.find({ order: { createdAt: 'DESC' } });
    return new ApiResponseDto({ success: true, message: 'Notifications retrieved.', data: notifications });
  }

  async findByUser(userId: number) {
    const notifications = await this.notificationRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
    return new ApiResponseDto({ success: true, message: 'User notifications retrieved.', data: notifications });
  }

  async findBookingNotifications(userId: number) {
    const bookings = await this.bookingRepository.find({
      where: { customer: { id: userId } },
      relations: ['spa', 'service', 'staff', 'feedbacks'],
      order: { createdAt: 'DESC' },
      take: 50,
    });

    const notifications = bookings.map((booking) => {
      const spaName = booking.spa?.name || 'Spa';
      const serviceName = booking.service?.name || 'Dịch vụ';
      const scheduledDate = new Date(booking.scheduledAt).toLocaleDateString('vi-VN');
      const scheduledTime = new Date(booking.scheduledAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

      let message = '';
      let type = 'info';

      switch (booking.status) {
        case BookingStatus.PENDING:
          message = `Bạn đã đặt lịch hẹn với ${spaName} cho dịch vụ ${serviceName} vào ${scheduledDate} lúc ${scheduledTime}`;
          type = 'info';
          break;
        case BookingStatus.CONFIRMED:
          message = `Lịch hẹn của bạn tại ${spaName} đã được xác nhận. Dịch vụ: ${serviceName}, thời gian: ${scheduledDate} lúc ${scheduledTime}`;
          type = 'success';
          break;
        case BookingStatus.COMPLETED:
          // Check if feedback exists - feedbacks might be empty array or undefined
          const hasFeedback = booking.feedbacks && Array.isArray(booking.feedbacks) && booking.feedbacks.length > 0;
          if (!hasFeedback) {
            message = `Dịch vụ đã hoàn thành tại ${spaName}. Vui lòng đánh giá dịch vụ để giúp chúng tôi cải thiện chất lượng.`;
            type = 'warning';
          } else {
            message = `Dịch vụ ${serviceName} tại ${spaName} đã hoàn thành. Cảm ơn bạn đã sử dụng dịch vụ!`;
            type = 'success';
          }
          break;
        case BookingStatus.CANCELLED:
          message = `Lịch hẹn của bạn tại ${spaName} cho dịch vụ ${serviceName} đã bị hủy`;
          type = 'error';
          break;
        default:
          message = `Cập nhật về lịch hẹn của bạn tại ${spaName}`;
          type = 'info';
      }

      return {
        id: `booking-${booking.id}`,
        type,
        message,
        bookingId: booking.id,
        spaId: booking.spa?.id,
        spaName,
        serviceName,
        status: booking.status,
        scheduledAt: booking.scheduledAt,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
      };
    });

    return new ApiResponseDto({ 
      success: true, 
      message: 'Booking notifications retrieved.', 
      data: notifications 
    });
  }
}
