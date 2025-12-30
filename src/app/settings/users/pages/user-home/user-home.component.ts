import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-user-home',
  standalone: true,
  templateUrl: './user-home.component.html',
  styleUrls: ['./user-home.component.scss'],
  imports: [RouterOutlet]
})
export class UserHomeComponent {

}
