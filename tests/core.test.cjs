const test = require('node:test');
const assert = require('node:assert/strict');
const {organizeLocal,redactPII,normalizeSuggestion}=require('../core.js');
test('classifica notebook sem ligar como informática / alta',()=>{
 const r=organizeLocal('O cliente trouxe um notebook que não liga e precisa de avaliação urgente');
 assert.equal(r.categoria,'Informática');assert.equal(r.prioridade,'Alta');assert.match(r.titulo,/notebook/i);
});
test('classifica revisão de freios como mecânica',()=>{
 const r=organizeLocal('O carro está com ruído nos freios e precisa de revisão preventiva');
 assert.equal(r.categoria,'Mecânica');assert.equal(r.prioridade,'Baixa');
});
test('classifica instalação de câmera',()=>{
 const r=organizeLocal('Instalar câmera de segurança no escritório');assert.equal(r.categoria,'Instalação');
});
test('não inventa valor monetário',()=>{
 const r=organizeLocal('Revisar a impressora com erro de papel');assert.equal('price' in r,false);
});
test('omite emails e telefones antes do envio externo',()=>{
 const r=redactPII('Contato maria@email.com telefone (99) 99999-1234, notebook parou');
 assert.doesNotMatch(r,/maria@email.com|99999-1234/);assert.match(r,/OCULTO/);
});
test('descarta categoria e prioridade inválidas retornadas por modelo',()=>{
 const r=normalizeSuggestion({categoria:'Hacker',prioridade:'Ultra',titulo:'  Revisão   de  PC   '},'Meu computador falha');
 assert.equal(r.categoria,'Informática');assert.equal(r.prioridade,'Média');assert.equal(r.titulo,'Revisão de PC');
});
