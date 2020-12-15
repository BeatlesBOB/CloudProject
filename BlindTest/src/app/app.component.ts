import { Component, OnInit } from '@angular/core';
import { BlindtestService } from './services/blindtest.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  
  constructor(private blindtestService : BlindtestService){}
  
  ngOnInit(): void {
  }
  
}
