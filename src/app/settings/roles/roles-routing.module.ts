import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleHomeComponent } from './pages/role-home/role-home.component';
import { RoleListComponent } from './pages/role-list/role-list.component';
import { RoleFormComponent } from './pages/role-form/role-form.component';

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
        path: 'create',
        component: RoleFormComponent,
      },
      {
        path: 'edit/:id',
        component: RoleFormComponent,
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
