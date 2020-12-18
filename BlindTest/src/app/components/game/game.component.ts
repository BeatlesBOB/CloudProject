import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { BlindtestService } from 'src/app/services/blindtest.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit,OnDestroy {

  pseudo:any;
  room:any;
  audio = new Audio("");
  percent = 0;
  timer:any;
  roomInfo:any;
  receivedPublicMessage=[];
  song:any;
  receivedPrivateMessage=[];
  gameRestartStatue:any;
  songUrl:any;
  playerImg:any;
  musicsPlayed = [];
  socketId;
  publicMessage;
  url;
  reponsePlayer;
  isAdmin = false;
  asReceivedMusique = false;
  isSongFound = false;
  isArtistFound = false;
  arrivedPlayer = []
  isGameFinished = false;
  gameRestart:any


  constructor(private router: Router,private route: ActivatedRoute,private blindTestService:BlindtestService) { }
  ngOnDestroy(): void {
   this.audio.pause()
   this.blindTestService.emit("disconnectCustom",this.socketId);

  }

  ngOnInit(): void {
    this.url = this.router.url.split(";")[0];
    this.blindTestService.connect('genre')
    this.playerImg = this.route.snapshot.paramMap.get('img');
    this.pseudo = this.route.snapshot.paramMap.get('pseudo');
    this.room = this.route.snapshot.paramMap.get('room');

    this.blindTestService.listen("Welcome").subscribe((data:any) => {
      this.socketId = data;
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
      this.isGameFinished = false;
      this.isArtistFound = false;
      this.isSongFound = false;
      this.audio.src = data.song;
      this.audio.volume = 0.2
      this.asReceivedMusique = true;
      this.song=data;
      this.audio.play();
      this.historic(data);
      this.audio.addEventListener("playing", ()=> {
        var duration = this.audio.duration;
        this.advance(duration, this.audio);
      });
    
    })

    this.blindTestService.listen("gameRestart").subscribe((data:any) =>{
      this.gameRestart = data;
    })
    this.blindTestService.listen("resultArtist").subscribe((data:any) =>{
      this.isArtistFound = data;
    })
    this.blindTestService.listen("resultSong").subscribe((data:any) =>{
      this.isSongFound = data;
    })
    
    this.blindTestService.listen("privateMessage").subscribe((data:any) =>{
      this.receivedPrivateMessage = data;
    })

  }
  sendReponse(){
    if(this.song != undefined && this.reponsePlayer != undefined ){
      this.blindTestService.emit("answer",{answer: this.reponsePlayer,goodArtiste:this.song.artists[0].name,goodSong:this.song.title});
      this.reponsePlayer="";
    }
  }
  advance(duration,element){
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
  historic(data){
    setTimeout(()=>{this.musicsPlayed.push(data)}, 30000)
  }
  
  
  sendPublicMessage(){
    if(this.publicMessage !=undefined && this.publicMessage !="" && this.publicMessage !=" "){
      this.blindTestService.emit("chatMessage", this.publicMessage);
      this.publicMessage = "";
    }
  }
}
