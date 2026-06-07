import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Professional } from '../../models/professional.model';
import { ConfirmDialog } from '../confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-sector-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatDialogModule],
  templateUrl: './sector-card.html',
  styleUrl: './sector-card.scss',
})
export class SectorCard {
  @Input() sectorName!: string;
  @Input() sectorType!: string;
  @Input() searchTerm = '';
  @Input() sectorId!: number;

  @Input() professionals: Professional[] = [];
  @Output() refreshSector = new EventEmitter<number>();

  constructor(private dialog: MatDialog) {}

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

  confirmDialog(action: 'add' | 'edit' | 'delete', professional?: Professional) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '800px',
      maxWidth: '95vw',
      data: {
        action,
        professional,
        sectorId: this.sectorId,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result?.success) return;

      this.refreshSector.emit(this.sectorId);
    });
  }
}
