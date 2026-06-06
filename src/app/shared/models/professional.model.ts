export interface Professional {
  id: number;
  nombre: string;
  profesion: string;
  box: string;
  sector: number;
  duration?: number;
  waitTime?: number;
}

export interface CreateProfessional {
  nombre: string;
  profesion: string;
  box: string;
  sector: number;
  duration?: number;
  waitTime?: number;
}
