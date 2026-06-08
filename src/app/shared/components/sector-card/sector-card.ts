import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
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
export class SectorCard implements OnChanges {
  @Input() sectorName!: string;
  @Input() sectorType!: string;
  @Input() searchTerm = '';
  @Input() sectorId!: number;

  @Input() professionals: Professional[] = [];
  @Output() refreshSector = new EventEmitter<number>();

  ngOnChanges() {
    this.updateVisible();
  }

  constructor(private dialog: MatDialog) {}

  visibleCount = 6;

  get filteredProfessionals() {
    const base = this.professionals;

    if (!this.searchTerm) return base;

    const term = this.searchTerm.toLowerCase();

    return base.filter(
      (p) =>
        p.nombre?.toLowerCase().includes(term) ||
        p.especialidad?.toLowerCase().includes(term) ||
        p.box?.toLowerCase().includes(term) ||
        String(p.sector).includes(term),
    );
  }

  visibleProfessionals: Professional[] = [];

  private updateVisible() {
    const base = this.filteredProfessionals;
    this.visibleProfessionals = base.slice(0, this.visibleCount);
  }

  get remainingCount() {
    return Math.max(this.filteredProfessionals.length - this.visibleCount, 0);
  }

  get hasResults(): boolean {
    return this.filteredProfessionals.length > 0;
  }

  isExpanded = false;
  readonly defaultVisibleCount = 6;

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
    this.visibleCount = this.isExpanded
      ? this.filteredProfessionals.length
      : this.defaultVisibleCount;

    this.updateVisible();
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

    const instance = dialogRef.componentInstance;

    // 🔥 CREATE / EDIT (no cierran dialog)
    instance.actionEvent?.subscribe((res) => {
      if (res.action === 'create' || res.action === 'edit') {
        this.refreshSector.emit(this.sectorId);
      }
    });

    // 🔥 DELETE (si cierra dialog)
    dialogRef.afterClosed().subscribe((result) => {
      if (!result?.success) return;
      this.refreshSector.emit(this.sectorId);
    });
  }

  formatDay(day: number): string {
    const map: Record<number, string> = {
      0: 'L',
      1: 'M',
      2: 'Mi',
      3: 'J',
      4: 'V',
      5: 'S',
    };

    return map[day] ?? '';
  }
}
