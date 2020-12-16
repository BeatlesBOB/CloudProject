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

  constructor(private blindTestService: BlindtestService,private router: Router,private route: ActivatedRoute) { }

  ngOnInit(): void {
   this.pseudo = this.route.snapshot.paramMap.get('pseudo');
    this.blindTestService.getCategories().subscribe((data:any)=>{
      this.genres = data.data;
      console.log(this.genres);
    })
  }

  clickOnGenre(genre){
    this.router.navigate(['/genre/'+genre, {pseudo: this.pseudo,room:genre}]);
  }

}
