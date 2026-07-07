import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OverdueService {
  private readonly logger = new Logger(OverdueService.name);

  constructor(private prisma: PrismaService) {}

  // Runs every 10 seconds (for testing)
  @Cron('*/10 * * * * *')
  async checkOverdueLoans() {
    const now = new Date();

    // 1. Get all loans that are still active or partially paid
    const loans = await this.prisma.loan.findMany({
      where: {
        status: {
          in: ['ACTIVE'],
        },
        balance: {
          gt: 0,
        },
      },
    });

    let updated = 0;

    // 2. Loop through loans and check due date
    for (const loan of loans) {
      if (loan.dueDate < now) {
        await this.prisma.loan.update({
          where: { id: loan.id },
          data: {
            status: 'OVERDUE',
          },
        });

        updated++;

        this.logger.warn(
          `Loan ${loan.id} marked OVERDUE (balance: ${loan.balance})`,
        );
      }
    }

    // 3. Summary log
    this.logger.log(
      `Overdue check completed | Scanned: ${loans.length} | Updated: ${updated}`,
    );
  }
}