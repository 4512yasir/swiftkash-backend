import { Injectable } from '@nestjs/common';
import { EligibilityService } from '../eligibility/eligibility.service';
import { LoansService } from '../loans/loans.service';
import { CreateLoanApplicationDto } from './dto/create-loan-application.dto';

@Injectable()
export class LoanApplicationService {
  constructor(
    private readonly eligibilityService: EligibilityService,
    private readonly loansService: LoansService,
  ) {}

  async apply(dto: CreateLoanApplicationDto) {
    console.log('==============================');
    console.log('STEP 1 - Loan application received');
    console.log(dto);

    // Check client eligibility
    console.log('STEP 2 - Checking eligibility...');

    const eligibility = await this.eligibilityService.checkEligibility(
      dto.clientId,
    );

    console.log('STEP 3 - Eligibility result');
    console.log(eligibility);

    // Client not eligible
    if (!eligibility.eligible) {
      console.log('STEP 4 - Client NOT eligible');

      return {
        approved: false,
        ...eligibility,
      };
    }

    console.log('STEP 5 - Client eligible');

    // Requested amount exceeds allowed amount
    if (dto.amount > eligibility.maximumLoanAmount) {
      console.log('STEP 6 - Amount exceeds maximum');

      return {
        approved: false,
        reason: `Requested amount exceeds maximum eligible amount of KES ${eligibility.maximumLoanAmount}.`,
        creditScore: eligibility.creditScore,
        rating: eligibility.rating,
        risk: eligibility.risk,
        maximumLoanAmount: eligibility.maximumLoanAmount,
      };
    }

    console.log('STEP 7 - Creating loan...');

    const loan = await this.loansService.create({
      clientId: dto.clientId,
      officerId: dto.officerId,
      amount: dto.amount,
    });

    console.log('STEP 8 - Loan created successfully');
    console.log(loan);

    return {
      approved: true,
      message: 'Loan application approved.',
      creditScore: eligibility.creditScore,
      rating: eligibility.rating,
      risk: eligibility.risk,
      maximumLoanAmount: eligibility.maximumLoanAmount,
      loan,
    };
  }
}