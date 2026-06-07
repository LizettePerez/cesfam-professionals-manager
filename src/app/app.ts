import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ProfessionalsService } from './services/professionals.service';
import { SearchBar } from './shared/components/search-bar/search-bar';
import { SectorCard } from './shared/components/sector-card/sector-card';
import { Professional } from './shared/models/professional.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SearchBar, SectorCard],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  searchTerm = '';

  sectors: {
    name: string;
    type: string;
    id: number;
    professionals: Professional[];
  }[] = [
    { name: 'Sector 1', type: 's1', id: 1, professionals: [] },
    { name: 'Sector 2', type: 's2', id: 2, professionals: [] },
    { name: 'Sector 3', type: 's3', id: 3, professionals: [] },
    { name: 'Sector 4', type: 's4', id: 4, professionals: [] },
    { name: 'Sector 5', type: 's5', id: 5, professionals: [] },
    { name: 'Transversal', type: 'transversal', id: 6, professionals: [] },
  ];

  constructor(
    private professionalsService: ProfessionalsService,
    private cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit() {
    this.loading = true;

    try {
      const now = new Date().toISOString();

      const requests = this.sectors.map((sector) =>
        this.professionalsService.getDashboard(sector.id, now),
      );

      const results = await Promise.all(requests);

      this.sectors = this.sectors.map((sector, index) => ({
        ...sector,
        professionals: results[index],
      }));
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  onSearch(value: string) {
    this.searchTerm = value;
  }

  loading = true;
  loadedCards = 0;
  onSectorLoaded() {
    this.loadedCards++;

    if (this.loadedCards === this.sectors.length) {
      this.loading = false;
    }
  }

  get filteredSectors() {
    if (!this.searchTerm) return this.sectors;

    return this.sectors
      .map((sector) => ({
        ...sector,
        professionals: sector.professionals.filter((p) =>
          p.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()),
        ),
      }))
      .filter((sector) => sector.professionals.length > 0);
  }
}
