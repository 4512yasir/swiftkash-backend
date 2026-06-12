import { Injectable } from '@nestjs/common';
import { LoanStatus } from '@prisma/client';

@Injectable()
export class LoanStatusService {
  calculateStatus(loan: {
    balance: number;
    dueDate: Date;
    status: LoanStatus;
  }): LoanStatus {
    const now = new Date();

    // Paid takes highest priority
    if (loan.balance === 0) {
      return LoanStatus.PAID;
    }

    // Overdue check
    if (loan.dueDate < now && loan.balance > 0) {
      return LoanStatus.OVERDUE;
    }

    // If any repayment exists or loan is active
    return LoanStatus.ACTIVE;
  }
}