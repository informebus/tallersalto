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

export interface ObjetoPerdidoItem {
  id?: string;
  fecha: string;
  articulo: string;
  encontrado_por: string;
  estado: 'Retenido' | 'Devuelto';
  entregado_a?: string;
  foto?: string; // base64
}

export interface CambioTurnoItem {
  id?: string;
  fecha_solicitud: string;
  conductor_solicitante: string;
  turno_original: string;
  conductor_reemplazo: string;
  estado: 'Pendiente' | 'Aprobado' | 'Rechazado';
}

export type SectionTab = 
  | 'tablero'
  | 'conductores'
  | 'codigos'
  | 'horarios'
  | 'directorio'
  | 'perfil'
  | 'taller'
  | 'objetos_perdidos'
  | 'cambios_turno';
