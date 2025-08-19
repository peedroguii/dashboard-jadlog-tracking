# Dashboard de Rastreamento Jadlog

Aplicação para rastreamento de encomendas da Jadlog com persistência local e atualização em lote.

## 🚀 Como usar

```bash
# 1. Clonar repositório
git clone https://github.com/seu-usuario/dashboard-jadlog.git
cd dashboard-jadlog

# 2. Instalar dependências
npm install

# 3. Rodar aplicação
npm run dev

# 4. Acessar no navegador
http://localhost:8000
```

## ✨ Funcionalidades

### 📊 **Dashboard Interativo**
- **Cards como Filtros**: Clique nos cards para filtrar por status
- **Indicadores Visuais**: Cards ativos ficam destacados
- **Estatísticas em Tempo Real**: Contadores automáticos

### 🔍 **Sistema de Busca Avançado**
- **Busca por Nome**: Digite o nome do destinatário
- **Busca por CPF**: Digite o CPF com ou sem formatação
- **Filtros Combinados**: Use status + busca textual simultaneamente

### 🔄 **Atualização em Lote - NOVA FUNCIONALIDADE!**
- **Botão "Atualizar Todos"**: Atualiza todas as remessas de uma vez
- **Respeita Limites da API**: Máximo 100 consultas por lote
- **Rate Limiting**: 2 segundos entre lotes para evitar bloqueios
- **Progresso em Tempo Real**: Mostra quantas remessas foram processadas
- **Relatório Detalhado**: Resumo com sucessos e falhas

### 💾 **Armazenamento Inteligente**
- **Banco Local**: Dados salvos no localStorage do navegador
- **Limpeza Automática**: Remessas entregues removidas após 7 dias
- **Persistência**: Dados mantidos entre sessões

### 🔒 **Segurança**
- **Confirmação Dupla**: Para exclusão de todas as remessas
- **Validação de Dados**: Verificação de números operacionais
- **Tratamento de Erros**: Mensagens claras para o usuário

## 📋 **Como Usar o Botão "Atualizar Todos"**

### **Passo a Passo:**

1. **Importe seus arquivos XML** da Jadlog
2. **Verifique as remessas** na tabela
3. **Clique em "Atualizar Todos"** (botão azul ao lado de "Limpar Tudo")
4. **Confirme a operação** no diálogo que aparece
5. **Aguarde o processamento** - pode levar alguns minutos
6. **Veja o relatório final** com o resumo da operação

### **Limites Respeitados:**
- ✅ **100 consultas por lote** (limite da API Jadlog)
- ✅ **2 segundos entre lotes** (evita rate limiting)
- ✅ **Máximo 500 consultas** usando API simples da Jadlog
- ✅ **Processamento inteligente** em background

### **Indicadores Visuais:**
- 🔄 **Spinner animado** durante o processamento
- 📊 **Contador de progresso** (atual/total)
- ✅ **Botão desabilitado** durante a operação
- 📋 **Relatório detalhado** ao final

## 🛠️ **Configuração da API (Opcional)**

Para usar a API real da Jadlog:

```bash
# Criar arquivo .env.local
echo "JADLOG_API_TOKEN=seu_token_aqui" > .env.local
```

**Sem token:** A aplicação funciona com dados simulados para demonstração.

## 📁 **Estrutura do Projeto**

```
dashboard-jadlog/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── tracking/
│   │   │   │   ├── route.ts          # API individual
│   │   │   │   └── batch/
│   │   │   │       └── route.ts      # API em lote (NOVA!)
│   │   │   └── ...
│   │   ├── page.tsx                  # Página principal
│   │   └── layout.tsx               # Layout da aplicação
│   ├── components/
│   │   ├── Dashboard.tsx            # Cards interativos
│   │   ├── RemessasList.tsx         # Tabela com botão "Atualizar Todos"
│   │   └── UploadXML.tsx           # Upload de arquivos
│   ├── lib/
│   │   ├── jadlog-api.ts           # Cliente da API
│   │   └── xml-parser.ts           # Parser de XML
│   └── types/
│       └── jadlog.ts               # Tipos TypeScript
├── exemplo-remessa.xml             # Arquivo de teste
└── README.md                       # Este arquivo
```

## 🔧 **APIs Implementadas**

### **API Individual** (`/api/tracking`)
- Consulta uma remessa por vez
- Usado pelos botões "Consultar" individuais

### **API em Lote** (`/api/tracking/batch`) - **NOVA!**
- Consulta múltiplas remessas simultaneamente
- Respeita limites da API Jadlog (100 por lote)
- Implementa rate limiting (2s entre lotes)
- Usado pelo botão "Atualizar Todos"

## 📊 **Exemplo de Uso da API em Lote**

```javascript
// Requisição
POST /api/tracking/batch
{
  "numeroOperacionais": ["10086793471466", "00067900094727", ...]
}

// Resposta
{
  "results": [
    {
      "numeroOperacional": "10086793471466",
      "success": true,
      "tracking": {
        "status": "ENTREGUE",
        "ultimaAtualizacao": "2025-01-15",
        "eventos": [...]
      }
    }
  ],
  "summary": {
    "total": 50,
    "processed": 50,
    "successful": 45,
    "failed": 5,
    "batches": 1
  }
}
```

## 🎯 **Benefícios da Atualização em Lote**

### **Para o Usuário:**
- ⚡ **Mais Rápido**: Atualiza todas as remessas de uma vez
- 🎯 **Mais Eficiente**: Menos cliques, mais produtividade
- 📊 **Visão Geral**: Relatório completo da operação
- 🔄 **Automático**: Não precisa clicar em cada remessa

### **Para a API:**
- 🛡️ **Respeitosa**: Segue todos os limites da Jadlog
- ⏱️ **Rate Limited**: Evita bloqueios por excesso de requisições
- 📦 **Otimizada**: Usa a API simples (500 consultas vs 100)
- 🔄 **Resiliente**: Continua mesmo se alguns lotes falharem

## 🆘 **Solução de Problemas**

### **Botão "Atualizar Todos" Desabilitado:**
- ✅ Verifique se há remessas importadas
- ✅ Confirme que as remessas têm números operacionais
- ✅ Aguarde se uma operação já está em andamento

### **Erro "Nenhuma remessa encontrada":**
- ✅ Importe arquivos XML válidos da Jadlog
- ✅ Verifique se os XMLs contêm números operacionais
- ✅ Confirme que os arquivos não estão corrompidos

### **Operação Muito Lenta:**
- ✅ Normal para muitas remessas (2s entre lotes)
- ✅ Não feche o navegador durante o processamento
- ✅ Aguarde o relatório final aparecer

## 📈 **Próximas Funcionalidades**

- [ ] **Agendamento**: Atualização automática em horários específicos
- [ ] **Notificações**: Alertas para mudanças de status importantes
- [ ] **Exportação**: Download de relatórios em PDF/Excel
- [ ] **Histórico**: Log de todas as atualizações realizadas
- [ ] **Filtros Avançados**: Por data, valor, região, etc.

## 🤝 **Contribuição**

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 **Licença**

Este projeto é para uso pessoal. Respeite os termos de uso da API da Jadlog.

# 1. Clonar repositório
git clone https://github.com/seu-usuario/dashboard-jadlog.git
cd dashboard-jadlog

# 2. Instalar dependências
npm install

# 3. Rodar aplicação
npm run dev

# 4. Acessar no navegador
http://localhost:3000
