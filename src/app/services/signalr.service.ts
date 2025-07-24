import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  private hubConnection!: signalR.HubConnection;

  constructor() {}

  startConnection(_then:Function): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
    .withUrl('https://treel-games-crashapi.redpond-f06deadf.polandcentral.azurecontainerapps.io/CrashHub') // Replace with your API endpoint
   // .withUrl('https://localhost:7268/CrashHub') // Replace with your API endpoint
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => {
        console.log('SignalR Connected');
        _then();
      })
      .catch(err => console.error('SignalR Connection Error: ', err));
  }

  stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
  }

  onMessageReceived(methodName: string, callback: (data: any) => void): void {
    this.hubConnection.on(methodName, callback);
  }

  sendMessage(methodName: string, data: any): void {
    this.hubConnection.invoke(methodName, data).catch(err => console.error(err));
  }
}
