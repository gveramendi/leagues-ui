import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RolesRoutingModule } from './roles-routing.module';
import { RoleHomeComponent } from './pages/role-home/role-home.component';
import { RoleListComponent } from './pages/role-list/role-list.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RolesRoutingModule,
    RoleHomeComponent,
    RoleListComponent,
  ],
})
export class RolesModule {}
