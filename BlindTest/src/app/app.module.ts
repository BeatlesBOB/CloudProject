import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TestComponent } from './components/test/test.component';
import { FormsModule } from '@angular/forms';
import { HomeComponent } from './components/home/home.component';
import { GenresComponent } from './components/genres/genres.component';
import { GameComponent } from './components/game/game.component';
import { ClassementPipe } from './pipes/classement.pipe';

@NgModule({
  declarations: [
    AppComponent,
    TestComponent,
    HomeComponent,
    GenresComponent,
    GameComponent,
    ClassementPipe
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
