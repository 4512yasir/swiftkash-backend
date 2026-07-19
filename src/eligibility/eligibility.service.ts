import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreditScoreService } from '../credit-score/credit-score.service';

@Injectable()
export class EligibilityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly creditScoreService: CreditScoreService,
  ) {}

  async checkEligibility(clientId: string) {
    // Check if client exists
    const client = await this.prisma.client.findUnique({
      where: {
        id: clientId,
      },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    // Blacklist check
    if (client.isBlacklisted) {
      return {
        eligible: false,
        reason: 'Client is blacklisted.',
        creditScore: 0,
        risk: 'HIGH',
        maximumLoanAmount: 0,
      };
    }

    // Active Loan Check
    const activeLoan = await this.prisma.loan.findFirst({
      where: {
        clientId,
        status: 'ACTIVE',
      },
    });

    if (activeLoan) {
      return {
        eligible: false,
        reason: 'Client already has an active loan.',
        creditScore: 0,
        risk: 'MEDIUM',
        maximumLoanAmount: 0,
      };
    }

    // Overdue Loan Check
    const overdueLoan = await this.prisma.loan.findFirst({
      where: {
        clientId,
        status: 'OVERDUE',
      },
    });

    if (overdueLoan) {
      return {
        eligible: false,
        reason: 'Client has an overdue loan.',
        creditScore: 0,
        risk: 'HIGH',
        maximumLoanAmount: 0,
      };
    }

    // Get Credit Score
    const score = await this.creditScoreService.getClientCreditScore(clientId);

    // Minimum Score
    if (score.creditScore < 500) {
      return {
        eligible: false,
        reason: 'Credit score is below minimum lending requirement.',
        creditScore: score.creditScore,
        rating: score.rating,
        risk: score.risk,
        maximumLoanAmount: 0,
      };
    }

    return {
      eligible: true,
      reason: 'Client qualifies for a new loan.',
      creditScore: score.creditScore,
      rating: score.rating,
      risk: score.risk,
      maximumLoanAmount: score.eligibleLoan,

      client: {
        id: client.id,
        fullName: client.fullName,
        nationalId: client.nationalId,
        phoneNumber: client.phoneNumber,
      },
    };
  }
}
