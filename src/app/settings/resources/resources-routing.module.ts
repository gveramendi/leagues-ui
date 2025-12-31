import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ResourceHomeComponent } from './pages/resource-home/resource-home.component';
import { ResourceListComponent } from './pages/resource-list/resource-list.component';

const routes: Routes = [
  {
    path: '',
    component: ResourceHomeComponent,
    children: [
      {
        path: 'list',
        component: ResourceListComponent,
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
export class ResourcesRoutingModule {}
