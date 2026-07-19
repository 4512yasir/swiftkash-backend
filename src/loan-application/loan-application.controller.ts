import { Body, Controller, Post } from '@nestjs/common';
import { LoanApplicationService } from './loan-application.service';
import { CreateLoanApplicationDto } from './dto/create-loan-application.dto';

@Controller('loan-application')
export class LoanApplicationController {
  constructor(
    private readonly loanApplicationService: LoanApplicationService,
  ) {}

  @Post()
  apply(@Body() dto: CreateLoanApplicationDto) {
    console.log('CONTROLLER HIT');
    console.log(dto);

    return this.loanApplicationService.apply(dto);
  }
}
