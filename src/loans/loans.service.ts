import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { LoanStatusService } from './loan-status.service';

@Injectable()
export class LoansService {
  constructor(
    private prisma: PrismaService,
    private loanStatusService: LoanStatusService,
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

  async updateLoanStatus(loanId: string) {
    const loan = await this.prisma.loan.findUnique({
      where: { id: loanId },
    });

    if (!loan) return null;

    const status = this.loanStatusService.calculateStatus(loan);

    return this.prisma.loan.update({
      where: { id: loanId },
      data: { status },
    });
  }

  findAll() {
    return this.prisma.loan.findMany({
      include: {
        client: true,
        officer: true,
      },
    });
  }
}