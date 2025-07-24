import { Injectable } from '@angular/core';
import { HttpClient } from '@microsoft/signalr';
import { Observable } from 'rxjs';
import { CrashPlaceBetModel } from '../assets/Models/crash-place-bet-request-model';

@Injectable({
  providedIn: 'root'
})
export class RequestsenderService {
  // private baseUrl: string = 'http://localhost:5514/api/';
  // private placeBetUrl:string = 'Transactions/CrashGamePlaceBet';
  // constructor(private httpclient:HttpClient) { }

  // PlaceBet(crashPlaceBetModel: any) {
  //   const url = `${this.baseUrl}/${this.placeBetUrl}`;
  //   return this.httpclient.post(url, crashPlaceBetModel);
  // }
}
