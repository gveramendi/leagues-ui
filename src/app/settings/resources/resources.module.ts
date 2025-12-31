import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ResourcesRoutingModule } from './resources-routing.module';
import { ResourceHomeComponent } from './pages/resource-home/resource-home.component';
import { ResourceListComponent } from './pages/resource-list/resource-list.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ResourcesRoutingModule,
    ResourceHomeComponent,
    ResourceListComponent,
  ],
})
export class ResourcesModule {}
