
export type StatusType = 
  | "Resolvido"
  | "Pendente Usuário"
  | "Pendente Fornecedor"
  | "N1"
  | "Exaudi"
  | "2G"
  | "Pendente PO";

export interface Ticket {
  id: string; // O número do chamado
  status: StatusType | string;
  dataAbertura: string; // ISO Date
  descricao: string;
  pendenteUsuarioDesde?: string; // ISO Date
}

export interface DashboardStats {
  total: number;
  resolvidos: number;
  pendenteUsuario: number;
  alertasAtivos: number;
  porStatus: Record<string, number>;
}
