import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClientDto) {
    return this.prisma.client.create({
      data: dto,
    });
  }

  async findAll() {
    return this.prisma.client.findMany();
  }

  async getClientProfile(id: string) {
    const client = await this.prisma.client.findUnique({
      where: {
        id,
      },
      include: {
        loans: {
          include: {
            repayments: true,
          },
          orderBy: {
            issuedAt: 'desc',
          },
        },
      },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const totalLoans = client.loans.length;

    const activeLoans = client.loans.filter(
      (loan) => loan.status === 'ACTIVE',
    ).length;

    const paidLoans = client.loans.filter(
      (loan) => loan.status === 'PAID',
    ).length;

    const overdueLoans = client.loans.filter(
      (loan) => loan.status === 'OVERDUE',
    ).length;

    const totalBorrowed = client.loans.reduce(
      (sum, loan) => sum + loan.amount,
      0,
    );

    const outstandingBalance = client.loans.reduce(
      (sum, loan) => sum + loan.balance,
      0,
    );

    const totalPaid = client.loans.reduce((sum, loan) => {
      const paid = loan.repayments.reduce(
        (repaymentSum, repayment) => repaymentSum + repayment.amount,
        0,
      );

      return sum + paid;
    }, 0);

    const recentRepayments = client.loans
      .flatMap((loan) =>
        loan.repayments.map((repayment) => ({
          loanId: loan.id,
          amount: repayment.amount,
          paidAt: repayment.paidAt,
        })),
      )
      .sort(
        (a, b) =>
          new Date(b.paidAt).getTime() -
          new Date(a.paidAt).getTime(),
      )
      .slice(0, 10);

    return {
      client: {
        id: client.id,
        fullName: client.fullName,
        nationalId: client.nationalId,
        phoneNumber: client.phoneNumber,
        address: client.address,
        isBlacklisted: client.isBlacklisted,
      },

      statistics: {
        totalLoans,
        activeLoans,
        paidLoans,
        overdueLoans,
        totalBorrowed,
        totalPaid,
        outstandingBalance,
      },

      loanHistory: client.loans,

      recentRepayments,
    };
  }
}