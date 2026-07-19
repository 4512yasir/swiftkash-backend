import { Test, TestingModule } from '@nestjs/testing';
import { LoanApplicationService } from './loan-application.service';

describe('LoanApplicationService', () => {
  let service: LoanApplicationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoanApplicationService],
    }).compile();

    service = module.get<LoanApplicationService>(LoanApplicationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
