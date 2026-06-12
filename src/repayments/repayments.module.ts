import { Module } from '@nestjs/common';
import { RepaymentsService } from './repayments.service';
import { RepaymentsController } from './repayments.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { LoansModule } from '../loans/loans.module';

@Module({
  imports: [PrismaModule, LoansModule], // 👈 IMPORTANT FIX
  controllers: [RepaymentsController],
  providers: [RepaymentsService],
})
export class RepaymentsModule {}