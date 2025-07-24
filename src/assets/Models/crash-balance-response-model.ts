export class CrashBalanceResponseModel {
  newBalance: number = 0;
  status: number = TransactionStatus.FAILED;
}

export enum TransactionStatus{
  PENDING,
  SUCCESS,
  FAILED,
  INSUFICIENT_FUNDS,
  TRANSACTION_ALREADY_EXISTS,
  REFUND_SUCCESS,
}
