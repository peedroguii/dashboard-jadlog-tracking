import { TrackingResponse } from '@/types/jadlog';

export class JadlogAPI {
  private baseURL = 'https://prd-traffic.jadlogtech.com.br/embarcador/api/tracking';
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  async consultarTracking(numeroOperacional: string): Promise<TrackingResponse | null> {
    try {
      const response = await fetch(`${this.baseURL}/consultar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({
          consulta: [
            {
              codigo: numeroOperacional
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao consultar tracking:', error);
      return null;
    }
  }

  async consultarTrackingSimples(numeroOperacional: string): Promise<TrackingResponse | null> {
    try {
      const response = await fetch(`${this.baseURL}/simples/consultar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({
          consulta: [
            {
              codigo: numeroOperacional
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao consultar tracking simples:', error);
      return null;
    }
  }
}
