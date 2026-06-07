import { IsNumber, IsString } from 'class-validator';

export class CreateLoanDto {
  @IsString()
  clientId: string;

  @IsNumber()
  amount: number;

  @IsString()
  officerId: string;
}