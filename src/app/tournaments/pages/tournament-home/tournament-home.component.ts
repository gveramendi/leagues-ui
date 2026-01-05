import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-tournament-home',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './tournament-home.component.html',
  styleUrls: ['./tournament-home.component.scss'],
})
export class TournamentHomeComponent {}
