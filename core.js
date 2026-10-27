/* Núcleo compartilhado: regras locais determinísticas usadas como alternativa à IA. */
(function(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.ServicoIACore = api;
})(typeof window !== 'undefined' ? window : null, function() {
  const allowedCategories = ['Informática', 'Mecânica', 'Instalação', 'Outros'];
  const allowedPriorities = ['Baixa', 'Média', 'Alta'];
  function clean(value, max = 2000) { return String(value ?? '').trim().replace(/\s+/g, ' ').slice(0, max); }
  function redactPII(text) {
    return clean(text, 4000)
      .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, '[EMAIL OCULTO]')
      .replace(/(?:\+?55\s?)?(?:\(?\d{2}\)?[\s.-]?)?\d{4,5}[\s.-]?\d{4}/g, '[TELEFONE OCULTO]');
  }
  function organizeLocal(raw) {
    const descricao = clean(raw, 4000);
    const lower = descricao.toLocaleLowerCase('pt-BR');
    let categoria = 'Outros';
    if (/notebook|computador|pc\b|impressora|windows|ssd|hd\b|wifi|wi-fi|roteador|monitor|placa.mãe|teclado|software|formatar|formatação/.test(lower)) categoria = 'Informática';
    else if (/carro|moto\b|motor|freio|embreagem|câmbio|cambio|óleo|oleo|pneu|bateria automotiva|veículo|veiculo|suspensão/.test(lower)) categoria = 'Mecânica';
    else if (/instala[rç]|monta[rç]|ar.condicionado|câmera|camera|alarme|painel solar|chuveiro|antena|cabeamento/.test(lower)) categoria = 'Instalação';
    let equipamento = 'Não informado';
    const models = ['notebook', 'computador', 'impressora', 'roteador', 'monitor', 'moto', 'carro', 'motor', 'ar-condicionado', 'câmera', 'alarme', 'chuveiro', 'painel solar'];
    for (const m of models) if (lower.includes(m)) { equipamento = m[0].toUpperCase() + m.slice(1); break; }
    const prioridade = /urgente|urgência|emergência|emergencia|parado|hoje|imediatamente|não funciona|nao funciona|não liga|nao liga|risco/.test(lower) ? 'Alta'
      : /quando possível|quando possivel|sem pressa|agendar|preventiva/.test(lower) ? 'Baixa' : 'Média';
    const action = /instala[rç]|monta[rç]/.test(lower) ? 'Instalação' : /revis[aã]o|manuten[cç][aã]o|limpeza/.test(lower) ? 'Manutenção' : /troca[rç]|substitu/.test(lower) ? 'Troca de componente' : 'Diagnóstico';
    const alvo = equipamento === 'Não informado' ? categoria.toLocaleLowerCase('pt-BR') : equipamento.toLocaleLowerCase('pt-BR');
    const titulo = `${action} de ${alvo}`.slice(0, 100);
    let servicoSugerido = 'Realizar avaliação técnica, confirmar o diagnóstico com o cliente e registrar os procedimentos executados.';
    if (categoria === 'Informática') servicoSugerido = 'Verificar sintomas, testar componentes e registrar diagnóstico antes de executar reparos ou substituir peças.';
    if (categoria === 'Mecânica') servicoSugerido = 'Fazer inspeção inicial, identificar a causa da falha e apresentar orçamento antes da execução.';
    if (categoria === 'Instalação') servicoSugerido = 'Verificar local e condições da instalação, conferir materiais e executar testes de funcionamento.';
    return { titulo, categoria, equipamento, prioridade, resumo: descricao, servicoSugerido, modo: 'regras-locais' };
  }
  function normalizeSuggestion(candidate, original) {
    const backup = organizeLocal(original);
    const obj = candidate && typeof candidate === 'object' ? candidate : {};
    return {
      titulo: clean(obj.titulo, 100) || backup.titulo,
      categoria: allowedCategories.includes(obj.categoria) ? obj.categoria : backup.categoria,
      equipamento: clean(obj.equipamento, 100) || backup.equipamento,
      prioridade: allowedPriorities.includes(obj.prioridade) ? obj.prioridade : backup.prioridade,
      resumo: clean(obj.resumo, 1200) || backup.resumo,
      servicoSugerido: clean(obj.servicoSugerido, 1200) || backup.servicoSugerido,
      modo: 'gemini'
    };
  }
  return { clean, redactPII, organizeLocal, normalizeSuggestion, allowedCategories, allowedPriorities };
});
