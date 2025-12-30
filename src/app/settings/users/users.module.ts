import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { UsersRoutingModule } from './users-routing.module';
import { UserHomeComponent } from './pages/user-home/user-home.component';
import { UserListComponent } from './pages/user-list/user-list.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    UsersRoutingModule,
    UserHomeComponent,
    UserListComponent,
  ],
})
export class UsersModule {}
