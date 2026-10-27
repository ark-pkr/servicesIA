# ServiçoIA — Análise, definição e planejamento

**Nome do produto:** ServiçoIA — Ordens de Serviço Inteligentes  
**Versão:** 1.0 (MVP demonstrativo)  
**Público-alvo:** técnicos de informática, mecânicos, instaladores e profissionais autônomos.

## 1. Analisar o que é

O ServiçoIA é uma solução web para organizar atendimentos que hoje costumam ficar espalhados em mensagens, cadernos e conversas. O profissional recebe um pedido informal (por exemplo, “Meu notebook parou de ligar e preciso dele amanhã”), registra o cliente e transforma a descrição em uma ordem de serviço estruturada. A proposta não é substituir o diagnóstico técnico, mas reduzir o trabalho administrativo e facilitar o acompanhamento.

**Problema:** perda de dados, dificuldade de acompanhar serviços, orçamentos sem registro e retrabalho no preenchimento de fichas.  
**Oportunidade:** centralizar o atendimento em uma ferramenta simples, adaptável aos diferentes tipos de serviço.  
**Proposta de valor:** “Você cuida do serviço. O ServiçoIA cuida da organização.”

### Personas e necessidades

| Persona | Situação | Necessidade |
|---|---|---|
| Técnico de informática autônomo | Recebe pedidos por WhatsApp e atende vários equipamentos | Registrar defeitos, equipamentos, orçamento, status |
| Mecânico de pequena oficina | Precisa acompanhar o veículo, peças e prazos | Histórico do atendimento e andamento |
| Instalador de câmeras/ar-condicionado | Atende por agendamento e visita | Informações de local, material e previsão de entrega |

## 2. Definição e planejamento

### Objetivo geral

Desenvolver e avaliar um protótipo web que simplifique a criação e o acompanhamento de ordens de serviço a partir de descrições escritas pelos profissionais.

### Objetivos específicos

1. Identificar informações básicas necessárias numa ordem de serviço.
2. Criar uma interface simples e adaptável a celular e computador.
3. Estruturar automaticamente os campos com IA opcional e fallback por regras.
4. Permitir revisão humana antes da gravação.
5. Registrar status, histórico e exportações.
6. Testar funcionamento e limitações do protótipo.

### Escopo do MVP

| ID | Requisito funcional | Prioridade | Entrega |
|---|---|---|---|
| RF01 | Cadastrar e editar clientes | Alta | Implementado |
| RF02 | Receber descrição do trabalho | Alta | Implementado |
| RF03 | Propor categoria, prioridade e título | Alta | Implementado (IA opcional ou regras locais) |
| RF04 | Revisar campos e cadastrar OS | Alta | Implementado |
| RF05 | Acompanhar o status da OS | Alta | Implementado |
| RF06 | Consultar, buscar e filtrar ordens | Alta | Implementado |
| RF07 | Registrar orçamento e previsão de entrega | Média | Implementado |
| RF08 | Histórico de alterações | Média | Implementado (básico) |
| RF09 | Imprimir OS e exportar ordens | Média | Implementado |
| RF10 | Backup e importação JSON | Média | Implementado |
| RF11 | Login, banco central e equipes | Alta para produção | Fora do MVP |
| RF12 | WhatsApp, pagamentos e notificações | Futura | Fora do MVP |

### Requisitos não funcionais

- **RNF01 — Usabilidade:** layout responsivo, clareza dos campos e poucos passos.
- **RNF02 — Desempenho:** a interface funciona sem serviços externos no modo regras locais.
- **RNF03 — Segurança:** chave de IA somente no backend opcional; dados pessoais exigem evolução de segurança antes de produção.
- **RNF04 — Confiabilidade:** revisão obrigatória do técnico para sugestões de IA.
- **RNF05 — Interoperabilidade:** CSV e JSON para exportação.

### Fluxo principal

```
Receber pedido → Cadastrar/selecionar cliente → Descrever o serviço
              ↓
   Organizar com IA (ou regras locais) → Revisar os dados
              ↓
           Salvar OS → Atualizar andamento → Concluir
              ↓
     Imprimir ou exportar quando necessário
```

### Dados principais

- **Cliente:** ID, nome, telefone, e-mail, endereço.
- **OrdemServico:** ID, número, cliente, título, descrição, categoria, equipamento, prioridade, serviço sugerido, orçamento, previsão, observações, status, datas.
- **HistoricoStatus:** data da alteração, descrição da mudança e ordem associada.

### Cronograma sugerido para evolução

| Semana | Foco | Resultado esperado |
|---|---|---|
| 1 | Entrevistas com técnicos e requisitos | Necessidades validadas |
| 2 | Protótipos e fluxos UX | Telas e navegação aprovadas |
| 3 | Clientes e ordens em banco | Cadastro persistente |
| 4 | IA real e testes de avaliação | Estruturação revisada e mensurada |
| 5 | Segurança, backups e integração | Versão piloto restrita |
| 6 | Teste com usuários e melhorias | Relatório de resultados |

## 3. Desenvolvimento / criação da solução

**Entregue no protótipo:** interface HTML/CSS/JavaScript, armazenamento `localStorage`, regras locais, API opcional em Node e integração Gemini quando configurada. Há exemplos fictícios para demonstração.

**Arquitetura atual:** navegador ⇄ servidor HTTP opcional ⇄ Gemini (se habilitado). Os cadastros e ordens ficam apenas no navegador; a API não recebe nem grava listas completas de clientes/ordens.

**Arquitetura sugerida para produção:** frontend web (React ou similar), backend Node.js (API com autenticação), banco PostgreSQL, serviço de IA via servidor, logs auditáveis, backup automatizado e autorização multiempresa.

## 4. Testes da solução

Realizar testes funcionais, unitários, integração, responsividade, confiabilidade e testes com usuários (ver `02-plano-testes.md`). Um modelo gerativo não deve emitir diagnósticos definitivos ou dados inventados; testar também extração incorreta, descrições ambíguas e exposição de dados pessoais.

### Métricas sugeridas para validação futura

- Tempo médio para cadastrar OS manualmente **versus** usando ServiçoIA.
- Percentual de campos sugeridos corretamente (título, categoria, equipamento e prioridade).
- Taxa de correção manual após sugestões.
- Taxa de tarefas concluídas por técnicos no protótipo.
- Satisfação percebida (escala 1–5) e problemas encontrados.

**Observação:** nenhuma dessas métricas foi medida com usuários reais nesta versão. Não apresentar metas como resultados já alcançados.

## 5. Apresentação da solução

Demonstrar uma descrição informal; usar “Organizar descrição”; revisar campos; salvar; mudar de status; imprimir. A apresentação deve expor claramente o que já foi construído e o que será desenvolvido para uso comercial real (veja `03-roteiro-apresentacao.md`).

## Privacidade e riscos

O sistema trata nomes, telefones e descrições de atendimento, potencialmente com dados pessoais. Há necessidade de definir finalidade, acesso, retenção, segurança e direitos dos titulares antes de adoção real, seguindo a LGPD e orientações da ANPD para agentes de pequeno porte. O modo demonstrativo não é solução completa de conformidade.

### Fontes oficiais consultadas

- ANPD — Guia de segurança para agentes de tratamento de pequeno porte: https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-sobre-seguranca-da-informacao-para-agentes-de-tratamento-de-pequeno-porte
- Google AI Developers — Gemini API e saídas estruturadas: https://ai.google.dev/gemini-api/docs/structured-output
- Google AI Developers — Modelos disponíveis: https://ai.google.dev/gemini-api/docs/models
