# ServiçoIA — Ordens de serviço

**MVP web funcional** para técnicos de informática, mecânicos e instaladores. O sistema transforma uma descrição informal do atendimento em campos sugeridos, permite a conferência humana, gera uma ordem de serviço e acompanha seus status.

## Como executar

### Opção 1 — sem instalar nada

Abra **`ServicoIA_Demo_Offline.html`** (um único arquivo) ou `index.html` dentro da pasta extraída, no Chrome, Edge ou Firefox. Cadastro, regras locais, ordens, exportação e impressão ficam disponíveis. Dados são salvos no `localStorage` do navegador atual.

### Opção 2 — servidor local (Node.js 20+)

No terminal na pasta do projeto:

```bash
node server.mjs
```

Acesse **http://localhost:3000**.

### Opção 3 — ativar a IA Gemini (opcional)

A chave de API deve ficar em uma **variável de ambiente no servidor**, nunca no código HTML/JavaScript do navegador.

No PowerShell do Windows:

```powershell
$env:GEMINI_API_KEY="SUA_CHAVE_AQUI"
$env:GEMINI_MODEL="gemini-3.8-flash"
node server.mjs
```

No Linux/macOS:

```bash
GEMINI_API_KEY="SUA_CHAVE_AQUI" node server.mjs
```

Se houver chave e conexão, o backend chama o modelo de IA para recomendar título, categoria, equipamento, prioridade, resumo e procedimento. Quando não há chave ou a IA falha, o projeto usa **regras locais e identifica isso claramente**. Mesmo conectado, preços e diagnósticos não são inventados e o técnico deve revisar tudo. O texto recebido tem e-mails e telefones substituídos antes da chamada externa, embora outros dados pessoais possam permanecer no conteúdo; não envie informações sensíveis desnecessárias.

> O arquivo `.env.example` é apenas referência. O servidor não lê `.env` automaticamente; configure variáveis de ambiente pelos comandos acima.

## Funcionalidades entregues

- Painel com indicadores e OS recentes.
- Cadastro e edição de clientes; exclusão permitida apenas quando não há OS associadas.
- Cadastro de ordens com cliente, categoria, item, prioridade, orçamento estimado, previsão e observações.
- Organização inteligente por regras locais ou Gemini opcional.
- Busca e filtro por status, edição de andamento, orçamento, prazo e observações.
- Histórico de atualizações de cada ordem.
- Impressão da OS, exportação CSV das ordens e backup/importação JSON.
- Layout responsivo para computadores e celulares, com dados fictícios para demonstração.

## Limites do MVP — NÃO indicado para uso comercial real sem evoluções

- Sem login, autorização por usuário, banco de dados central, sincronização, backup automático ou trilha de auditoria robusta.
- `localStorage` não é um banco seguro. Dados podem se perder ao limpar o navegador e podem ser acessíveis a outras pessoas com acesso ao perfil.
- Protótipo NÃO implementa LGPD completa, assinatura eletrônica, emissão de nota fiscal nem envio pelo WhatsApp.
- A chamada ao Gemini pode gerar custo. A disponibilidade e o preço dependem do modelo e da conta de API utilizada.
- Não publique este backend publicamente sem autenticação, proteção contra abuso e políticas de armazenamento/privacidade.
- Como o MVP armazena no navegador, arquivos exportados devem ser protegidos por quem os recebe.

## Estrutura

```
ServicoIA/
├── index.html        Interface
├── styles.css        Estilos responsivos
├── core.js           Organização local e validação da saída de IA
├── app.js            Interface e persistência no navegador
├── server.mjs        Servidor HTTP opcional + integração Gemini
├── .env.example      Exemplo de configuração
├── docs/
│   ├── 01-projeto.md
│   ├── 02-plano-testes.md
│   └── 03-roteiro-apresentacao.md
└── tests/
    ├── core.test.cjs
    └── server.test.mjs
```

## Testes automatizados

```bash
node --test tests/*.test.*
```

Os testes cobrem classificação local, anonimização básica, fallback, validação e API. Além disso, realize o checklist manual da pasta `docs` em dispositivos diferentes.

## Próximas etapas técnicas

Para produção: backend Node.js com autenticação e controle de acesso; PostgreSQL para clientes, ordens e histórico; sincronização, backup e restauração; segregação por empresa; logs e auditoria; política de privacidade e retenção de dados; integrações WhatsApp sob autorização, agenda, anexos e geração de PDFs; avaliação do modelo com descrições reais anonimizadas.
