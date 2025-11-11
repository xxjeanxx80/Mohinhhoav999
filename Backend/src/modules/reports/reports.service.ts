import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { CreateReportDto } from './dto/create-report.dto';
import { ResolveReportDto } from './dto/resolve-report.dto';
import { Report, ReportStatus, ReportTargetType } from './entities/report.entity';
import { Spa } from '../spas/entities/spa.entity';
import { SpaService } from '../services/entities/service.entity';
import { Staff } from '../staff/entities/staff.entity';
import { Feedback } from '../feedbacks/entities/feedback.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationChannel } from '../notifications/entities/notification.entity';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectRepository(Report) private readonly reportRepository: Repository<Report>,
    @InjectRepository(Spa) private readonly spaRepository: Repository<Spa>,
    @InjectRepository(SpaService) private readonly serviceRepository: Repository<SpaService>,
    @InjectRepository(Staff) private readonly staffRepository: Repository<Staff>,
    @InjectRepository(Feedback) private readonly feedbackRepository: Repository<Feedback>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(reporterId: number, dto: CreateReportDto) {
    const report = this.reportRepository.create({
      ...dto,
      reporterId,
      status: ReportStatus.OPEN,
    });
    const saved = await this.reportRepository.save(report);
    return new ApiResponseDto({ success: true, message: 'Report submitted.', data: saved });
  }

  async findAll() {
    const reports = await this.reportRepository.find({
      relations: ['reporter'],
      order: { createdAt: 'DESC' }
    });

    // Load target object names
    const reportsWithTargets = await Promise.all(
      reports.map(async (report) => {
        let targetName: string | null = null;
        
        try {
          switch (report.targetType) {
            case ReportTargetType.SPA:
              const spa = await this.spaRepository.findOne({ where: { id: report.targetId } });
              targetName = spa?.name ?? null;
              break;
            case ReportTargetType.SERVICE:
              const service = await this.serviceRepository.findOne({ where: { id: report.targetId } });
              targetName = service?.name ?? null;
              break;
            case ReportTargetType.STAFF:
              const staff = await this.staffRepository.findOne({ where: { id: report.targetId } });
              targetName = staff?.name ?? null;
              break;
            case ReportTargetType.FEEDBACK:
              const feedback = await this.feedbackRepository.findOne({ where: { id: report.targetId } });
              targetName = feedback ? `Feedback #${feedback.id}` : null;
              break;
          }
        } catch (error) {
          this.logger.error('Error loading target name', error instanceof Error ? error.stack : String(error));
        }

        return {
          ...report,
          targetName,
        };
      })
    );

    return new ApiResponseDto({ success: true, message: 'Reports retrieved.', data: reportsWithTargets });
  }

  async findOne(id: number) {
    const report = await this.reportRepository.findOne({
      where: { id },
      relations: ['reporter'],
    });
    
    if (!report) {
      throw new NotFoundException('Report not found.');
    }

    // Load target object name
    let targetName: string | null = null;
    try {
      switch (report.targetType) {
        case ReportTargetType.SPA:
          const spa = await this.spaRepository.findOne({ where: { id: report.targetId } });
          targetName = spa?.name ?? null;
          break;
        case ReportTargetType.SERVICE:
          const service = await this.serviceRepository.findOne({ where: { id: report.targetId } });
          targetName = service?.name ?? null;
          break;
        case ReportTargetType.STAFF:
          const staff = await this.staffRepository.findOne({ where: { id: report.targetId } });
          targetName = staff?.name ?? null;
          break;
        case ReportTargetType.FEEDBACK:
          const feedback = await this.feedbackRepository.findOne({ where: { id: report.targetId } });
          targetName = feedback ? `Feedback #${feedback.id}` : null;
          break;
      }
    } catch (error) {
      this.logger.error('Error loading target name', error instanceof Error ? error.stack : String(error));
    }

    return new ApiResponseDto({
      success: true,
      message: 'Report retrieved.',
      data: {
        ...report,
        targetName,
      },
    });
  }

  async resolve(id: number, dto: ResolveReportDto) {
    const report = await this.reportRepository.findOne({ 
      where: { id },
      relations: ['reporter'],
    });
    if (!report) {
      throw new NotFoundException('Report not found.');
    }

    report.status = ReportStatus.RESOLVED;
    report.resolutionNotes = dto.notes ?? null;
    const saved = await this.reportRepository.save(report);

    // Send notification to reporter
    if (report.reporterId) {
      try {
        // Get target name for notification message
        let targetName = 'nội dung';
        try {
          switch (report.targetType) {
            case ReportTargetType.SPA:
              const spa = await this.spaRepository.findOne({ where: { id: report.targetId } });
              targetName = spa?.name ?? 'Spa';
              break;
            case ReportTargetType.SERVICE:
              const service = await this.serviceRepository.findOne({ where: { id: report.targetId } });
              targetName = service?.name ?? 'Dịch vụ';
              break;
            case ReportTargetType.STAFF:
              const staff = await this.staffRepository.findOne({ where: { id: report.targetId } });
              targetName = staff?.name ?? 'Nhân viên';
              break;
            case ReportTargetType.FEEDBACK:
              targetName = 'Đánh giá';
              break;
          }
        } catch (error) {
          this.logger.warn('Could not load target name for notification', error);
        }

        const notificationMessage = dto.notes 
          ? `Báo cáo của bạn về "${targetName}" đã được xử lý. Ghi chú: ${dto.notes}`
          : `Báo cáo của bạn về "${targetName}" đã được xử lý.`;

        await this.notificationsService.send({
          channel: NotificationChannel.PUSH,
          userId: report.reporterId,
          message: notificationMessage,
          meta: {
            reportId: report.id,
            targetType: report.targetType,
            targetId: report.targetId,
            targetName,
            resolutionNotes: dto.notes,
          },
        });
      } catch (error) {
        // Log error but don't fail the resolve operation
        this.logger.error('Failed to send notification to reporter', error instanceof Error ? error.stack : String(error));
      }
    }

    return new ApiResponseDto({ success: true, message: 'Report resolved.', data: saved });
  }
}
