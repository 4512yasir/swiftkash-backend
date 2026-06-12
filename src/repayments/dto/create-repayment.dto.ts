import { IsNumber, IsString, Min } from 'class-validator';

export class CreateRepaymentDto {
  @IsString()
  loanId: string;

  @IsNumber()
  @Min(1)
  amount: number;
}