import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CreditScoreService {
  constructor(private readonly prisma: PrismaService) {}

  async getClientCreditScore(clientId: string) {
    const client = await this.prisma.client.findUnique({
      where: {
        id: clientId,
      },
      include: {
        loans: {
          include: {
            repayments: true,
          },
        },
      },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    let score = 500;

    let completedLoans = 0;
    let overdueLoans = 0;
    let defaultedLoans = 0;
    let lateLoans = 0;

    let totalLoans = client.loans.length;

    for (const loan of client.loans) {
      switch (loan.status) {
        case 'PAID':
          completedLoans++;

          if (loan.balance === 0) {
            const fullyPaidDate =
              loan.repayments.length > 0
                ? loan.repayments[loan.repayments.length - 1].paidAt
                : null;

            if (fullyPaidDate) {
              if (fullyPaidDate <= loan.dueDate) {
                score += 100;
              } else {
                score += 40;
                lateLoans++;
              }
            }

            score += 20;
          }

          break;

        case 'OVERDUE':
          overdueLoans++;
          score -= 80;
          break;

        case 'DEFAULTED':
          defaultedLoans++;
          score -= 200;
          break;
      }
    }

    score = Math.max(0, Math.min(score, 1000));

    let rating = '';
    let risk = '';
    let eligibleLoan = 10000;

    if (score >= 900) {
      rating = 'Excellent';
      risk = 'LOW';
      eligibleLoan = 100000;
    } else if (score >= 750) {
      rating = 'Very Good';
      risk = 'LOW';
      eligibleLoan = 75000;
    } else if (score >= 600) {
      rating = 'Good';
      risk = 'MEDIUM';
      eligibleLoan = 50000;
    } else if (score >= 450) {
      rating = 'Average';
      risk = 'MEDIUM';
      eligibleLoan = 30000;
    } else if (score >= 300) {
      rating = 'Poor';
      risk = 'HIGH';
      eligibleLoan = 20000;
    } else {
      rating = 'High Risk';
      risk = 'VERY HIGH';
      eligibleLoan = 10000;
    }

    const repaymentRate =
      totalLoans === 0
        ? 0
        : Number(((completedLoans / totalLoans) * 100).toFixed(2));

    return {
      client: {
        id: client.id,
        fullName: client.fullName,
        nationalId: client.nationalId,
        phoneNumber: client.phoneNumber,
      },

      creditScore: score,

      rating,

      risk,

      eligibleLoan,

      statistics: {
        totalLoans,
        completedLoans,
        overdueLoans,
        lateLoans,
        defaultedLoans,
        repaymentRate,
      },
    };
  }
}