import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { ProfessionalsService } from './services/professionals.service';
import { ConfirmDialog } from './shared/components/confirm-dialog/confirm-dialog';
import { SearchBar } from './shared/components/search-bar/search-bar';
import { SectorCard } from './shared/components/sector-card/sector-card';
import { Professional } from './shared/models/professional.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SearchBar, SectorCard, MatIcon],
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
    { name: 'Agregar profesional', type: 'transversal', id: 6, professionals: [] },
  ];

  constructor(
    private professionalsService: ProfessionalsService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
  ) {}

  async ngOnInit() {
    await this.reloadDashboard();
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

  async reloadDashboard() {
    this.loading = true;

    try {
      const results = await this.professionalsService.getDashboard();

      this.sectors = this.sectors.map((sector) => ({
        ...sector,
        professionals: results.filter((p: Professional) => Number(p.sector) === sector.id),
      }));
    } catch (error) {
      console.error('Error al cargar profesionales:', error);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  get allProfessionals(): Professional[] {
    return this.sectors.flatMap((sector) => sector.professionals);
  }

  get filteredProfessionals(): Professional[] {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) return this.allProfessionals;

    return this.allProfessionals.filter((p) => p.nombre.toLowerCase().includes(term));
  }

  async reloadSector(sectorId: number) {
    try {
      const updated = await this.professionalsService.getDashboard();

      this.sectors = this.sectors.map((sector) => ({
        ...sector,
        professionals: updated.filter((p: Professional) => Number(p.sector) === sector.id),
      }));

      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error al actualizar el sector:', error);
    }
  }


addProfessional() {
  const sectorId = 6;

  const dialogRef = this.dialog.open(ConfirmDialog, {
    width: '800px',
    maxWidth: '95vw',
    data: {
      action: 'add',
      sectorId
    }
  });

  dialogRef.componentInstance.actionEvent?.subscribe((res: { action: string; }) => {
    if (res.action === 'create') {
      void this.reloadDashboard();
    }
  });

  dialogRef.afterClosed().subscribe((result: { success: any; }) => {
    if (result?.success) {
      void this.reloadDashboard();
    }
  });
}

}
