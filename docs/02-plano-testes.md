# ServiçoIA — Plano e evidências de testes

## Objetivo

Verificar se o protótipo permite cadastrar clientes, organizar descrições, gerar e acompanhar ordens de serviço sem falhas óbvias. Usar apenas dados fictícios nos testes.

## Casos de teste

| ID | Procedimento | Resultado esperado | Tipo |
|---|---|---|---|
| CT01 | Abrir o painel inicial | Indicadores e ordens fictícias aparecem | Interface |
| CT02 | Cadastrar cliente com nome válido | Cliente aparece na listagem e na seleção da OS | Funcional |
| CT03 | Tentar cadastrar cliente sem nome | Formulário bloqueia | Validação |
| CT04 | Digitar "Notebook não liga; preciso urgente" e organizar | Categoria Informática, prioridade Alta | Organização local |
| CT05 | Digitar "Instalar câmera de segurança" | Categoria Instalação | Organização local |
| CT06 | Criar OS para um cliente selecionado | Número único e status Aberta | Funcional |
| CT07 | Alterar status para Em andamento | Alteração aparece na listagem e no histórico | Funcional |
| CT08 | Filtrar por status e buscar por cliente | Somente OS correspondentes aparecem | Interface |
| CT09 | Atualizar preço, previsão e observações | Campos atualizados e histórico registrado | Funcional |
| CT10 | Imprimir OS | Documento pronto para impressão com dados registrados | Integração navegador |
| CT11 | Exportar e importar backup | Informações preservadas após restauração | Dados |
| CT12 | Exportar CSV | Colunas e valores de ordens disponíveis | Dados |
| CT13 | Tentar excluir cliente com OS associada | Exclusão bloqueada | Consistência |
| CT14 | Abrir em viewport móvel | Conteúdo visível sem corte de formulário | Responsividade |
| CT15 | Desligar internet / não configurar chave | Continua usando regras locais | Resiliência |
| CT16 | Com chave configurada, enviar descrição | Backend consulta Gemini e exibe modo correto | Integração (manual) |

## Critérios de aceitação propostos

1. CT01–CT15 passam em navegadores modernos, após revisão manual da interface.
2. CT16 é opcional e depende de configuração de chave e disponibilidade da API.
3. Erros de IA não impedem o preenchimento manual da OS.
4. Nenhuma saída automática deve ser apresentada como diagnóstico técnico confirmado.

## Execução de testes automatizados

Com Node.js 20+ na pasta do projeto:

```bash
node --test tests/*.test.*
```

O conjunto de testes cobre análise por regras locais, remoção básica de e-mails/telefones, validação da resposta do modelo, disponibilidade da interface e fallback do backend.

## Registro de avaliação com usuários (a preencher durante piloto)

| Participante | Tipo de serviço | Tempo criação manual | Tempo criação com ServiçoIA | Dificuldades | Nota 1–5 |
|---|---|---|---|---|---|
| Técnico 1 | — | — | — | — | — |
| Técnico 2 | — | — | — | — | — |
| Técnico 3 | — | — | — | — | — |

Os campos estão deliberadamente em branco: **não houve testes com usuários reais neste protótipo**.
