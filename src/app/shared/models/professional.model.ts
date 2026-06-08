export interface Professional {
  id: number;
  nombre: string;
  especialidad: string;
  sector: number;

  box: string;

  schedule_id?: number | null;
  days: number[] | null;
  start_time: string | null;
  end_time: string | null;
}
