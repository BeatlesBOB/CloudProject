import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  
  selectedImg:String;
  pseudo:String;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.getImagesrc();
  }

  getImagesrc(){
    document.querySelectorAll('.active').forEach((el) => {
      this.selectedImg = el.children[0].getAttribute('src')
    });
  }
  play(){
    if(this.pseudo != undefined || this.pseudo != ""){
      this.router.navigate(['/genres', { pseudo: this.pseudo }]);
    }
  }
  custom(){
    if(this.pseudo != undefined || this.pseudo != ""){
      this.router.navigate(['/custom', { room: uuidv4()}]);
    }
  }
}
