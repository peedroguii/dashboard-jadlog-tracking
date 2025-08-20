'use client';

import { useState } from 'react';
import { RemessaInfo } from '@/types/jadlog';
import { parseMultipleXMLFiles } from '@/lib/xml-parser';

interface UploadXMLProps {
  onUpload: (remessas: RemessaInfo[]) => void;
  compact?: boolean;
}

export default function UploadXML({ onUpload, compact = false }: UploadXMLProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const remessas = await parseMultipleXMLFiles(files);
      
      if (remessas.length === 0) {
        setError('Nenhum arquivo XML válido foi encontrado ou processado.');
        return;
      }

      onUpload(remessas);
      
      // Reset do input
      event.target.value = '';
    } catch (err) {
      setError('Erro ao processar os arquivos XML. Verifique se os arquivos são válidos.');
      console.error('Erro no upload:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (compact) {
    return (
      <div className="relative">
        <label htmlFor="xml-upload-compact" className="cursor-pointer">
          <div className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            {isLoading ? 'Processando...' : 'Carregar XML'}
          </div>
        </label>
        <input
          id="xml-upload-compact"
          type="file"
          multiple
          accept=".xml,text/xml,application/xml"
          onChange={handleFileUpload}
          disabled={isLoading}
          className="hidden"
        />
        {error && (
          <div className="absolute top-full left-0 right-0 mt-2 text-red-600 text-xs bg-red-50 p-2 rounded-md">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-gray-400 transition-colors">
        <div className="space-y-4">
          <div className="text-gray-600">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          
          <div>
            <label htmlFor="xml-upload" className="cursor-pointer">
              <span className="text-lg font-medium text-gray-900">
                Carregar arquivos XML
              </span>
              <p className="text-sm text-gray-500 mt-1">
                Selecione um ou mais arquivos XML da Jadlog
              </p>
            </label>
            <input
              id="xml-upload"
              type="file"
              multiple
              accept=".xml,text/xml,application/xml"
              onChange={handleFileUpload}
              disabled={isLoading}
              className="hidden"
            />
          </div>

          {isLoading && (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
              <span className="text-sm text-gray-600">Processando arquivos...</span>
            </div>
          )}

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>Formatos aceitos: XML</p>
        <p>Múltiplos arquivos podem ser selecionados</p>
      </div>
    </div>
  );
}
