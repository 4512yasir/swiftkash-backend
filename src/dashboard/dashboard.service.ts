import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard() {
    const totalClients = await this.prisma.client.count();

    const totalLoans = await this.prisma.loan.count();

    const activeLoans = await this.prisma.loan.count({
      where: { status: 'ACTIVE' },
    });

    const overdueLoans = await this.prisma.loan.count({
      where: { status: 'OVERDUE' },
    });

    const paidLoans = await this.prisma.loan.count({
      where: { status: 'PAID' },
    });

    const loans = await this.prisma.loan.findMany();

    const totalLoanAmount = loans.reduce(
      (sum, loan) => sum + loan.amount,
      0,
    );

    const totalOutstandingBalance = loans.reduce(
      (sum, loan) => sum + loan.balance,
      0,
    );

    const totalCollected = loans.reduce(
      (sum, loan) => sum + (loan.totalRepayment - loan.balance),
      0,
    );

    return {
      totalClients,
      totalLoans,
      activeLoans,
      overdueLoans,
      paidLoans,
      totalLoanAmount,
      totalOutstandingBalance,
      totalCollected,
    };
  }
}