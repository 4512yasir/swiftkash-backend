import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import type { Response } from 'express';

import { LoansService } from './loans.service';
import { CreateLoanDto } from './dto/create-loan.dto';

@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post()
  async create(@Body() dto: CreateLoanDto) {
    return this.loansService.create(dto);
  }

  @Get()
  async findAll() {
    return this.loansService.findAll();
  }

  @Get(':id/statement')
  async getStatement(@Param('id') id: string) {
    return this.loansService.getStatement(id);
  }

  @Get(':id/statement/pdf')
  async generatePdf(@Param('id') id: string, @Res() res: Response) {
    return this.loansService.generateStatementPdf(id, res);
  }
}
