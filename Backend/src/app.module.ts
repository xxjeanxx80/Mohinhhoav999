import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { CustomerModule } from './modules/customers/customer.module';
import { FeedbacksModule } from './modules/feedbacks/feedbacks.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { PayoutsModule } from './modules/payouts/payouts.module';
import { ReportsModule } from './modules/reports/reports.module';
import { ServicesModule } from './modules/services/services.module';
import { SpasModule } from './modules/spas/spas.module';
import { StaffModule } from './modules/staff/staff.module';
import { SystemSettingsModule } from './modules/system-settings/system-settings.module';
import { UsersModule } from './modules/users/users.module';
import { AdminModule } from './modules/admin/admin.module';
import { PostsModule } from './modules/posts/posts.module';
import { MediaModule } from './modules/media/media.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: parseInt(configService.get<string>('DB_PORT') ?? '5432', 10),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
    AuthModule,
    CustomerModule,
    UsersModule,
    SpasModule,
    ServicesModule,
    StaffModule,
    BookingsModule,
    FeedbacksModule,
    PaymentsModule,
    PayoutsModule,
    CouponsModule,
    CampaignsModule,
    AdminModule,
    ReportsModule,
    NotificationsModule,
    DashboardModule,
    SystemSettingsModule,
    PostsModule,
    MediaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
