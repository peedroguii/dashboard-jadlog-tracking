export interface RemessaInfo {
  id: string;
  nomeDestinatario: string;
  cpfDestinatario: string;
  cnpjRemetente: string;
  numeroOperacional: string;
  dataEmissao?: string;
  valorFrete?: number;
  tracking?: TrackingInfo;
  isLoadingTracking?: boolean;
}

export interface TrackingInfo {
  status: string;
  ultimaAtualizacao: string;
  previsaoEntrega?: string;
  eventos: TrackingEvento[];
}

export interface TrackingEvento {
  data: string;
  status: string;
  unidade: string;
}

export interface TrackingResponse {
  consulta: Array<{
    codigo?: string;
    tracking?: {
      codigo: string;
      shipmentId: string;
      dacte?: string;
      dtEmissao: string;
      status: string;
      valor: number;
      peso: number;
      eventos: Array<{
        data: string;
        status: string;
        unidade: string;
      }>;
      volumes: Array<{
        peso: number;
        altura: number;
        largura: number;
        comprimento: number;
      }>;
    };
    previsaoEntrega?: string;
    erro?: {
      id: number;
      descricao: string;
      detalhe?: string;
    };
  }>;
}
