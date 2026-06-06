import { Injectable } from '@angular/core';
import { Professional } from '../shared/models/professional.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class ProfessionalsService {
  constructor(private api: ApiService) {}

  getAll() {
    return this.api.get<Professional[]>('professionals');
  }

  getBySector(sector: number) {
    return this.api.get<Professional[]>(`professionals/sector/${sector}`);
  }

  // create(data: CreateProfessional) {
  //   return this.api.post<Professional>('professionals', data);
  // }

  // update(id: number, data: CreateProfessional) {
  //   return this.api.put<Professional>(`professionals/${id}`, data);
  // }

  // delete(id: number) {
  //   return this.api.delete(`professionals/${id}`);
  // }
}
