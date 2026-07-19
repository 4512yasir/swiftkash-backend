import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CreditScoreController } from './credit-score.controller';
import { CreditScoreService } from './credit-score.service';

@Module({
  imports: [PrismaModule],
  controllers: [CreditScoreController],
  providers: [CreditScoreService],
  exports: [CreditScoreService],
})
export class CreditScoreModule {}
