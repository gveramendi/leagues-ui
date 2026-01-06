import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RefereeHomeComponent } from './pages/referee-home/referee-home.component';
import { RefereeListComponent } from './pages/referee-list/referee-list.component';

const routes: Routes = [
  {
    path: '',
    component: RefereeHomeComponent,
    children: [
      {
        path: 'list',
        component: RefereeListComponent,
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
export class RefereesRoutingModule {}
