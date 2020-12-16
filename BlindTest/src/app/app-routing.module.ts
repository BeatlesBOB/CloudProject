import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GameComponent } from './components/game/game.component';
import { GenresComponent } from './components/genres/genres.component';
import { HomeComponent } from './components/home/home.component';
import { TestComponent } from './components/test/test.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'genres', component: GenresComponent },
  { path: 'genre/:id', component: GameComponent },
  { path: 'custom/:id', component: TestComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
