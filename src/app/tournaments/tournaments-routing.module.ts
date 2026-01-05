import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TournamentHomeComponent } from './pages/tournament-home/tournament-home.component';
import { TournamentListComponent } from './pages/tournament-list/tournament-list.component';
import { TournamentDetailComponent } from './pages/tournament-detail/tournament-detail.component';

const routes: Routes = [
  {
    path: '',
    component: TournamentHomeComponent,
    children: [
      { path: 'list', component: TournamentListComponent },
      { path: ':tournamentId', component: TournamentDetailComponent },
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: '**', redirectTo: 'list' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TournamentsRoutingModule {}
