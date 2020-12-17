import { Component, OnInit } from '@angular/core';
import { BlindtestService } from 'src/app/services/blindtest.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-genres',
  templateUrl: './genres.component.html',
  styleUrls: ['./genres.component.css']
})
export class GenresComponent implements OnInit {

  genres = [];
  pseudo;
  imgPlayer;

  constructor(private blindTestService: BlindtestService,private router: Router,private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.pseudo = this.route.snapshot.paramMap.get('pseudo');
    this.imgPlayer = this.route.snapshot.paramMap.get('img');

    this.blindTestService.getCategories().subscribe((data:any)=>{
      this.genres = data.data;
    })
  }

  clickOnGenre(genre){
    this.router.navigate(['/genre/'+genre, {pseudo: this.pseudo,room:genre,img:this.imgPlayer}]);
  }

}
