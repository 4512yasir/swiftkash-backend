import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRepaymentDto } from './dto/create-repayment.dto';

@Injectable()
export class RepaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRepaymentDto) {
    const loan = await this.prisma.loan.findUnique({
      where: { id: dto.loanId },
    });

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    if (loan.status === 'PAID') {
      throw new BadRequestException('Loan has already been paid');
    }

    if (dto.amount > loan.balance) {
      throw new BadRequestException(
        'Repayment amount cannot exceed remaining balance',
      );
    }

    const repayment = await this.prisma.repayment.create({
      data: {
        amount: dto.amount,
        loanId: dto.loanId,
      },
    });

    const newBalance = loan.balance - dto.amount;

    await this.prisma.loan.update({
      where: { id: loan.id },
      data: {
        balance: newBalance,
        status: newBalance === 0 ? 'PAID' : 'ACTIVE',
      },
    });

    return {
      message: 'Repayment recorded successfully',
      repayment,
      remainingBalance: newBalance,
    };
  }

  async findAll() {
    return this.prisma.repayment.findMany({
      include: {
        loan: true,
      },
    });
  }
}