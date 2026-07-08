import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { LoanStatusService } from './loan-status.service';

@Injectable()
export class LoansService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly loanStatusService: LoanStatusService,
  ) {}

  async create(dto: CreateLoanDto) {
    const interestRate = 10;

    const interestAmount = (dto.amount * interestRate) / 100;
    const totalRepayment = dto.amount + interestAmount;

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    return this.prisma.loan.create({
      data: {
        amount: dto.amount,
        interestRate,
        interestAmount,
        totalRepayment,
        balance: totalRepayment,
        dueDate,
        clientId: dto.clientId,
        officerId: dto.officerId,
        status: 'PENDING',
      },
    });
  }

  async findAll() {
    return this.prisma.loan.findMany({
      include: {
        client: true,
        officer: true,
      },
    });
  }

  async getStatement(id: string) {
    const loan = await this.prisma.loan.findUnique({
      where: { id },
      include: {
        client: true,
        officer: true,
        repayments: {
          orderBy: {
            paidAt: 'asc',
          },
        },
      },
    });

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    const totalPaid = loan.repayments.reduce(
      (sum, repayment) => sum + repayment.amount,
      0,
    );

    return {
      loan: {
        id: loan.id,
        amount: loan.amount,
        interestRate: loan.interestRate,
        interestAmount: loan.interestAmount,
        totalRepayment: loan.totalRepayment,
        balance: loan.balance,
        status: loan.status,
        issuedAt: loan.issuedAt,
        dueDate: loan.dueDate,
      },

      client: {
        id: loan.client.id,
        fullName: loan.client.fullName,
        nationalId: loan.client.nationalId,
        phoneNumber: loan.client.phoneNumber,
        address: loan.client.address,
      },

      officer: {
        id: loan.officer.id,
        fullName: loan.officer.fullName,
        email: loan.officer.email,
        role: loan.officer.role,
      },

      repayments: loan.repayments,

      summary: {
        totalPaid,
        remainingBalance: loan.balance,
        numberOfRepayments: loan.repayments.length,
      },
    };
  }

  async updateLoanStatus(loanId: string) {
    const loan = await this.prisma.loan.findUnique({
      where: { id: loanId },
    });

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    const status = this.loanStatusService.calculateStatus(loan);

    return this.prisma.loan.update({
      where: { id: loanId },
      data: {
        status,
      },
    });
  }
}
