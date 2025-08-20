import { NextRequest, NextResponse } from 'next/server';

const JADLOG_API_URL = 'https://prd-traffic.jadlogtech.com.br/embarcador/api/tracking/simples/consultar';
const BATCH_SIZE = 100; // Máximo permitido pela API da Jadlog
const DELAY_BETWEEN_BATCHES = 2000; // 2 segundos entre lotes para evitar rate limiting

interface BatchResult {
  numeroOperacional: string;
  success: boolean;
  tracking?: {
    status: string;
    ultimaAtualizacao: string;
    previsaoEntrega?: string;
    eventos: Array<{
      data: string;
      status: string;
      unidade: string;
    }>;
  };
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { numeroOperacionais } = await request.json();

    if (!numeroOperacionais || !Array.isArray(numeroOperacionais)) {
      return NextResponse.json(
        { error: 'Lista de números operacionais é obrigatória' },
        { status: 400 }
      );
    }

    if (numeroOperacionais.length === 0) {
      return NextResponse.json({ results: [] });
    }

    // Dividir em lotes de acordo com o limite da API
    const batches = [];
    for (let i = 0; i < numeroOperacionais.length; i += BATCH_SIZE) {
      batches.push(numeroOperacionais.slice(i, i + BATCH_SIZE));
    }

    const allResults: BatchResult[] = [];
    let processedCount = 0;

    // Processar cada lote com delay
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      
      try {
        // Preparar consulta para o lote atual
        const consulta = batch.map(numeroOperacional => ({
          pedido: numeroOperacional
        }));

        // Fazer chamada para a API da Jadlog
        const response = await fetch(JADLOG_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.JADLOG_API_TOKEN || 'demo-token'}`
          },
          body: JSON.stringify({ consulta })
        });

        if (!response.ok) {
          console.error(`Erro na API Jadlog para lote ${batchIndex + 1}:`, response.status);
          // Adicionar resultados de erro para este lote
          batch.forEach(numeroOperacional => {
            allResults.push({
              numeroOperacional,
              success: false,
              error: `Erro HTTP ${response.status}`
            });
          });
        } else {
          const data = await response.json();
          
          // Processar resultados do lote
          if (data.consulta && Array.isArray(data.consulta)) {
            data.consulta.forEach((item: any, index: number) => {
              const numeroOperacional = batch[index];
              
              if (item.tracking) {
                allResults.push({
                  numeroOperacional,
                  success: true,
                  tracking: {
                    status: item.tracking.status || 'Não disponível',
                    ultimaAtualizacao: item.tracking.dtEmissao || new Date().toLocaleDateString('pt-BR'),
                    previsaoEntrega: item.previsaoEntrega,
                    eventos: item.tracking.eventos || []
                  }
                });
              } else {
                allResults.push({
                  numeroOperacional,
                  success: false,
                  error: 'Tracking não encontrado'
                });
              }
            });
          } else {
            // Se não há dados de consulta, marcar todos como erro
            batch.forEach(numeroOperacional => {
              allResults.push({
                numeroOperacional,
                success: false,
                error: 'Resposta inválida da API'
              });
            });
          }
        }

        processedCount += batch.length;

        // Delay entre lotes (exceto no último)
        if (batchIndex < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
        }

      } catch (error) {
        console.error(`Erro ao processar lote ${batchIndex + 1}:`, error);
        // Adicionar resultados de erro para este lote
        batch.forEach(numeroOperacional => {
          allResults.push({
            numeroOperacional,
            success: false,
            error: 'Erro de conexão'
          });
        });
      }
    }

    return NextResponse.json({
      results: allResults,
      summary: {
        total: numeroOperacionais.length,
        processed: processedCount,
        successful: allResults.filter(r => r.success).length,
        failed: allResults.filter(r => !r.success).length,
        batches: batches.length
      }
    });

  } catch (error) {
    console.error('Erro na API de consulta em lote:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
