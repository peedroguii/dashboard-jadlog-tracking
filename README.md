# Dashboard de Rastreamento Jadlog

Aplicação para rastreamento de encomendas da Jadlog com persistência local e atualização em lote.

## 📋 Pré-requisitos

Antes de instalar a aplicação, certifique-se de ter os seguintes softwares instalados:

### Node.js (versão 18 ou superior)
- **Windows/Mac**: Baixe em [nodejs.org](https://nodejs.org/)
- **Linux (Ubuntu/Debian)**: 
  ```bash
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt-get install -y nodejs
  ```
- **Verificar instalação**: 
  ```bash
  node --version
  npm --version
  ```

### Git
- **Windows**: Baixe em [git-scm.com](https://git-scm.com/)
- **Mac**: `brew install git` ou baixe do site oficial
- **Linux**: `sudo apt-get install git`
- **Verificar instalação**: 
  ```bash
  git --version
  ```

## 🚀 Como Instalar e Usar

### Passo 1: Verificar Pré-requisitos
```bash
# Verificar se Node.js está instalado (deve mostrar versão 18+)
node --version

# Verificar se npm está instalado
npm --version

# Verificar se Git está instalado
git --version
```

### Passo 2: Clonar o Repositório
```bash
# Clonar o projeto do GitHub
git clone https://github.com/seu-usuario/dashboard-jadlog.git

# Navegar para o diretório do projeto
cd dashboard-jadlog
```

### Passo 3: Instalar Dependências
```bash
# Instalar todas as dependências necessárias
npm install

# Aguarde a instalação completar (pode demorar alguns minutos)
```

### Passo 4: Configurar Ambiente (Opcional)
```bash
# Para usar a API real da Jadlog, crie o arquivo de configuração:
echo "JADLOG_API_TOKEN=seu_token_aqui" > .env.local

# Substitua "seu_token_aqui" pelo seu token real da Jadlog
# Sem este arquivo, a aplicação funcionará com dados simulados
```

### Passo 5: Iniciar a Aplicação
```bash
# Iniciar o servidor de desenvolvimento
npm run dev

# A aplicação será iniciada na porta 8000
```

### Passo 6: Acessar no Navegador
```
http://localhost:8000
```

## 🛠️ Comandos Úteis

### Desenvolvimento
```bash
npm run dev          # Iniciar servidor de desenvolvimento
npm run build        # Criar build de produção
npm run start        # Iniciar servidor de produção
npm run lint         # Verificar código com ESLint
```

### Limpeza
```bash
# Limpar cache do npm
npm cache clean --force

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

## 🆘 Solução de Problemas

### ❌ Erro: "node: command not found"
**Problema**: Node.js não está instalado ou não está no PATH
**Solução**: 
1. Instale o Node.js seguindo as instruções dos pré-requisitos
2. Reinicie o terminal
3. Verifique com `node --version`

### ❌ Erro: "npm ERR! peer dep missing"
**Problema**: Dependências incompatíveis
**Solução**:
```bash
# Limpar cache e reinstalar
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### ❌ Erro: "Port 8000 is already in use"
**Problema**: Porta 8000 já está sendo usada
**Solução**:
```bash
# Opção 1: Usar porta diferente
PORT=3000 npm run dev

# Opção 2: Matar processo na porta 8000 (Linux/Mac)
lsof -ti:8000 | xargs kill -9

# Opção 3: Matar processo na porta 8000 (Windows)
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F
```

### ❌ Erro: "git: command not found"
**Problema**: Git não está instalado
**Solução**: 
1. Instale o Git seguindo as instruções dos pré-requisitos
2. Reinicie o terminal
3. Verifique com `git --version`

### ❌ API não funciona / Dados não carregam
**Problema**: Token da API não configurado ou inválido
**Solução**:
1. Verifique se o arquivo `.env.local` existe
2. Confirme se o token está correto
3. A aplicação funciona sem token (modo demonstração)

### ❌ Erro: "Module not found"
**Problema**: Dependências não instaladas corretamente
**Solução**:
```bash
# Reinstalar dependências
npm install

# Se persistir, limpar tudo e reinstalar
rm -rf node_modules package-lock.json
npm install
```

## 📱 Testando a Instalação

Após seguir todos os passos, você deve conseguir:

1. ✅ Acessar `http://localhost:8000` no navegador
2. ✅ Ver a interface do dashboard
3. ✅ Fazer upload de arquivos XML
4. ✅ Visualizar dados de rastreamento (simulados ou reais)

Se algum destes itens não funcionar, consulte a seção "Solução de Problemas" acima.

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

---

**Desenvolvido com ❤️ para otimizar o rastreamento de encomendas Jadlog**
