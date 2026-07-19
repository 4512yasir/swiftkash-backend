import { Controller, Get, Param } from '@nestjs/common';
import { EligibilityService } from './eligibility.service';

@Controller('eligibility')
export class EligibilityController {
  constructor(private readonly eligibilityService: EligibilityService) {}

  @Get(':clientId')
  async checkEligibility(@Param('clientId') clientId: string) {
    return this.eligibilityService.checkEligibility(clientId);
  }
}
