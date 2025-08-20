'use client';

import { useState } from 'react';
import { RemessaInfo } from '@/types/jadlog';
import UploadXML from '@/components/UploadXML';
import RemessasList from '@/components/RemessasList';
import Dashboard from '@/components/Dashboard';
import { useRemessasStorage } from '@/hooks/useRemessasStorage';

export default function Home() {
  const {
    remessas,
    isLoading,
    adicionarRemessas,
    atualizarRemessa,
    limparRemessas,
    limparRemessasAntigas,
    obterEstatisticas
  } = useRemessasStorage();

  const [filtroAtivo, setFiltroAtivo] = useState<string | null>(null);

  const handleUpload = (novasRemessas: RemessaInfo[]) => {
    adicionarRemessas(novasRemessas);
  };

  const handleClear = () => {
    const confirmacao = window.confirm(
      '⚠️ ATENÇÃO: Esta ação irá remover TODAS as remessas permanentemente!\n\n' +
      'Você tem certeza que deseja continuar?\n\n' +
      'Esta ação não pode ser desfeita.'
    );
    
    if (confirmacao) {
      const segundaConfirmacao = window.confirm(
        '🚨 CONFIRMAÇÃO FINAL\n\n' +
        'Você está prestes a apagar TODAS as remessas do sistema.\n\n' +
        'Clique em OK para confirmar a exclusão definitiva.'
      );
      
      if (segundaConfirmacao) {
        limparRemessas();
        setFiltroAtivo(null); // Limpar filtro também
      }
    }
  };

  const handleUpdateRemessa = (index: number, remessaAtualizada: RemessaInfo) => {
    atualizarRemessa(index, remessaAtualizada);
  };

  const handleLimparAntigas = () => {
    const removidas = limparRemessasAntigas();
    if (removidas > 0) {
      alert(`${removidas} remessa${removidas > 1 ? 's' : ''} entregue${removidas > 1 ? 's' : ''} há mais de 7 dias foi${removidas > 1 ? 'ram' : ''} removida${removidas > 1 ? 's' : ''} do dashboard.`);
    } else {
      alert('Nenhuma remessa antiga foi encontrada para remoção.');
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando remessas salvas...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Dashboard de Rastreamento Jadlog
            </h1>
          </div>
          
          {/* Botões de ação */}
          {remessas.length > 0 && (
            <div className="flex space-x-2">
              <button
                onClick={handleLimparAntigas}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Limpar Antigas
              </button>
              <span className="text-sm text-gray-500 self-center">
                Total: {remessas.length} remessas
              </span>
            </div>
          )}
        </div>

        {/* Upload Section - Mostrar apenas se não houver remessas */}
        {remessas.length === 0 && (
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Importe seus arquivos XML
              </h2>
              <p className="text-gray-600">
                Carregue os arquivos XML da Jadlog para visualizar as informações das remessas
              </p>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>💾 Banco de Dados Local:</strong> Suas remessas ficam salvas no navegador. 
                  Remessas entregues são automaticamente removidas após 7 dias.
                </p>
              </div>
            </div>
            <UploadXML onUpload={handleUpload} />
          </div>
        )}

        {/* Dashboard e Lista - Mostrar apenas se houver remessas */}
        {remessas.length > 0 && (
          <>
            {/* Dashboard Cards */}
            <Dashboard 
              remessas={remessas} 
              filtroAtivo={filtroAtivo}
              onFiltroChange={setFiltroAtivo}
            />

            {/* Upload compacto quando há remessas */}
            <div className="mb-6">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Adicionar mais remessas</h3>
                    <p className="text-xs text-gray-500">Carregue arquivos XML adicionais - duplicatas são ignoradas automaticamente</p>
                  </div>
                  <div className="flex-shrink-0">
                    <UploadXML onUpload={handleUpload} compact />
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de Remessas */}
            <RemessasList 
              remessas={remessas} 
              onClear={handleClear} 
              onUpdateRemessa={handleUpdateRemessa}
              filtroAtivo={filtroAtivo}
            />
          </>
        )}

        {/* Instructions - Mostrar apenas se não houver remessas */}
        {remessas.length === 0 && (
          <div className="max-w-3xl mx-auto mt-16">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Como usar esta ferramenta
              </h3>
              <div className="space-y-4 text-gray-600">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <p>
                    <strong>Selecione os arquivos XML:</strong> Clique no botão de upload acima e selecione um ou mais arquivos XML fornecidos pela Jadlog. Os dados ficam salvos permanentemente.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <p>
                    <strong>Consulte o tracking:</strong> Clique em "Consultar" para obter o status atualizado via API da Jadlog. O status fica salvo e atualiza as estatísticas.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <p>
                    <strong>Limpeza automática:</strong> Remessas entregues são automaticamente removidas após 7 dias. Use "Limpar Antigas" para forçar a limpeza.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
