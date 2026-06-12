import { Body, Controller, Get, Post } from '@nestjs/common';
import { RepaymentsService } from './repayments.service';
import { CreateRepaymentDto } from './dto/create-repayment.dto';

@Controller('repayments')
export class RepaymentsController {
  constructor(private readonly repaymentsService: RepaymentsService) {}

  @Post()
  create(@Body() dto: CreateRepaymentDto) {
    return this.repaymentsService.create(dto);
  }

  @Get()
  findAll() {
    return this.repaymentsService.findAll();
  }
}