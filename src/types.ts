export interface AuxilioItem {
  id?: string;
  interno: string;
  conductor: string;
  desc: string;
  mapa?: string | null;
  foto?: string | null;
  fecha: string;
}

export interface TareaItem {
  id?: string;
  interno: string;
  desc: string;
  estado?: string;
  foto?: string | null;
  mapa?: string | null;
  autor?: string;
  fecha: string;
}

export interface CorteItem {
  id?: string;
  titulo?: string;
  desc: string;
  mapa?: string | null;
  foto?: string | null;
  autor?: string;
  fecha: string;
}

export interface ComunicadoItem {
  id?: string;
  mensaje: string;
  autor: string;
  fecha: string;
  hora: string;
}

export interface HorarioItem {
  id?: string;
  titulo: string;
  foto: string;
}

export interface PerfilItem {
  id?: string;
  nombre?: string;
  apellido?: string;
  funcionario?: string;
  tel?: string;
  emergencia?: string;
  domicilio?: string;
  salud?: string;
  vencLibreta?: string;
  vencSalud?: string;
  foto?: string;
  correo?: string;
}

export interface PlanillaItem {
  foto?: string;
  autor?: string;
  fecha?: string;
  mapa?: string | null;
}

export interface CodigoItem {
  foto?: string;
}

export type SectionTab = 
  | 'tablero'
  | 'conductores'
  | 'codigos'
  | 'horarios'
  | 'directorio'
  | 'perfil'
  | 'taller';
