import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClubHomeComponent } from './pages/club-home/club-home.component';
import { ClubListComponent } from './pages/club-list/club-list.component';
import { ClubDetailComponent } from './pages/club-detail/club-detail.component';
import { TeamDetailComponent } from './pages/team-detail/team-detail.component';

const routes: Routes = [
  {
    path: '',
    component: ClubHomeComponent,
    children: [
      {
        path: 'list',
        component: ClubListComponent,
      },
      {
        path: ':clubId',
        component: ClubDetailComponent,
      },
      {
        path: ':clubId/teams/:teamId',
        component: TeamDetailComponent,
      },
      {
        path: '**',
        redirectTo: 'list',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClubsRoutingModule {}
