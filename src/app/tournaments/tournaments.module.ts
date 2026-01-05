import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TournamentsRoutingModule } from './tournaments-routing.module';
import { TournamentHomeComponent } from './pages/tournament-home/tournament-home.component';
import { TournamentListComponent } from './pages/tournament-list/tournament-list.component';
import { TournamentDetailComponent } from './pages/tournament-detail/tournament-detail.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TournamentsRoutingModule,
    TournamentHomeComponent,
    TournamentListComponent,
    TournamentDetailComponent,
  ],
})
export class TournamentsModule {}
