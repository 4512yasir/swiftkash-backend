import { Controller, Get, Param } from '@nestjs/common';
import { CreditScoreService } from './credit-score.service';

@Controller('credit-score')
export class CreditScoreController {
  constructor(private readonly creditScoreService: CreditScoreService) {}

  @Get(':clientId')
  getCreditScore(@Param('clientId') clientId: string) {
    return this.creditScoreService.getClientCreditScore(clientId);
  }
}
