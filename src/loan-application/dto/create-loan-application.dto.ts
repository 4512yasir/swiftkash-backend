import { IsNumber, IsString, Min } from 'class-validator';

export class CreateLoanApplicationDto {
  @IsString()
  clientId!: string;

  @IsString()
  officerId!: string;

  @IsNumber()
  @Min(1000)
  amount!: number;
}
