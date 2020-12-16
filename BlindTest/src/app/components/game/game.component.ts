import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { BlindtestService } from 'src/app/services/blindtest.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  pseudo:any;
  room:any;
  audio:any
  percent = 0;
  timer:any;
  roomInfo:any;
  receivedPublicMessage:any;
  song:any;
  receivedPrivateMessage:any;
  gameRestartStatue:any;
  songUrl:any;
  playerImg:any;
  didReceivedMusique = false

  constructor(private router: Router,private route: ActivatedRoute,private blindTestService:BlindtestService) { }

  ngOnInit(): void {
    this.blindTestService.connect('genre')
    this.playerImg = this.route.snapshot.paramMap.get('img');
    this.pseudo = this.route.snapshot.paramMap.get('pseudo');
    this.room = this.route.snapshot.paramMap.get('room');

    this.blindTestService.listen("Welcome").subscribe((data:any) => {
      console.log(data)
    })
    this.blindTestService.emit("joinRoom",{userName:this.pseudo,room:this.room,playerImg:this.playerImg});
    this.blindTestService.listen("newUser").subscribe( (data:any) =>{
      console.log("New User "+data);
    });
    
    this.blindTestService.listen("roomInfo").subscribe((data:any)=>{
      this.roomInfo = data;
    })
    
    this.blindTestService.listen("message").subscribe((data:any) => {
      this.receivedPublicMessage.push(data)
    })
    
    this.blindTestService.listen("playlist").subscribe((data:any) =>{
      this.didReceivedMusique = true
      this.song=data;
      this.audio = new Audio(data.song);
      this.audio.volume = 0.5
      this.audio.play();
      this.audio.addEventListener("playing", ()=> {
        var duration = this.audio.duration;
        this.advance(duration, this.audio);
      });
    })
    
    this.blindTestService.listen("gameRestart").subscribe((data:any) =>{
      console.log(data)
      this.gameRestartStatue = data;
    })
    
    this.blindTestService.listen("privateMessage").subscribe((data:any) =>{
      this.receivedPrivateMessage = data;
    })

    
  }

  advance(duration, element){
    var progress = document.getElementById("progress");
    this.percent = Math.floor(element.currentTime * 100/30);
    progress.style.width = this.percent +'%'
    this.startTimer(duration, element);
  }
  startTimer(duration, element){ 
    if(this.percent < 100) {
      this.timer = setTimeout(()=>{this.advance(duration, element)}, 100);
    }
  }

}
