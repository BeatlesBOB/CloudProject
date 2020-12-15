import { Injectable } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class BlindtestService {

  private socket;
  constructor() { 
    this.socket = io("http://localhost:3000")

  }

  emit(eventName : String, eventData : any){
    this.socket.emit(eventName,eventData);
  }

  listen(eventName : String){
    return new Observable((subscriber)=>{
      this.socket.on(eventName,(data)=>{
        subscriber.next(data)
      })
    })
  }
}
