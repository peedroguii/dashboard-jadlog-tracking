import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { numeroOperacional } = await request.json();

    if (!numeroOperacional) {
      return NextResponse.json(
        { error: 'Número operacional é obrigatório' },
        { status: 400 }
      );
    }

    // Por enquanto, vamos simular a resposta da API
    // Em produção, você deve configurar a variável de ambiente JADLOG_API_TOKEN
    const token = process.env.JADLOG_API_TOKEN;

    if (!token) {
      // Retorna dados simulados para demonstração
      return NextResponse.json({
        consulta: [
          {
            codigo: numeroOperacional,
            tracking: {
              codigo: numeroOperacional,
              shipmentId: `SH${numeroOperacional}`,
              dacte: null,
              dtEmissao: new Date().toLocaleDateString('pt-BR'),
              status: 'EM_TRANSITO',
              valor: 61.69,
              peso: 15.0,
              eventos: [
                {
                  data: new Date().toISOString(),
                  status: 'COLETA_SOLICITADA',
                  unidade: 'UNIDADE ORIGEM'
                },
                {
                  data: new Date(Date.now() - 86400000).toISOString(),
                  status: 'EM_TRANSITO',
                  unidade: 'CENTRO DE DISTRIBUIÇÃO'
                }
              ],
              volumes: [
                {
                  peso: 15.0,
                  altura: 10,
                  largura: 20,
                  comprimento: 30
                }
              ]
            },
            previsaoEntrega: new Date(Date.now() + 172800000).toLocaleDateString('pt-BR')
          }
        ]
      });
    }

    // Fazer a chamada real para a API da Jadlog
    const response = await fetch('https://prd-traffic.jadlogtech.com.br/embarcador/api/tracking/simples/consultar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
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
      throw new Error(`Erro na API Jadlog: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Erro ao consultar tracking:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
