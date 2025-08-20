'use client';

import { RemessaInfo } from '@/types/jadlog';

interface DashboardProps {
  remessas: RemessaInfo[];
  filtroAtivo: string | null;
  onFiltroChange: (filtro: string | null) => void;
}

export default function Dashboard({ remessas, filtroAtivo, onFiltroChange }: DashboardProps) {
  // Calcular estatísticas baseadas no status de tracking
  const agora = new Date();
  let proximasAExpirar = 0;

  const stats = remessas.reduce((acc, remessa) => {
    if (remessa.tracking?.status.toLowerCase().includes('entregue')) {
      // Verificar se está próxima de expirar (5-7 dias após entrega)
      const dataEntrega = new Date(remessa.tracking.ultimaAtualizacao);
      const diasDesdeEntrega = Math.floor((agora.getTime() - dataEntrega.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diasDesdeEntrega >= 5 && diasDesdeEntrega <= 7) {
        proximasAExpirar++;
      }
      
      acc.entregue++;
    } else if (remessa.tracking?.status.toLowerCase().includes('problema') || 
               remessa.tracking?.status.toLowerCase().includes('erro')) {
      acc.comProblemas++;
    } else if (remessa.tracking) {
      acc.emTransito++;
    } else {
      // Remessas sem tracking ainda
      acc.pendentes = (acc.pendentes || 0) + 1;
    }
    return acc;
  }, { emTransito: 0, entregue: 0, comProblemas: 0, pendentes: 0 });

  const handleCardClick = (filtro: string) => {
    if (filtroAtivo === filtro) {
      onFiltroChange(null); // Remove o filtro se já estiver ativo
    } else {
      onFiltroChange(filtro); // Aplica o novo filtro
    }
  };

  const cards = [
    {
      id: 'emTransito',
      title: 'Em Trânsito',
      value: stats.emTransito,
      subtitle: 'Remessas em movimento',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      hoverColor: 'hover:bg-blue-100',
      activeColor: 'ring-blue-500'
    },
    {
      id: 'entregue',
      title: 'Entregue',
      value: stats.entregue,
      subtitle: proximasAExpirar > 0 ? `${proximasAExpirar} expira(m) em breve` : 'Entregas concluídas',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      hoverColor: 'hover:bg-green-100',
      activeColor: 'ring-green-500'
    },
    {
      id: 'comProblemas',
      title: 'Com Problemas',
      value: stats.comProblemas,
      subtitle: 'Requer atenção',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      hoverColor: 'hover:bg-red-100',
      activeColor: 'ring-red-500'
    }
  ];

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => {
          const isActive = filtroAtivo === card.id;
          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={`
                ${card.bgColor} rounded-lg p-6 cursor-pointer transition-all duration-200 
                ${card.hoverColor} transform hover:scale-105 hover:shadow-md
                ${isActive ? `ring-2 ${card.activeColor} shadow-lg scale-105` : ''}
              `}
            >
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-lg ${card.color}`}>
                  <div className="text-white">
                    {card.icon}
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    {isActive && (
                      <div className="text-xs bg-white px-2 py-1 rounded-full text-gray-600 font-medium">
                        Filtro ativo
                      </div>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
                </div>
              </div>
              
              {/* Indicador visual de que é clicável */}
              <div className="mt-3 text-xs text-gray-400 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Clique para filtrar
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Indicador de filtro ativo */}
      {filtroAtivo && (
        <div className="mt-4 flex items-center justify-center">
          <div className="bg-white px-4 py-2 rounded-full shadow-sm border flex items-center space-x-2">
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
            </svg>
            <span className="text-sm text-gray-600">
              Filtro ativo: <strong>{cards.find(c => c.id === filtroAtivo)?.title}</strong>
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFiltroChange(null);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
