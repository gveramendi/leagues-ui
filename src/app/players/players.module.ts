import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { PlayersRoutingModule } from './players-routing.module';
import { PlayerHomeComponent } from './pages/player-home/player-home.component';
import { PlayerListComponent } from './pages/player-list/player-list.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PlayersRoutingModule,
    PlayerHomeComponent,
    PlayerListComponent,
  ],
})
export class PlayersModule {}
