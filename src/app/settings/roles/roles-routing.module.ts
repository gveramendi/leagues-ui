import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleHomeComponent } from './pages/role-home/role-home.component';
import { RoleListComponent } from './pages/role-list/role-list.component';

const routes: Routes = [
  {
    path: '',
    component: RoleHomeComponent,
    children: [
      {
        path: 'list',
        component: RoleListComponent,
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
export class RolesRoutingModule {}
