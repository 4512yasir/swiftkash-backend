import { Test, TestingModule } from '@nestjs/testing';
import { LoanApplicationController } from './loan-application.controller';

describe('LoanApplicationController', () => {
  let controller: LoanApplicationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoanApplicationController],
    }).compile();

    controller = module.get<LoanApplicationController>(LoanApplicationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
