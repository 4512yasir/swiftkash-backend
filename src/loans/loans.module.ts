import { Module } from '@nestjs/common';
import { LoansService } from './loans.service';
import { LoansController } from './loans.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { LoanStatusService } from './loan-status.service';

@Module({
  imports: [PrismaModule],
  controllers: [LoansController],
  providers: [LoansService, LoanStatusService],
  exports: [LoansService], // 👈 IMPORTANT FIX
})
export class LoansModule {}