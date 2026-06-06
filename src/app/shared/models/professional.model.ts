export interface Professional {
  id: number;
  nombre: string;
  especialidad: string;
  box: string;
  sector: number;
  duration?: number;
  wait_time?: number;
}

export interface CreateProfessional {
  nombre: string;
  especialidad: string;
  box: string;
  sector: number;
  duration?: number;
  wait_time?: number;
}
