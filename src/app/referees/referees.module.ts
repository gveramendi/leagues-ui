import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { RefereesRoutingModule } from './referees-routing.module';
import { RefereeHomeComponent } from './pages/referee-home/referee-home.component';
import { RefereeListComponent } from './pages/referee-list/referee-list.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RefereesRoutingModule,
    RefereeHomeComponent,
    RefereeListComponent,
  ],
})
export class RefereesModule {}
