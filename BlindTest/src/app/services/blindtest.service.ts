import { Injectable } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import { io } from 'socket.io-client';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BlindtestService {

  private socket;
  constructor(private http: HttpClient) { 
  }
  connect(nameSpace){
    this.socket = io('http://localhost:3000/'+nameSpace);
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

  getCategories(){
    return this.http.get("http://localhost:3000/genres")
  }
  getSpecArtistes(id){
    return this.http.get("http://localhost:3000/artistes/"+id)
  }

  search(q,type){
    return this.http.get("http://localhost:3000/search?q="+q+"&type="+type)
  }

}
