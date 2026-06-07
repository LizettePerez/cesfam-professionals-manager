import { Injectable } from '@angular/core';
import { Professional } from '../shared/models/professional.model';
import { ApiService } from './api.service';

export interface CreateScheduleDto {
  professional_id: number;
  box: string;
  start_time: string | null;
  end_time: string | null;
  days: number[] | null;
}
@Injectable({
  providedIn: 'root',
})
export class ProfessionalsService {
  constructor(private api: ApiService) {}

  // ======================
  // BASIC CRUD
  // ======================
  getAll() {
    return this.api.get<Professional[]>('professionals');
  }

  getBySector(sector: number) {
    return this.api.get<Professional[]>(`professionals/sector/${sector}`);
  }

  search(name: string) {
    return this.api.get<Professional[]>(`professionals/search?name=${name}`);
  }

  create(data: Partial<Professional>) {
    return this.api.post<Professional>('professionals', data);
  }

  // ======================
  // SCHEDULE / BOX LOGIC
  // ======================
  getResolveBox(professionalId: number, dt: string) {
    return this.api.get<any>(`resolve-box?professional_id=${professionalId}&dt=${dt}`);
  }

  createSchedule(data: CreateScheduleDto) {
    return this.api.post<any>('schedules', data);
  }

  // ======================
  // HELPERS (FRONT LOGIC CLEAN)
  // ======================
  async getSectorWithBoxes(sectorId: number) {
    const professionals = await this.getBySector(sectorId);
    const now = new Date().toISOString();

    const enriched = await Promise.all(
      professionals.map(async (p) => {
        const res = await this.getResolveBox(p.id, now);

        return {
          ...p,
          box: res.box ?? 'Sin asignar',
        };
      }),
    );

    return enriched;
  }

  getDashboard(sectorId: number, dt: string) {
    return this.api.get<any>(`dashboard?sector_id=${sectorId}&dt=${dt}`);
  }

  deleteProfessional(id: number) {
    return this.api.delete<any>(`professionals/${id}`);
  }

  deleteSchedule(scheduleId: number) {
    return this.api.delete<any>(`schedules/${scheduleId}`);
  }

  deleteSchedulesByProfessional(professionalId: number) {
    return this.api.delete<any>(`schedules/professional/${professionalId}`);
  }
}
