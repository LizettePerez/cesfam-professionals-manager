import { Component } from '@angular/core';
import { SearchBar } from './shared/components/search-bar/search-bar';
import { SectorCard } from './shared/components/sector-card/sector-card';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SearchBar, SectorCard],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {

  sectors = [
    { name: 'Sector 1', type: 's1', id: 1 },
    { name: 'Sector 2', type: 's2', id: 2 },
    { name: 'Sector 3', type: 's3', id: 3 },
    { name: 'Sector 4', type: 's4', id: 4 },
    { name: 'Sector 5', type: 's5', id: 5 },
    { name: 'Transversal', type: 'transversal', id: 6 },
  ];

}
