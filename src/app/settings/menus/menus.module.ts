import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MenusRoutingModule } from './menus-routing.module';
import { MenuHomeComponent } from './pages/menu-home/menu-home.component';
import { MenuListComponent } from './pages/menu-list/menu-list.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MenusRoutingModule,
    MenuHomeComponent,
    MenuListComponent,
  ],
})
export class MenusModule {}
