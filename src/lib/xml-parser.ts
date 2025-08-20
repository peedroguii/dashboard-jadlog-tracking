import { RemessaInfo } from '@/types/jadlog';

export function parseJadlogXML(xmlContent: string): RemessaInfo | null {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
    
    // Verificar se há erros de parsing
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      console.error('Erro ao fazer parse do XML:', parserError.textContent);
      return null;
    }

    // Extrair ID do CTe
    const infCte = xmlDoc.querySelector('infCte');
    const cteId = infCte?.getAttribute('Id') || '';
    
    // Extrair nome do destinatário
    const nomeDestinatario = xmlDoc.querySelector('dest xNome')?.textContent || '';
    
    // Extrair CPF do destinatário
    const cpfDestinatario = xmlDoc.querySelector('dest CPF')?.textContent || '';
    
    // Extrair CNPJ do remetente
    const cnpjRemetente = xmlDoc.querySelector('rem CNPJ')?.textContent || '';
    
    // Extrair número operacional das observações (apenas a primeira sequência)
    const observacoes = xmlDoc.querySelector('xObs')?.textContent || '';
    const numeroOperacionalMatch = observacoes.match(/NUMERO OPERACIONAL:\s*(\d+)/);
    const numeroOperacional = numeroOperacionalMatch ? numeroOperacionalMatch[1] : '';
    
    // Extrair data de emissão (opcional)
    const dataEmissao = xmlDoc.querySelector('dhEmi')?.textContent || '';
    
    // Extrair valor do frete (opcional)
    const valorFreteText = xmlDoc.querySelector('vTPrest')?.textContent || '0';
    const valorFrete = parseFloat(valorFreteText);

    // Validar se os campos obrigatórios estão presentes
    if (!nomeDestinatario || !cpfDestinatario || !cnpjRemetente) {
      console.error('Campos obrigatórios não encontrados no XML');
      return null;
    }

    return {
      id: cteId,
      nomeDestinatario,
      cpfDestinatario,
      cnpjRemetente,
      numeroOperacional,
      dataEmissao,
      valorFrete
    };
  } catch (error) {
    console.error('Erro ao processar XML:', error);
    return null;
  }
}

export function parseMultipleXMLFiles(files: FileList): Promise<RemessaInfo[]> {
  const promises = Array.from(files).map(file => {
    return new Promise<RemessaInfo | null>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const parsed = parseJadlogXML(content);
        resolve(parsed);
      };
      reader.onerror = () => resolve(null);
      reader.readAsText(file);
    });
  });

  return Promise.all(promises).then(results => 
    results.filter((item): item is RemessaInfo => item !== null)
  );
}
