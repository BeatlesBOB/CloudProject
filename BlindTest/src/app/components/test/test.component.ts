import { Component, OnInit } from '@angular/core';
import { BlindtestService } from 'src/app/services/blindtest.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {

  public sendingMessage;
  public sendingPrivateMessage;
  public sendingPseudo;
  public song;
  public messages = [];
  public roomInfo;
  public openPrivate = false;
  public receiver;
  profileImg = ["image 1","image 2"]
  selectedImage: String;
  public genres = [];
  audio:any
  percent = 0;
  timer:any
  bookList = ["oui","non","oui","non","oui","non","oui","non","oui","non","oui","non","oui","non","oui","non","oui","non","oui","non","oui","non"]
  constructor(private blindTestService: BlindtestService) { }

  ngOnInit(): void {
    // this.blindTestService.listen("newUser").subscribe( (data:any) =>{
    //   console.log("New User "+data);
    // });
    // this.blindTestService.listen("roomInfo").subscribe((data:any)=>{
    //   this.roomInfo = data;
    // })
    // this.blindTestService.listen("message").subscribe((data:any) => {
    //   this.messages.push(data)
    // })
    // this.blindTestService.listen("playlist").subscribe((data:any) =>{
    //   this.song =data.song
    //   console.log(data);
    // })
    // this.blindTestService.listen("gameRestart").subscribe((data:any) =>{
    //  console.log(data);
    // })

    // this.blindTestService.listen("privateMessage").subscribe((data:any) =>{
    //   console.log(data.from);
    //   console.log(data.message);
    // })

    this.blindTestService.emit("answer",{answer :"rien a voir",goodArtiste:"rien a",goodSong:"rien a voir"})
    this.blindTestService.listen("Test").subscribe((data:any) =>{
      console.log(data.point);
    })

    // this.blindTestService.getCategories().subscribe((data:any)=>{
    //   this.genres = data.data;
    // })
    // console.log(uuidv4());
    
    // this.blindTestService.search("tania%20bowra","artist").subscribe((data:any)=>{
    //   console.log(data)
    // })
    this.audio = new Audio('https://p.scdn.co/mp3-preview/4839b070015ab7d6de9fec1756e1f3096d908fba?cid=774b29d4f13844c495f206cafdad9c86');
    this.audio.addEventListener("playing", ()=> {
      var duration = this.audio.duration;
      this.advance(duration, this.audio);
    });

  }

  getImagesrc(){
    document.querySelectorAll('.active').forEach((el) => {
      console.log(el.children[0].getAttribute('src'));
    });
  }

  sendMessage(){
    this.blindTestService.emit("chatMessage", this.sendingMessage)
  }

  sendPseudo(){
  }
  
  playtest(){
    this.audio.play();
  }
  
  openPrivateMessage(receiver){
    this.openPrivate = true;
    this.receiver = receiver;
  }
  
  sendPrivateMessage(){
    this.blindTestService.emit("chatMessagePrivate", {idReceiver : this.receiver.id,msg: this.sendingPrivateMessage});
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
  joinGame(room){
    this.blindTestService.emit("joinRoom",{userName : this.sendingPseudo,room});
  }

}
