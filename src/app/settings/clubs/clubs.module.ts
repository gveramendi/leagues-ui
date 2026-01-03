import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ClubsRoutingModule } from './clubs-routing.module';
import { ClubHomeComponent } from './pages/club-home/club-home.component';
import { ClubListComponent } from './pages/club-list/club-list.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ClubsRoutingModule,
    ClubHomeComponent,
    ClubListComponent,
  ],
})
export class ClubsModule {}
