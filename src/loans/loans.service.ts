import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLoanDto } from './dto/create-loan.dto';

@Injectable()
export class LoansService {
  constructor(private prisma: PrismaService) {}

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
      },
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