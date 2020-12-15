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

    this.blindTestService.getCategories().subscribe((data:any)=>{
      this.genres = data.data;
    })

    this.answerVerification("test-abc-test", "test-abc-test");

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
    this.blindTestService.emit("joinRoom",{userName : this.sendingPseudo,room:"party"});
  }
  
  
  openPrivateMessage(receiver){
    this.openPrivate = true;
    this.receiver = receiver;
  }
  
  sendPrivateMessage(){
    this.blindTestService.emit("chatMessagePrivate", {idReceiver : this.receiver.id,msg: this.sendingPrivateMessage});
  }

  answerVerification(answer: string, answerOfPlayer: string)
  {
    let arrayAnswer:any
    arrayAnswer = answer.replace(/\s/g, '').split('');
    let arrayAnswerOfPlayer:any
    arrayAnswerOfPlayer = answerOfPlayer.replace(/\s/g, '').split('');
    let difference = this.array_diff(arrayAnswer, arrayAnswerOfPlayer);
    if(difference === 0)
    {
     console.log("Bonne réponse")
    }else if(difference <= 2)
    {
      console.log("presque réponse")
    }else{
      console.log("pas bon")
    }
  }

  array_diff(array1 : [], array2 : [])
  {
    let count = 0;
    if(array1.length >= array2.length)
    {
      for(let i = 0; i <= array1.length;i++)
      {
        if(array1[i] !== array2[i])
        {
          count = count+1;
        }
      }
    }else{
      for(let i = 0; i <= array2.length;i++)
      {
        if(array2[i] !== array1[i])
        {
          count = count+1;
        }
      }
    }
    return count;
  }

}
