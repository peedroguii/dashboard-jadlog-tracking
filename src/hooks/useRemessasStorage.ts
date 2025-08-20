'use client';

import { useState, useEffect } from 'react';
import { RemessaInfo } from '@/types/jadlog';

const STORAGE_KEY = 'jadlog_remessas';
const DIAS_PARA_OCULTAR_ENTREGUES = 7;

export function useRemessasStorage() {
  const [remessas, setRemessas] = useState<RemessaInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar remessas do localStorage na inicialização
  useEffect(() => {
    const carregarRemessas = () => {
      try {
        const dadosSalvos = localStorage.getItem(STORAGE_KEY);
        if (dadosSalvos) {
          const remessasSalvas: RemessaInfo[] = JSON.parse(dadosSalvos);
          
          // Filtrar remessas entregues há mais de 7 dias
          const agora = new Date();
          const remessasFiltradas = remessasSalvas.filter(remessa => {
            if (remessa.tracking?.status.toLowerCase().includes('entregue')) {
              const dataEntrega = new Date(remessa.tracking.ultimaAtualizacao);
              const diasDesdeEntrega = Math.floor((agora.getTime() - dataEntrega.getTime()) / (1000 * 60 * 60 * 24));
              return diasDesdeEntrega <= DIAS_PARA_OCULTAR_ENTREGUES;
            }
            return true; // Manter todas as outras remessas
          });

          // Se houve remoção de remessas antigas, salvar a lista atualizada
          if (remessasFiltradas.length !== remessasSalvas.length) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(remessasFiltradas));
          }

          setRemessas(remessasFiltradas);
        }
      } catch (error) {
        console.error('Erro ao carregar remessas do localStorage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    carregarRemessas();
  }, []);

  // Salvar remessas no localStorage sempre que a lista mudar
  const salvarRemessas = (novasRemessas: RemessaInfo[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(novasRemessas));
      setRemessas(novasRemessas);
    } catch (error) {
      console.error('Erro ao salvar remessas no localStorage:', error);
    }
  };

  // Adicionar novas remessas (evitando duplicatas)
  const adicionarRemessas = (novasRemessas: RemessaInfo[]) => {
    const remessasExistentes = [...remessas];
    
    novasRemessas.forEach(novaRemessa => {
      // Verificar se já existe uma remessa com o mesmo número operacional
      const jaExiste = remessasExistentes.some(
        remessa => remessa.numeroOperacional === novaRemessa.numeroOperacional
      );
      
      if (!jaExiste) {
        remessasExistentes.push(novaRemessa);
      }
    });

    salvarRemessas(remessasExistentes);
  };

  // Atualizar uma remessa específica
  const atualizarRemessa = (index: number, remessaAtualizada: RemessaInfo) => {
    const novasRemessas = [...remessas];
    novasRemessas[index] = remessaAtualizada;
    salvarRemessas(novasRemessas);
  };

  // Limpar todas as remessas
  const limparRemessas = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setRemessas([]);
    } catch (error) {
      console.error('Erro ao limpar remessas:', error);
    }
  };

  // Remover remessas entregues há mais de 7 dias manualmente
  const limparRemessasAntigas = () => {
    const agora = new Date();
    const remessasFiltradas = remessas.filter(remessa => {
      if (remessa.tracking?.status.toLowerCase().includes('entregue')) {
        const dataEntrega = new Date(remessa.tracking.ultimaAtualizacao);
        const diasDesdeEntrega = Math.floor((agora.getTime() - dataEntrega.getTime()) / (1000 * 60 * 60 * 24));
        return diasDesdeEntrega <= DIAS_PARA_OCULTAR_ENTREGUES;
      }
      return true;
    });

    salvarRemessas(remessasFiltradas);
    return remessas.length - remessasFiltradas.length; // Retorna quantas foram removidas
  };

  // Obter estatísticas das remessas
  const obterEstatisticas = () => {
    const agora = new Date();
    let proximasAExpirar = 0;

    const stats = remessas.reduce((acc, remessa) => {
      if (remessa.tracking?.status.toLowerCase().includes('entregue')) {
        const dataEntrega = new Date(remessa.tracking.ultimaAtualizacao);
        const diasDesdeEntrega = Math.floor((agora.getTime() - dataEntrega.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diasDesdeEntrega >= 5) { // Próximas a expirar (5-7 dias)
          proximasAExpirar++;
        }
        
        acc.entregue++;
      } else if (remessa.tracking?.status.toLowerCase().includes('problema') || 
                 remessa.tracking?.status.toLowerCase().includes('erro')) {
        acc.comProblemas++;
      } else {
        acc.emTransito++;
      }
      return acc;
    }, { emTransito: 0, entregue: 0, comProblemas: 0 });

    return { ...stats, proximasAExpirar };
  };

  return {
    remessas,
    isLoading,
    adicionarRemessas,
    atualizarRemessa,
    limparRemessas,
    limparRemessasAntigas,
    obterEstatisticas
  };
}
