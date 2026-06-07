import { IsString } from 'class-validator';

export class CreateClientDto {
  @IsString()
  fullName: string;

  @IsString()
  nationalId: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  address: string;
}