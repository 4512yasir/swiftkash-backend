import { Module } from '@nestjs/common';
import { LoanApplicationService } from './loan-application.service';
import { LoanApplicationController } from './loan-application.controller';

import { PrismaModule } from '../prisma/prisma.module';
import { LoansModule } from '../loans/loans.module';
import { EligibilityModule } from '../eligibility/eligibility.module';

@Module({
  imports: [PrismaModule, LoansModule, EligibilityModule],
  controllers: [LoanApplicationController],
  providers: [LoanApplicationService],
})
export class LoanApplicationModule {}
