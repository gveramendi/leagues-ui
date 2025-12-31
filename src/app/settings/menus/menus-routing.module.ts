import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MenuHomeComponent } from './pages/menu-home/menu-home.component';
import { MenuListComponent } from './pages/menu-list/menu-list.component';

const routes: Routes = [
  {
    path: '',
    component: MenuHomeComponent,
    children: [
      {
        path: 'list',
        component: MenuListComponent,
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
export class MenusRoutingModule {}
