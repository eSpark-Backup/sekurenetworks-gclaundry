import { z } from 'zod';

enum TissueType {
    Scented = 'scented',
    Unscented = 'unscented',
}

enum Status {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export interface Transaction {
    quantity: number;
    tissueType: TissueType;
    status: Status;
    selectedAnswer?: string;
    questionId?: string;
    quoteId?: string;
    time: Date;
    kioskId: string;
    error?:string;
}