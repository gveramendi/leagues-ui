import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ClubsRoutingModule } from './clubs-routing.module';
import { ClubHomeComponent } from './pages/club-home/club-home.component';
import { ClubListComponent } from './pages/club-list/club-list.component';
import { ClubDetailComponent } from './pages/club-detail/club-detail.component';
import { TeamDetailComponent } from './pages/team-detail/team-detail.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ClubsRoutingModule,
    ClubHomeComponent,
    ClubListComponent,
    ClubDetailComponent,
    TeamDetailComponent,
  ],
})
export class ClubsModule {}
