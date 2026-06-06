import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Professional } from '../../models/professional.model';

@Component({
  selector: 'app-sector-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './sector-card.html',
  styleUrl: './sector-card.scss',
})
export class SectorCard {
  @Input() sectorName!: string;
  @Input() sectorType!: string;
  @Input() searchTerm = '';

  @Input() professionals: Professional[] = [];

  visibleCount = 6;

  get filteredProfessionals() {
    if (!this.searchTerm) return this.professionals;

    const term = this.searchTerm.toLowerCase();

    return this.professionals.filter(
      (p) =>
        p.nombre?.toLowerCase().includes(term) ||
        p.especialidad?.toLowerCase().includes(term) ||
        p.box?.toLowerCase().includes(term) ||
        String(p.sector).includes(term),
    );
  }

  get visibleProfessionals() {
    return this.filteredProfessionals.slice(0, this.visibleCount);
  }

  get remainingCount() {
    return Math.max(this.filteredProfessionals.length - this.visibleCount, 0);
  }

  get hasResults(): boolean {
    return this.filteredProfessionals.length > 0;
  }

  loadMore() {
    this.visibleCount = this.filteredProfessionals.length;
  }
}
