import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClubHomeComponent } from './pages/club-home/club-home.component';
import { ClubListComponent } from './pages/club-list/club-list.component';

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
