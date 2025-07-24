import { RequestsenderService } from './requestsender.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { SignalrService } from './services/signalr.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { CrashCashOutRequestModel, CrashPlaceBetModel } from '../assets/Models/crash-place-bet-request-model';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { interval, Observer } from 'rxjs';
import { CrashBalanceResponseModel, TransactionStatus } from '../assets/Models/crash-balance-response-model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  providers: [RequestsenderService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  getCashout(arg0: any) {
    return this.cashoputs.filter(x => x.userName == arg0)[0]?.amount ?? 0;
  }
  //private placeBetUrl:string = 'Transactions/CrashGamePlaceBet';

  placeBetModel: CrashPlaceBetModel = new CrashPlaceBetModel();
  players: any[] = [];
  cashoputs: any[] = [];
  activeBets: any[] = [];
  newactiveBets: any[] = [];
  history: number[] = [];
  message: string = "";
  messages: any[] = [];
  playerNameAux: string | null | undefined = '';
  isFlying = false;
  multiplier = 0.00;

  userBalance = 0;
  isBetPlaced = false;

  private intervalId: any;
  intervalCount = 0;
  constructor(private signalRService: SignalrService,
    private http: RequestsenderService,
    private route: ActivatedRoute,
    private httpclient: HttpClient,
    private cookieService: CookieService) {
    this.placeBetModel.playerName = this.cookieService.get('playerName');

  }

  ngOnInit(): void {
    this.intervalId = setInterval(() => {
      if (this.intervalCount > 0) {
        this.intervalCount -= 1;
      }
    }, 1000);

    this.history.unshift(0);

    this.signalRService.startConnection(() => {
      this.signalRService.sendMessage('RegisterClient', this.placeBetModel.sessionToken);
      this.signalRService.sendMessage('HandshakeMessageAsync', { userName: this.placeBetModel.playerName });
    });

    this.signalRService.onMessageReceived('RecieveMessageAsync', (message: any) => {
      this.messages.unshift(message);
    });

    this.signalRService.onMessageReceived('ui_UpdateUserBetAsync', (message: any) => {
        this.newactiveBets.unshift(message);
        this.newactiveBets.sort((a, b) => a.amount - b.amount);
    });


    this.signalRService.onMessageReceived('MultiplierUpdateAsync', (arg: number) => {
      if (!this.isFlying) {
        this.isFlying = true;
        this.activeBets = [...this.newactiveBets];
        this.newactiveBets.length = 0;
        if(!this.isBetPlaced)
        {
          this.placeBetModel.amount = 0;
        }
      }
      this.multiplier = arg;
    });

    this.signalRService.onMessageReceived('GameCrashedAsync', (arg: number) => {

      this.history.unshift(arg);

      this.isFlying = false;
      this.isBetPlaced = false;
      this.placeBetModel.amount = 0;
      this.isFlying = false;
      this.intervalCount = 13;

    });

    this.signalRService.onMessageReceived('PlayerCashedOutAsync', (arg: any) => {
      this.cashoputs.push(arg);
    });

    this.signalRService.onMessageReceived('UserConnectedAsync', (arg: any) => {
      this.messages.unshift({playerName:'SYSTEM', message:arg});
    });

    this.signalRService.onMessageReceived('LastCallAsync', (arg: any) => {
      this.intervalCount = 3;
      this.activeBets.length = 0;
      this.activeBets = [...this.newactiveBets];
      this.cashoputs.length = 0;
      this.multiplier = 1;
    });

    this.signalRService.onMessageReceived('PlayerBalanceAsync', (arg: any) => {
      this.userBalance = arg;
    });


    this.signalRService.onMessageReceived('HandshakeMessageAsync', (obj: any) => {
      this.players.unshift(obj);
    })

    this.route.queryParams.subscribe(params => {
      this.placeBetModel.sessionToken = params['SessionToken'] ?? '6713deaf-fdc1-461a-9188-08dd4f55abb3';
      this.placeBetModel.customer_Site_Name = params['SiteCode'] ?? 'coxino';
      this.placeBetModel.playerId = params['PlayerId'] ?? "1234";
      this.placeBetModel.customer_Curency_Name = params['Currency'] ?? "cox";
      this.placeBetModel.gameId = 'treel-games-crashapi';
    });

  }

  setPlayerName() {
    if (this.playerNameAux) {
      this.placeBetModel.playerName = this.playerNameAux;
      this.cookieService.set('playerName', this.playerNameAux!);
      this.signalRService.sendMessage('HandshakeMessageAsync', { userName: this.placeBetModel.playerName });
    }
  }
  baseUrl = 'https://volatiltreels-api.redpond-f06deadf.polandcentral.azurecontainerapps.io';
  placeBet() {
    this.httpclient.post<CrashBalanceResponseModel>(this.baseUrl + '/api/Transactions/CrashGamePlaceBet', this.placeBetModel).subscribe(this.CrashBalanceResponseObserver$);
  }
  cashout() {
    this.httpclient.post(this.baseUrl + '/api/Transactions/CrashGameCashout', this.placeBetModel).subscribe((x: any) => {
      this.userBalance = x.newBalance;
      this.isBetPlaced = false;
      this.placeBetModel.amount = 0;
    });
  }

  sendMessage(msg: string): void {
    this.signalRService.sendMessage('BroadcastMessageAsync', {
      message: msg,
      playerName: this.placeBetModel.playerName
    });
    this.message = '';
  }

  ngOnDestroy(): void {
    this.signalRService.stopConnection();
  }

  CrashBalanceResponseObserver$?: Partial<Observer<CrashBalanceResponseModel>> = {
    complete: () => {
      //console.log("Request Completed.");
    },
    error: (err) => {
      this.isBetPlaced = false;
      this.placeBetModel.amount = 0;
      this.messages.unshift({playerName:'SYSTEM', message:" Eroare interna, nu ai fost taxat. => " + JSON.stringify(err), type:'error'});
    },
    next: (response) => {
      switch(response.status){
        case TransactionStatus.SUCCESS:
          this.isBetPlaced = true;
          break;

        case TransactionStatus.REFUND_SUCCESS:
          this.placeBetModel.amount = 0;
          this.messages.unshift({playerName:'SYSTEM', message:" Plasarea pariului a esuat, nu ai fost taxat.", type:'error'});
          break;
      }
      this.userBalance = response.newBalance;
    },
  };
}
