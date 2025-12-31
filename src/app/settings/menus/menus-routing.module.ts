import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MenuHomeComponent } from './pages/menu-home/menu-home.component';
import { MenuListComponent } from './pages/menu-list/menu-list.component';
import { MenuDetailComponent } from './pages/menu-detail/menu-detail.component';

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
        path: ':id/items',
        component: MenuDetailComponent,
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
