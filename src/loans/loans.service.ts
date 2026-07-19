import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { LoanStatusService } from './loan-status.service';
import PDFDocument from 'pdfkit';
import { Response } from 'express';

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

  async generateStatementPdf(id: string, res: Response) {
    const statement = await this.getStatement(id);

    const doc = new PDFDocument({
      margin: 50,
      size: 'A4',
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=loan-statement-${id}.pdf`,
    );

    doc.pipe(res);

    // Header
    doc.fontSize(24).text('SWIFTKASH', {
      align: 'center',
    });

    doc.fontSize(16).text('LOAN STATEMENT', {
      align: 'center',
    });

    doc.moveDown(2);

    // Client Information
    doc.fontSize(15).text('CLIENT INFORMATION');

    doc.moveDown();

    doc.fontSize(12);
    doc.text(`Name: ${statement.client.fullName}`);
    doc.text(`National ID: ${statement.client.nationalId}`);
    doc.text(`Phone: ${statement.client.phoneNumber}`);
    doc.text(`Address: ${statement.client.address}`);

    doc.moveDown();

    // Loan Information
    doc.fontSize(15).text('LOAN INFORMATION');

    doc.moveDown();

    doc.fontSize(12);
    doc.text(`Loan Amount: KES ${statement.loan.amount}`);
    doc.text(`Interest Rate: ${statement.loan.interestRate}%`);
    doc.text(`Interest Amount: KES ${statement.loan.interestAmount}`);
    doc.text(`Total Repayment: KES ${statement.loan.totalRepayment}`);
    doc.text(`Current Balance: KES ${statement.loan.balance}`);
    doc.text(`Status: ${statement.loan.status}`);
    doc.text(
      `Issued Date: ${new Date(statement.loan.issuedAt).toLocaleDateString()}`,
    );
    doc.text(
      `Due Date: ${new Date(statement.loan.dueDate).toLocaleDateString()}`,
    );

    doc.moveDown();

    // Repayments
    doc.fontSize(15).text('REPAYMENT HISTORY');

    doc.moveDown();

    if (statement.repayments.length === 0) {
      doc.text('No repayments recorded.');
    } else {
      statement.repayments.forEach((repayment, index) => {
        doc.text(
          `${index + 1}. ${new Date(repayment.paidAt).toLocaleDateString()}    KES ${repayment.amount}`,
        );
      });
    }

    doc.moveDown();

    // Summary
    doc.fontSize(15).text('SUMMARY');

    doc.moveDown();

    doc.fontSize(12);
    doc.text(`Total Paid: KES ${statement.summary.totalPaid}`);
    doc.text(`Remaining Balance: KES ${statement.summary.remainingBalance}`);
    doc.text(`Number of Repayments: ${statement.summary.numberOfRepayments}`);

    doc.moveDown(2);

    doc.fontSize(10).text(`Generated on ${new Date().toLocaleString()}`, {
      align: 'center',
    });

    doc.end();
  }
}
