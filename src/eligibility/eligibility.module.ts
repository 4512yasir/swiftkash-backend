import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CreditScoreModule } from '../credit-score/credit-score.module';
import { EligibilityController } from './eligibility.controller';
import { EligibilityService } from './eligibility.service';

@Module({
  imports: [PrismaModule, CreditScoreModule],
  controllers: [EligibilityController],
  providers: [EligibilityService],
  exports: [EligibilityService],
})
export class EligibilityModule {}
