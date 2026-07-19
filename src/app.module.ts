import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClientsModule } from './clients/clients.module';
import { LoansModule } from './loans/loans.module';
import { RepaymentsModule } from './repayments/repayments.module';
import { ScheduleModule } from '@nestjs/schedule';
import { DashboardModule } from './dashboard/dashboard.module';
import { CreditScoreModule } from './credit-score/credit-score.module';
import { EligibilityModule } from './eligibility/eligibility.module';
import { LoanApplicationModule } from './loan-application/loan-application.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),

    PrismaModule,
    AuthModule,
    UsersModule,
    ClientsModule,
    LoansModule,
    RepaymentsModule,
    DashboardModule,
    CreditScoreModule,
    EligibilityModule,
    LoanApplicationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
