'use client';

import { useState } from 'react';
import { RemessaInfo, TrackingInfo } from '@/types/jadlog';
import { JadlogAPI } from '@/lib/jadlog-api';

interface RemessasListProps {
  remessas: RemessaInfo[];
  onClear: () => void;
  onUpdateRemessa: (index: number, remessa: RemessaInfo) => void;
  filtroAtivo: string | null;
}

export default function RemessasList({ remessas, onClear, onUpdateRemessa, filtroAtivo }: RemessasListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isUpdatingAll, setIsUpdatingAll] = useState(false);
  const [updateProgress, setUpdateProgress] = useState({ current: 0, total: 0 });

  if (remessas.length === 0) {
    return null;
  }

  const formatCPF = (cpf: string) => {
    if (cpf.length === 11) {
      return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return cpf;
  };

  const formatCNPJ = (cnpj: string) => {
    if (cnpj.length === 14) {
      return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return cnpj;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  const atualizarTodos = async () => {
    if (isUpdatingAll) return;

    // Filtrar remessas que têm número operacional
    const remessasComNumero = remessas
      .map((remessa, index) => ({ remessa, index }))
      .filter(({ remessa }) => remessa.numeroOperacional && remessa.numeroOperacional.trim() !== '');

    if (remessasComNumero.length === 0) {
      alert('Nenhuma remessa com número operacional encontrada para atualizar.');
      return;
    }

    const confirmacao = confirm(
      `Deseja atualizar o status de ${remessasComNumero.length} remessa${remessasComNumero.length > 1 ? 's' : ''}?\n\n` +
      `Esta operação pode levar alguns minutos devido aos limites da API da Jadlog.`
    );

    if (!confirmacao) return;

    setIsUpdatingAll(true);
    setUpdateProgress({ current: 0, total: remessasComNumero.length });

    try {
      // Extrair apenas os números operacionais
      const numeroOperacionais = remessasComNumero.map(({ remessa }) => remessa.numeroOperacional);

      const jadlogAPI = new JadlogAPI(process.env.JADLOG_API_KEY || '');

      const data = await jadlogAPI.consultarTrackingSimples(numeroOperacionais);
      if (!data) {
        throw new Error('Resposta inválida da API');
      }

      console.log(data);

      if (data.consulta && data.consulta[0] && data.consulta[0].tracking) {
        const trackingData = data.consulta[0].tracking;
        const tracking: TrackingInfo = {
          status: trackingData.status || 'Não disponível',
          ultimaAtualizacao: trackingData.dtEmissao || new Date().toLocaleDateString('pt-BR'),
          previsaoEntrega: data.consulta[0].previsaoEntrega,
          eventos: trackingData.eventos || []
        };

        console.log(tracking);
        return;
      } else {
        throw new Error('Resposta inválida da API');
      }
    } catch (error) {
      console.error('Erro ao atualizar todos:', error);
      alert('Erro ao atualizar remessas. Tente novamente mais tarde.');
    } finally {
      setIsUpdatingAll(false);
      setUpdateProgress({ current: 0, total: 0 });
    }
  };

  const consultarTracking = async (remessa: RemessaInfo, index: number) => {
    if (!remessa.numeroOperacional) {
      alert('Número operacional não encontrado para esta remessa');
      return;
    }

    // Marcar como carregando
    onUpdateRemessa(index, { ...remessa, isLoadingTracking: true });

    try {
      const response = await fetch('/api/tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          numeroOperacional: remessa.numeroOperacional
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao consultar tracking');
      }

      const data = await response.json();
      
      if (data.consulta && data.consulta[0] && data.consulta[0].tracking) {
        const trackingData = data.consulta[0].tracking;
        const tracking: TrackingInfo = {
          status: trackingData.status || 'Não disponível',
          ultimaAtualizacao: trackingData.dtEmissao || new Date().toLocaleDateString('pt-BR'),
          previsaoEntrega: data.consulta[0].previsaoEntrega,
          eventos: trackingData.eventos || []
        };

        onUpdateRemessa(index, { 
          ...remessa, 
          tracking, 
          isLoadingTracking: false 
        });
      } else {
        // Sem dados de tracking
        onUpdateRemessa(index, { 
          ...remessa, 
          tracking: {
            status: 'Não encontrado',
            ultimaAtualizacao: 'N/A',
            eventos: []
          },
          isLoadingTracking: false 
        });
      }
    } catch (error) {
      console.error('Erro ao consultar tracking:', error);
      onUpdateRemessa(index, { 
        ...remessa, 
        tracking: {
          status: 'Erro na consulta',
          ultimaAtualizacao: 'N/A',
          eventos: []
        },
        isLoadingTracking: false 
      });
    }
  };

  const getStatusBadge = (remessa: RemessaInfo) => {
    if (remessa.isLoadingTracking) {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-1"></div>
          Consultando...
        </span>
      );
    }

    if (!remessa.tracking) {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          Clique para consultar
        </span>
      );
    }

    const status = remessa.tracking.status.toLowerCase();
    
    if (status.includes('entregue') || status.includes('entrega')) {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          {remessa.tracking.status}
        </span>
      );
    } else if (status.includes('transito') || status.includes('trânsito')) {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          {remessa.tracking.status}
        </span>
      );
    } else if (status.includes('problema') || status.includes('erro')) {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
          {remessa.tracking.status}
        </span>
      );
    } else {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
          {remessa.tracking.status}
        </span>
      );
    }
  };

  // Aplicar filtro baseado no status
  const aplicarFiltroStatus = (remessa: RemessaInfo) => {
    if (!filtroAtivo) return true;

    switch (filtroAtivo) {
      case 'emTransito':
        return remessa.tracking && (
          remessa.tracking.status.toLowerCase().includes('transito') || 
          remessa.tracking.status.toLowerCase().includes('trânsito')
        );
      case 'entregue':
        return remessa.tracking && (
          remessa.tracking.status.toLowerCase().includes('entregue') || 
          remessa.tracking.status.toLowerCase().includes('entrega')
        );
      case 'comProblemas':
        return remessa.tracking && (
          remessa.tracking.status.toLowerCase().includes('problema') || 
          remessa.tracking.status.toLowerCase().includes('erro')
        );
      default:
        return true;
    }
  };

  // Filtrar remessas baseado na pesquisa e filtro de status
  const filteredRemessas = remessas.filter(remessa => {
    // Aplicar filtro de status primeiro
    if (!aplicarFiltroStatus(remessa)) return false;

    // Depois aplicar filtro de pesquisa
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase().trim();
    const searchNumbers = searchTerm.replace(/\D/g, ''); // Remove tudo que não é número
    
    // Buscar apenas por nome do destinatário e CPF do destinatário
    const nomeMatch = remessa.nomeDestinatario.toLowerCase().includes(searchLower);
    
    // Para CPF, verificar se há números na busca e se correspondem
    const cpfMatch = searchNumbers.length > 0 && (
      remessa.cpfDestinatario.includes(searchNumbers) ||
      formatCPF(remessa.cpfDestinatario).includes(searchTerm)
    );
    
    return nomeMatch || cpfMatch;
  });

  // Calcular remessas próximas ao vencimento
  const agora = new Date();
  const proximasAExpirar = remessas.filter(remessa => {
    if (remessa.tracking?.status.toLowerCase().includes('entregue')) {
      const dataEntrega = new Date(remessa.tracking.ultimaAtualizacao);
      const diasDesdeEntrega = Math.floor((agora.getTime() - dataEntrega.getTime()) / (1000 * 60 * 60 * 24));
      return diasDesdeEntrega >= 5 && diasDesdeEntrega <= 7;
    }
    return false;
  }).length;

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header com título e pesquisa */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Detalhes das Encomendas
          </h2>
          
          {/* Aviso de remessas próximas ao vencimento */}
          {proximasAExpirar > 0 && (
            <div className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
              ⚠️ {proximasAExpirar} remessa{proximasAExpirar > 1 ? 's' : ''} será{proximasAExpirar > 1 ? 'ão' : ''} removida{proximasAExpirar > 1 ? 's' : ''} em breve
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Pesquisar por nome ou CPF do destinatário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={atualizarTodos}
              disabled={isUpdatingAll || remessas.length === 0}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdatingAll ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Atualizando... ({updateProgress.current}/{updateProgress.total})
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Atualizar Todos
                </>
              )}
            </button>
            
            <button
              onClick={onClear}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Limpar Tudo
            </button>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome do Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CPF
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CNPJ Remetente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nº Operacional
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Última Atualização
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRemessas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    {filtroAtivo ? 
                      `Nenhuma remessa encontrada com o filtro "${filtroAtivo}" aplicado.` :
                      searchTerm ? 
                        'Nenhuma remessa encontrada com os critérios de pesquisa.' : 
                        'Nenhuma remessa encontrada.'
                    }
                  </td>
                </tr>
              ) : (
                filteredRemessas.map((remessa, index) => (
                  <tr key={remessa.id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {remessa.nomeDestinatario}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono">
                        {formatCPF(remessa.cpfDestinatario)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono">
                        {formatCNPJ(remessa.cnpjRemetente)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono">
                        {remessa.numeroOperacional || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(remessa)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {remessa.tracking?.ultimaAtualizacao || formatDate(remessa.dataEmissao || '')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button 
                        onClick={() => consultarTracking(remessa, index)}
                        disabled={remessa.isLoadingTracking}
                        className="text-blue-600 hover:text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {remessa.isLoadingTracking ? 'Consultando...' : 'Consultar'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer com estatísticas */}
      <div className="mt-6 flex justify-between items-center text-sm text-gray-500">
        <p>
          Mostrando {filteredRemessas.length} de {remessas.length} remessa{remessas.length !== 1 ? 's' : ''}
          {filtroAtivo && (
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
              Filtro: {filtroAtivo === 'emTransito' ? 'Em Trânsito' : 
                      filtroAtivo === 'entregue' ? 'Entregue' : 
                      filtroAtivo === 'comProblemas' ? 'Com Problemas' : filtroAtivo}
            </span>
          )}
        </p>
        <p>
          💾 Dados salvos localmente - Remessas entregues são removidas após 7 dias
        </p>
      </div>
    </div>
  );
}
