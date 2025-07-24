export class CrashPlaceBetModel   {
  customer_Curency_Name: string = '';
  customer_Site_Name: string = '';
  sessionToken: string = '';
  playerId: string = '';
  gameId: string = '';
  amount: number = 0;
  playerName: string = '';
}


export class CrashCashOutRequestModel {
  gameId:string = '';
  sessionToken:string ='';
  userName:string = '';
}