import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserHomeComponent } from './pages/user-home/user-home.component';
import { UserListComponent } from './pages/user-list/user-list.component';

const routes: Routes = [
  {
    path: '',
    component: UserHomeComponent,
    children: [
      {
        path: 'list',
        component: UserListComponent,
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
export class UsersRoutingModule {}
