import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlayerHomeComponent } from './pages/player-home/player-home.component';
import { PlayerListComponent } from './pages/player-list/player-list.component';

const routes: Routes = [
  {
    path: '',
    component: PlayerHomeComponent,
    children: [
      {
        path: 'list',
        component: PlayerListComponent,
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
export class PlayersRoutingModule {}
