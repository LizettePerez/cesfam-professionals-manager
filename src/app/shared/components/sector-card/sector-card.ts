import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ProfessionalsService } from '../../../services/professionals.service';
import { Professional } from '../../models/professional.model';

@Component({
  selector: 'app-sector-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './sector-card.html',
  styleUrl: './sector-card.scss',
})
export class SectorCard implements OnInit {
  @Input() sectorName!: string;
  @Input() sectorType!: string;
  @Input() sectorId!: number;

  professionals: Professional[] = [];
  pageSize = 6;
  visibleCount = 6;

  constructor(
    private professionalsService: ProfessionalsService,
    private cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit() {
    const data = await this.professionalsService.getBySector(this.sectorId);

    this.professionals = data;

    this.visibleCount = Math.min(this.pageSize, this.professionals.length);
    this.cdr.detectChanges();
  }
  get visibleProfessionals() {
    return this.professionals.slice(0, this.visibleCount);
  }

  loadMore() {
    this.visibleCount = this.professionals.length;
  }

  get remainingCount(): number {
    return Math.max(this.professionals.length - this.visibleCount, 0);
  }

  addProfessional() {}
  editInformation() {}
}
