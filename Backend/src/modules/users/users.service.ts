import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { Role } from '../../common/enums/role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoyaltyRank } from './enums/loyalty-rank.enum';
import { LoyaltyHistory } from './entities/loyalty-history.entity';
import { Loyalty } from './entities/loyalty.entity';
import { User } from './entities/user.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { Feedback } from '../feedbacks/entities/feedback.entity';
import { Spa } from '../spas/entities/spa.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Payout } from '../payouts/entities/payout.entity';
import { Report } from '../reports/entities/report.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { Post } from '../posts/entities/post.entity';
import { SpaService } from '../services/entities/service.entity';
import { Staff } from '../staff/entities/staff.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(Loyalty) private readonly loyaltyRepo: Repository<Loyalty>,
    @InjectRepository(LoyaltyHistory) private readonly loyaltyHistoryRepo: Repository<LoyaltyHistory>,
    @InjectRepository(Booking) private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(Feedback) private readonly feedbackRepo: Repository<Feedback>,
    @InjectRepository(Spa) private readonly spaRepo: Repository<Spa>,
    @InjectRepository(Payment) private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Payout) private readonly payoutRepo: Repository<Payout>,
    @InjectRepository(Report) private readonly reportRepo: Repository<Report>,
    @InjectRepository(Notification) private readonly notificationRepo: Repository<Notification>,
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    @InjectRepository(SpaService) private readonly spaServiceRepo: Repository<SpaService>,
    @InjectRepository(Staff) private readonly staffRepo: Repository<Staff>,
  ) {}

  async create(dto: CreateUserDto): Promise<ApiResponseDto<{ user: User }>> {
    const email = dto.email.toLowerCase();

    const existing = await this.usersRepo.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('Email already exists.');
    }

    // Prevent creating ADMIN role - only one admin allowed
    if (dto.role === Role.ADMIN) {
      throw new ConflictException('Cannot create another ADMIN user. Only one admin is allowed.');
    }

    const user = this.usersRepo.create({
      name: dto.name,
      email,
      password: await this.hashPassword(dto.password),
      role: dto.role ?? Role.CUSTOMER,
      oauthProvider: 'local',
    });

    const saved = await this.usersRepo.save(user);
    return new ApiResponseDto({
      success: true,
      message: 'User created successfully.',
      data: { user: this.sanitizeUser(saved) },
    });
  }

  async findAll(): Promise<ApiResponseDto<{ users: User[] }>> {
    const users = await this.usersRepo.find();
    return new ApiResponseDto({
      success: true,
      message: 'Users retrieved successfully.',
      data: { users: users.map((user) => this.sanitizeUser(user)) },
    });
  }

  async findOne(id: number): Promise<ApiResponseDto<{ user: User }>> {
    const user = await this.usersRepo.findOne({ where: { id }, relations: ['loyalty'] });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return new ApiResponseDto({
      success: true,
      message: 'User retrieved successfully.',
      data: { user: this.sanitizeUser(user) },
    });
  }

  async update(id: number, dto: UpdateUserDto): Promise<ApiResponseDto<{ user: User }>> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (dto.email && dto.email.toLowerCase() !== user.email) {
      const emailExists = await this.usersRepo.findOne({ where: { email: dto.email.toLowerCase() } });
      if (emailExists) {
        throw new ConflictException('Email already exists.');
      }
      user.email = dto.email.toLowerCase();
    }

    if (dto.name) {
      user.name = dto.name;
    }

    if (dto.phone !== undefined) {
      user.phone = dto.phone;
    }

    if (dto.address !== undefined) {
      user.address = dto.address;
    }

    if (dto.bankName !== undefined) {
      user.bankName = dto.bankName;
    }

    if (dto.bankAccountNumber !== undefined) {
      user.bankAccountNumber = dto.bankAccountNumber;
    }

    if (dto.bankAccountHolder !== undefined) {
      user.bankAccountHolder = dto.bankAccountHolder;
    }

    if (dto.role) {
      // Prevent changing role to ADMIN - only one admin allowed
      if (dto.role === Role.ADMIN) {
        throw new ConflictException('Cannot change role to ADMIN. Only one admin is allowed.');
      }
      user.role = dto.role;
    }

    if (dto.password) {
      user.password = await this.hashPassword(dto.password);
    }

    const saved = await this.usersRepo.save(user);

    return new ApiResponseDto({
      success: true,
      message: 'User updated successfully.',
      data: { user: this.sanitizeUser(saved) },
    });
  }

  async remove(id: number): Promise<ApiResponseDto<undefined>> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    this.logger.log(`Starting deletion process for user ${id} (${user.email})`);

    // 1. Find all spas owned by this user
    const ownedSpas = await this.spaRepo.find({ where: { owner: { id } } });
    const spaIds = ownedSpas.map(spa => spa.id);

    if (spaIds.length > 0) {
      this.logger.log(`Found ${spaIds.length} spa(s) owned by user ${id}`);

      // 1.1. Delete payments related to bookings of these spas
      const spaBookings = await this.bookingRepo.find({ where: { spa: { id: In(spaIds) } } });
      const bookingIds = spaBookings.map(b => b.id);
      if (bookingIds.length > 0) {
        await this.paymentRepo.delete({ bookingId: In(bookingIds) });
        this.logger.log(`Deleted ${bookingIds.length} payment(s) related to spa bookings`);
      }

      // 1.2. Delete feedbacks of spa bookings first (before deleting bookings)
      // This avoids foreign key constraint issues
      await this.feedbackRepo.delete({ spa: { id: In(spaIds) } });
      this.logger.log(`Deleted feedbacks of spas`);

      // 1.3. Delete bookings of spas
      await this.bookingRepo.delete({ spa: { id: In(spaIds) } });
      this.logger.log(`Deleted bookings of spas`);

      // 1.4. Delete services of spas
      await this.spaServiceRepo.delete({ spa: { id: In(spaIds) } });
      this.logger.log(`Deleted services of spas`);

      // 1.5. Delete staff of spas (staff skills, shifts, time offs will cascade delete)
      await this.staffRepo.delete({ spa: { id: In(spaIds) } });
      this.logger.log(`Deleted staff of spas`);

      // 1.6. Delete posts of spas
      await this.postRepo.delete({ spa: { id: In(spaIds) } });
      this.logger.log(`Deleted posts of spas`);

      // 1.7. Delete spas
      await this.spaRepo.delete({ id: In(spaIds) });
      this.logger.log(`Deleted ${spaIds.length} spa(s)`);
    }

    // 2. Delete bookings where user is customer
    const userBookings = await this.bookingRepo.find({ where: { customer: { id } } });
    const userBookingIds = userBookings.map(b => b.id);
    if (userBookingIds.length > 0) {
      // Delete payments related to user bookings
      await this.paymentRepo.delete({ bookingId: In(userBookingIds) });
      this.logger.log(`Deleted payments related to user bookings`);
    }
    await this.bookingRepo.delete({ customer: { id } });
    this.logger.log(`Deleted bookings where user is customer`);

    // 3. Delete feedbacks where user is customer (if any remain)
    await this.feedbackRepo.delete({ customer: { id } });
    this.logger.log(`Deleted feedbacks where user is customer`);

    // 4. Delete payouts where user is owner
    await this.payoutRepo.delete({ owner: { id } });
    this.logger.log(`Deleted payouts where user is owner`);

    // 5. Delete reports where user is reporter
    await this.reportRepo.delete({ reporter: { id } });
    this.logger.log(`Deleted reports where user is reporter`);

    // 6. Delete notifications for user
    await this.notificationRepo.delete({ user: { id } });
    this.logger.log(`Deleted notifications for user`);

    // 7. Favorites, Loyalty, LoyaltyHistory will be deleted by CASCADE
    // 8. Finally delete the user
    await this.usersRepo.delete(id);
    this.logger.log(`User ${id} deleted successfully`);

    return new ApiResponseDto({ success: true, message: 'User and all related data deleted successfully.' });
  }

  async addPoints(customerId: number, points: number, reason: string): Promise<ApiResponseDto<{ loyalty: Loyalty }>> {
    if (!Number.isInteger(points) || points <= 0) {
      throw new BadRequestException('Points must be a positive integer.');
    }

    if (!reason?.trim()) {
      throw new BadRequestException('A reason for the loyalty update is required.');
    }

    const user = await this.usersRepo.findOne({ where: { id: customerId } });
    if (!user || user.role !== Role.CUSTOMER) {
      throw new NotFoundException('Customer not found.');
    }

    let loyalty = await this.loyaltyRepo.findOne({ where: { userId: user.id } });
    if (!loyalty) {
      loyalty = this.loyaltyRepo.create({ userId: user.id, points: 0, rank: LoyaltyRank.BRONZE });
    }

    loyalty.points += points;
    loyalty.rank = this.determineRank(loyalty.points);

    const saved = await this.loyaltyRepo.save(loyalty);

    const history = this.loyaltyHistoryRepo.create({
      userId: user.id,
      points,
      reason: reason.trim(),
    });
    await this.loyaltyHistoryRepo.save(history);

    return new ApiResponseDto({
      success: true,
      message: 'Loyalty points added successfully.',
      data: { loyalty: saved },
    });
  }

  async getRank(customerId: number): Promise<ApiResponseDto<{ rank: LoyaltyRank; points: number }>> {
    const loyalty = await this.loyaltyRepo.findOne({ where: { userId: customerId } });
    const rank = loyalty ? loyalty.rank : LoyaltyRank.BRONZE;
    const points = loyalty ? loyalty.points : 0;
    return new ApiResponseDto({
      success: true,
      message: 'Loyalty rank retrieved successfully.',
      data: { rank, points },
    });
  }

  async getUserBookings(userId: number): Promise<ApiResponseDto<{ bookings: Booking[] }>> {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const bookings = await this.bookingRepo.find({
      where: { customer: { id: userId } },
      relations: ['spa', 'service', 'staff', 'customer'],
      order: { createdAt: 'DESC' },
    });

    return new ApiResponseDto({
      success: true,
      message: 'User bookings retrieved successfully.',
      data: { bookings },
    });
  }

  async getUserFeedbacks(userId: number): Promise<ApiResponseDto<{ feedbacks: Feedback[] }>> {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const feedbacks = await this.feedbackRepo.find({
      where: { customer: { id: userId } },
      relations: ['spa', 'booking', 'customer'],
      order: { createdAt: 'DESC' },
    });

    return new ApiResponseDto({
      success: true,
      message: 'User feedbacks retrieved successfully.',
      data: { feedbacks },
    });
  }

  async getLoyaltyHistory(userId: number): Promise<ApiResponseDto<{ history: LoyaltyHistory[] }>> {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const history = await this.loyaltyHistoryRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    return new ApiResponseDto({
      success: true,
      message: 'Loyalty history retrieved successfully.',
      data: { history },
    });
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<ApiResponseDto<undefined>> {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user || !user.password) {
      throw new NotFoundException('User not found or has no password set.');
    }

    // Verify current password
    const passwordMatches = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Current password is incorrect.');
    }

    // Update to new password
    user.password = await this.hashPassword(newPassword);
    await this.usersRepo.save(user);

    return new ApiResponseDto({
      success: true,
      message: 'Password changed successfully.',
      data: undefined,
    });
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private sanitizeUser(user: User): User {
    const clone: User = { ...user };
    clone.password = null;
    clone.refreshTokenHash = null;
    return clone;
  }

  async findCustomersByOwner(ownerId: number): Promise<ApiResponseDto<{ customers: any[] }>> {
    // Find users who have booked services at owner's spas
    const customers = await this.usersRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.loyalty', 'loyalty')
      .innerJoin('bookings', 'booking', 'booking.user_id = user.user_id')
      .innerJoin('services', 'service', 'service.service_id = booking.service_id')
      .innerJoin('spas', 'spa', 'spa.spa_id = service.spa_id')
      .where('spa.owner_id = :ownerId', { ownerId })
      .andWhere('user.role = :role', { role: Role.CUSTOMER })
      .groupBy('user.user_id')
      .addGroupBy('loyalty.id')
      .select([
        'user.user_id',
        'user.name',
        'user.email',
        'user.phone',
        'loyalty.rank',
        'loyalty.points',
      ])
      .getRawMany();

    const formatted = customers.map((c) => ({
      id: c.user_user_id,
      name: c.user_name,
      email: c.user_email,
      phone: c.user_phone || null,
      loyaltyRank: c.loyalty_rank || 'BRONZE',
      loyaltyPoints: c.loyalty_points || 0,
    }));

    return new ApiResponseDto({
      success: true,
      message: 'Owner customers retrieved successfully.',
      data: { customers: formatted },
    });
  }

  async updateLoyaltyRank(userId: number, rank: LoyaltyRank): Promise<ApiResponseDto<{ loyalty: Loyalty }>> {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    let loyalty = await this.loyaltyRepo.findOne({ where: { userId } });
    if (!loyalty) {
      loyalty = this.loyaltyRepo.create({ userId, points: 0, rank });
    } else {
      loyalty.rank = rank;
    }

    const saved = await this.loyaltyRepo.save(loyalty);

    return new ApiResponseDto({
      success: true,
      message: 'Loyalty rank updated successfully.',
      data: { loyalty: saved },
    });
  }

  async updateAvatar(id: number, file: Express.Multer.File, mediaService: any): Promise<ApiResponseDto<{ user: User; media: any }>> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    // Upload to media table
    const mediaResult = await mediaService.uploadUserAvatar(file, id);

    return new ApiResponseDto({
      success: true,
      message: 'Avatar updated successfully.',
      data: { user: this.sanitizeUser(user), media: mediaResult.data },
    });
  }

  private determineRank(points: number): LoyaltyRank {
    // BRONZE: 0-99 points
    // SILVER: 100-199 points
    // GOLD: 200-299 points
    // PLATINUM: 300+ points
    if (points >= 300) {
      return LoyaltyRank.PLATINUM;
    }
    if (points >= 200) {
      return LoyaltyRank.GOLD;
    }
    if (points >= 100) {
      return LoyaltyRank.SILVER;
    }
    return LoyaltyRank.BRONZE;
  }
}
