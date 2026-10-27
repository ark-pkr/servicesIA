(() => {
  'use strict';
  const core = window.ServicoIACore;
  const STORAGE_KEY = 'servicoia_mvp_v1';
  const $ = id => document.getElementById(id);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const money = n => Number(n || 0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  const dateFmt = iso => iso ? new Date(iso.length===10?`${iso}T12:00:00`:iso).toLocaleDateString('pt-BR') : 'Não informada';
  const stamp = () => new Date().toISOString();
  const uid = () => (window.crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);
  const statuses = ['Aberta','Em andamento','Aguardando peça','Concluída','Cancelada'];
  const statusClass = status => ({'Aberta':'open','Em andamento':'progress','Aguardando peça':'waiting','Concluída':'done','Cancelada':'cancelled'}[status]||'open');
  const priorityClass = value => ({'Alta':'high','Média':'medium','Baixa':'low'}[value]||'medium');
  const statusBadge = status => `<span class="status-badge ${statusClass(status)}">${esc(status)}</span>`;
  const toast = message => { const el=$('toast'); el.textContent=message; el.classList.add('show'); clearTimeout(toast.timer); toast.timer=setTimeout(()=>el.classList.remove('show'),3400); };
  let editingOrderId = null;
  let orderDetailId = null;
  let editingCustomerId = null;
  let quickCustomer = false;
  let state = load();
  let currentView = 'dashboard';

  function demoData() {
    const t=stamp();
    return {
      demo:true, nextNumber:1004,
      customers:[
        {id:'demo-c1',name:'Marina Souza (exemplo)',phone:'(00) 90000-0000',email:'',address:'',createdAt:t},
        {id:'demo-c2',name:'Carlos Oliveira (exemplo)',phone:'(00) 90000-0000',email:'',address:'',createdAt:t},
        {id:'demo-c3',name:'Joana Lima (exemplo)',phone:'(00) 90000-0000',email:'',address:'',createdAt:t}
      ],
      orders:[
        {id:'demo-o1',number:1001,customerId:'demo-c1',title:'Diagnóstico de notebook',category:'Informática',equipment:'Notebook Dell',priority:'Alta',price:180,due:'',description:'Notebook não liga, cliente solicita diagnóstico.',service:'Verificar fonte, bateria e placa antes do reparo.',notes:'Aguardando autorização.',status:'Em andamento',createdAt:t,updatedAt:t,history:[{at:t,text:'Ordem criada.'},{at:t,text:'Status atualizado para Em andamento.'}]},
        {id:'demo-o2',number:1002,customerId:'demo-c2',title:'Revisão de freios',category:'Mecânica',equipment:'Carro',priority:'Média',price:420,due:'',description:'Ruído ao frear.',service:'Inspecionar sistema de freios e apresentar orçamento.',notes:'',status:'Aberta',createdAt:t,updatedAt:t,history:[{at:t,text:'Ordem criada.'}]},
        {id:'demo-o3',number:1003,customerId:'demo-c3',title:'Instalação de câmera',category:'Instalação',equipment:'Câmera IP',priority:'Baixa',price:350,due:'',description:'Instalação de câmera de segurança residencial.',service:'Instalar câmera e testar acesso remoto.',notes:'Atendimento demonstrativo.',status:'Concluída',createdAt:t,updatedAt:t,history:[{at:t,text:'Ordem criada.'},{at:t,text:'Status atualizado para Concluída.'}]}
      ]
    };
  }
  function validState(x) { return x && Array.isArray(x.customers) && Array.isArray(x.orders) && Number.isSafeInteger(x.nextNumber) && x.nextNumber>0 && x.nextNumber<1e9; }
  function load() {
    try { const data=JSON.parse(localStorage.getItem(STORAGE_KEY)); if(validState(data)) return data; } catch(e) { console.warn('Dados salvos não puderam ser lidos', e); }
    return demoData();
  }
  function persist() {
    try { localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); return true; }
    catch(err) { toast('Não foi possível salvar neste navegador. Exporte um backup.'); console.warn(err); return false; }
  }
  function customerFor(order) { return state.customers.find(c=>c.id===order.customerId); }
  function sortOrders(orders) { return orders.slice().sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)) || b.number-a.number); }
  function switchView(next) {
    if(!['dashboard','orders','customers','new','about'].includes(next)) return;
    currentView=next;
    $$('.view').forEach(el=>el.classList.toggle('active',el.id===`view-${next}`));
    $$('.nav-link[data-view]').forEach(el=>el.classList.toggle('active',el.dataset.view===next));
    $('breadcrumbCurrent').textContent=({dashboard:'Visão geral',orders:'Ordens de serviço',customers:'Clientes',new:'Criar com IA',about:'Como funciona'})[next];
    closeSidebar();
    if(next==='new') refreshCustomerSelect();
    if(next==='orders') renderOrders();
    if(next==='customers') renderCustomers();
    if(next==='dashboard') renderDashboard();
    window.scrollTo({top:0,behavior:'instant'});
  }
  function openSidebar() { $('sidebar').classList.add('is-open'); $('backdrop').hidden=false; }
  function closeSidebar() { $('sidebar').classList.remove('is-open'); $('backdrop').hidden=true; }
  function renderAll() { renderDashboard();renderOrders();renderCustomers();refreshCustomerSelect();$('navCount').textContent=String(state.orders.length); }
  function renderDashboard() {
    $('statTotal').textContent=state.orders.length;
    $('statProgress').textContent=state.orders.filter(o=>['Em andamento','Aguardando peça'].includes(o.status)).length;
    $('statDone').textContent=state.orders.filter(o=>o.status==='Concluída').length;
    $('statValue').textContent=money(state.orders.filter(o=>o.status!=='Cancelada').reduce((s,o)=>s+Number(o.price||0),0));
    const recent=sortOrders(state.orders).slice(0,5);
    $('recentOrders').innerHTML=recent.length ? recent.map(o=>`<div class="recent-item" role="button" tabindex="0" data-order="${esc(o.id)}"><span class="recent-ico">${({Informática:'▣',Mecânica:'⚙',Instalação:'⌁',Outros:'◈'})[o.category]||'◈'}</span><span class="recent-copy"><span class="recent-title">${esc(o.title)}</span><span class="recent-meta">OS #${o.number} · ${esc(customerFor(o)?.name||'Cliente não encontrado')}</span></span><span class="recent-right">${statusBadge(o.status)}<small>${dateFmt(o.updatedAt)}</small></span></div>`).join('') : '<div class="empty-state">Ainda não há ordens de serviço.</div>';
    $('navCount').textContent=String(state.orders.length);
  }
  function renderOrders() {
    const q=$('orderSearch').value.trim().toLowerCase();const status=$('statusFilter').value;
    const data=sortOrders(state.orders).filter(o => {
      const customer=customerFor(o)?.name||'';
      return (status==='all'||o.status===status) && (`${o.number} ${o.title} ${o.equipment} ${customer} ${o.category}`.toLowerCase().includes(q));
    });
    $('ordersBody').innerHTML=data.map(o=>`<tr><td><button type="button" class="table-link" data-order="${esc(o.id)}">#${o.number}</button><strong style="display:block">${esc(o.title)}</strong><small>${esc(o.category)} · ${esc(o.equipment||'Sem item')}</small></td><td><strong>${esc(customerFor(o)?.name||'Não encontrado')}</strong><small>${dateFmt(o.createdAt)}</small></td><td>${statusBadge(o.status)}</td><td><span class="priority ${priorityClass(o.priority)}">${esc(o.priority)}</span></td><td><strong>${money(o.price)}</strong></td><td><button type="button" class="table-link" data-order="${esc(o.id)}">Abrir →</button></td></tr>`).join('');
    $('emptyOrders').hidden=Boolean(data.length);
  }
  function renderCustomers() {
    const q=$('customerSearch').value.trim().toLowerCase();const data=state.customers.filter(c=>`${c.name} ${c.phone} ${c.email}`.toLowerCase().includes(q));
    $('customerCount').textContent=`${state.customers.length} cliente(s)`;
    $('customersBody').innerHTML=data.map(c=>`<tr><td><strong>${esc(c.name)}</strong><small>${esc(c.email||'E-mail não informado')}</small></td><td>${esc(c.phone||'—')}</td><td>${esc(c.address||'—')}</td><td><strong>${state.orders.filter(o=>o.customerId===c.id).length}</strong></td><td><span class="table-actions"><button type="button" class="table-link" data-customer="${esc(c.id)}">Editar</button><button type="button" class="table-link" data-delete-customer="${esc(c.id)}">Excluir</button></span></td></tr>`).join('');
    $('emptyCustomers').hidden=Boolean(data.length);
  }
  function refreshCustomerSelect(wanted=$('orderCustomer').value) {
    $('orderCustomer').innerHTML=`<option value="">Selecione um cliente</option>${state.customers.map(c=>`<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('')}`;
    if(wanted && state.customers.some(c=>c.id===wanted)) $('orderCustomer').value=wanted;
  }
  function openCustomer(id=null,quick=false) {
    quickCustomer=quick;editingCustomerId=id;
    $('customerForm').reset();
    $('customerDialogTitle').textContent=id?'Editar cliente':'Novo cliente';
    if(id) {const c=state.customers.find(x=>x.id===id);if(!c)return;$('customerName').value=c.name;$('customerPhone').value=c.phone||'';$('customerEmail').value=c.email||'';$('customerAddress').value=c.address||'';}
    $('customerDialog').showModal();
    $('customerName').focus();
  }
  function customerSubmit(e) {
    e.preventDefault(); const name=$('customerName').value.trim();if(!name)return;
    const data={name,phone:$('customerPhone').value.trim(),email:$('customerEmail').value.trim(),address:$('customerAddress').value.trim()};
    let id=editingCustomerId;
    if(id){const c=state.customers.find(x=>x.id===id);if(c)Object.assign(c,data);} else {id=uid();state.customers.push({id,...data,createdAt:stamp()});}
    state.demo=false;persist();renderAll();$('customerDialog').close();
    if(quickCustomer){switchView('new');refreshCustomerSelect(id);} else if(currentView==='customers'){renderCustomers();}
    toast(editingCustomerId?'Cliente atualizado.':'Cliente salvo com sucesso.');
  }
  function deleteCustomer(id) {
    const c=state.customers.find(x=>x.id===id);if(!c)return;
    if(state.orders.some(o=>o.customerId===id)){toast('Este cliente possui OS vinculada. Exclua ou reassocie as ordens antes.');return;}
    if(!confirm(`Excluir o cliente ${c.name}?`)) return;
    state.customers=state.customers.filter(x=>x.id!==id);persist();renderAll();toast('Cliente excluído.');
  }
  function resetOrderForm() {
    editingOrderId=null; $('orderForm').reset();$('description').value='';$('descriptionCount').textContent='0 / 4000';$('aiFeedback').textContent='';$('orderCategory').value='Informática';$('orderPriority').value='Média';$('saveOrderBtn').textContent='✓ Salvar ordem de serviço';
  }
  async function organizeText() {
    const desc=$('description').value.trim();
    if(desc.length<10){toast('Escreva ao menos 10 caracteres sobre o trabalho.');$('description').focus();return;}
    const button=$('organizeBtn');button.disabled=true;$('aiFeedback').textContent='Organizando sua descrição...';
    let suggestion,notice;
    try {
      const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),18000);
      try {const response=await fetch('/api/organizar',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({descricao:desc}),signal:controller.signal});if(!response.ok)throw Error('Serviço indisponível');const data=await response.json();suggestion=data;notice=data.aviso;}
      finally{clearTimeout(timer);}
    } catch(e) { suggestion=core.organizeLocal(desc);notice='Organização por regras locais: a IA conectada não está disponível neste acesso.'; }
    $('orderTitle').value=suggestion.titulo||'';
    $('orderCategory').value=suggestion.categoria||'Outros';
    $('orderEquipment').value=suggestion.equipamento==='Não informado'?'':(suggestion.equipamento||'');
    $('orderPriority').value=suggestion.prioridade||'Média';
    $('orderService').value=suggestion.servicoSugerido||'';
    $('aiFeedback').textContent=(suggestion.modo==='gemini'?'✓ Sugestões geradas com IA.':'✓ Sugestões geradas com regras locais.')+' Revise os campos antes de salvar. '+(notice||'');
    button.disabled=false;toast('Campos sugeridos. Revise e salve a ordem.');
  }
  function orderSubmit(e) {
    e.preventDefault();const customerId=$('orderCustomer').value;
    if(!state.customers.some(c=>c.id===customerId)){toast('Cadastre ou selecione um cliente válido.');return;}
    const title=$('orderTitle').value.trim();if(!title){toast('Informe o título do serviço.');return;}
    const price=Number($('orderPrice').value||0);if(!Number.isFinite(price)||price<0||price>99999999){toast('Informe um valor válido.');return;}
    const now=stamp();const id=uid(); const order={id,number:state.nextNumber++,customerId,title,category:$('orderCategory').value,equipment:$('orderEquipment').value.trim(),priority:$('orderPriority').value,price,due:$('orderDue').value,description:$('description').value.trim(),service:$('orderService').value.trim(),notes:$('orderNotes').value.trim(),status:'Aberta',createdAt:now,updatedAt:now,history:[{at:now,text:'Ordem criada.'}]};
    state.orders.push(order);state.demo=false;persist();renderAll();resetOrderForm();switchView('orders');toast(`OS #${order.number} criada com sucesso.`);openOrder(order.id);
  }
  function openOrder(id) {
    const o=state.orders.find(x=>x.id===id);if(!o)return;orderDetailId=id;
    $('detailTitle').textContent=`OS #${o.number} — ${o.title}`;
    $('orderDetail').innerHTML=`<div class="detail-grid"><div class="detail-box"><small>CLIENTE</small><strong>${esc(customerFor(o)?.name||'Não encontrado')}</strong></div><div class="detail-box"><small>CONTATO</small><strong>${esc(customerFor(o)?.phone||'Não informado')}</strong></div><div class="detail-box"><small>CATEGORIA / EQUIPAMENTO</small><strong>${esc(o.category)} · ${esc(o.equipment||'Não informado')}</strong></div><div class="detail-box"><small>PRIORIDADE</small><strong>${esc(o.priority)}</strong></div></div><div class="detail-label">DESCRIÇÃO ORIGINAL</div><div class="detail-text">${esc(o.description||'Não informada')}</div><div class="detail-label">SERVIÇO / PROCEDIMENTO</div><div class="detail-text">${esc(o.service||'Ainda não definido')}</div><div class="detail-grid" style="margin-top:18px"><label class="field">Status <select class="status-edit" id="detailStatus">${statuses.map(s=>`<option ${s===o.status?'selected':''}>${esc(s)}</option>`).join('')}</select></label><label class="field">Orçamento (R$) <input id="detailPrice" type="number" min="0" max="99999999" step="0.01" value="${Number(o.price||0)}" /></label><label class="field">Previsão de entrega <input id="detailDue" type="date" value="${esc(o.due||'')}" /></label><label class="field">Observações internas <textarea id="detailNotes" rows="2" maxlength="2000">${esc(o.notes||'')}</textarea></label></div><div class="detail-label">HISTÓRICO</div><div class="detail-history">${(o.history||[]).slice().reverse().map(h=>`<div class="history-item"><strong>${esc(h.text)}</strong><br>${dateFmt(h.at)}</div>`).join('')}</div>`;
    $('orderDialog').showModal();
  }
  function saveOrderUpdate() {
    const o=state.orders.find(x=>x.id===orderDetailId);if(!o)return;
    const price=Number($('detailPrice').value||0);if(!Number.isFinite(price)||price<0||price>99999999){toast('Valor inválido.');return;}
    const next={status:$('detailStatus').value,price,due:$('detailDue').value,notes:$('detailNotes').value.trim()};
    const changes=[];
    if(next.status!==o.status) changes.push(`Status: ${next.status}.`);
    if(next.price!==Number(o.price||0)) changes.push('Orçamento atualizado.');
    if(next.due!==(o.due||'')) changes.push('Previsão de entrega atualizada.');
    if(next.notes!==(o.notes||'')) changes.push('Observações atualizadas.');
    if(!changes.length){toast('Nenhuma alteração identificada.');return;}
    Object.assign(o,next,{updatedAt:stamp()});o.history=o.history||[];o.history.push({at:o.updatedAt,text:changes.join(' ')});
    persist();renderAll();$('orderDialog').close();toast('Ordem atualizada.');
  }
  function deleteOrder() {
    const o=state.orders.find(x=>x.id===orderDetailId);if(!o)return;
    if(!confirm(`Excluir definitivamente a OS #${o.number}?`))return;
    state.orders=state.orders.filter(x=>x.id!==o.id);persist();renderAll();$('orderDialog').close();toast('OS excluída.');
  }
  function printOrder() {
    const o=state.orders.find(x=>x.id===orderDetailId);if(!o)return;
    const c=customerFor(o)||{};
    const sheet=`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>ServiçoIA - OS #${o.number}</title><style>body{font:14px Arial,sans-serif;padding:35px;line-height:1.55;color:#172235}h1{font-size:30px}h2{margin-top:30px;border-bottom:1px solid #ddd;padding-bottom:6px;font-size:16px}.tag{background:#eee9ff;padding:6px 11px;border-radius:10px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:15px}.label{font-size:11px;color:#777;text-transform:uppercase}.value{font-weight:bold}.text{white-space:pre-wrap}.sign{margin-top:80px;display:flex;justify-content:space-between;gap:30px}.sign div{border-top:1px solid #555;padding-top:9px;flex:1;text-align:center}header{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #6755e7;padding-bottom:14px}.fine{color:#777;font-size:11px}</style></head><body><header><h1>ServiçoIA</h1><div>Ordem de serviço<br><strong>#${o.number}</strong></div></header><p class="fine">Documento gerado em ${dateFmt(stamp())}. Informações sujeitas à confirmação técnica.</p><div class="grid"><p><span class="label">Cliente</span><br><span class="value">${esc(c.name||'—')}</span></p><p><span class="label">Telefone</span><br><span class="value">${esc(c.phone||'—')}</span></p><p><span class="label">E-mail</span><br>${esc(c.email||'—')}</p><p><span class="label">Endereço</span><br>${esc(c.address||'—')}</p><p><span class="label">Status</span><br><span class="tag">${esc(o.status)}</span></p><p><span class="label">Data / Previsão</span><br>${dateFmt(o.createdAt)} / ${dateFmt(o.due)}</p></div><h2>${esc(o.title)}</h2><p><strong>Equipamento:</strong> ${esc(o.equipment||'—')} · <strong>Categoria:</strong> ${esc(o.category)} · <strong>Prioridade:</strong> ${esc(o.priority)}</p><h2>Descrição do cliente</h2><p class="text">${esc(o.description||'—')}</p><h2>Serviço / Procedimento</h2><p class="text">${esc(o.service||'—')}</p><h2>Orçamento estimado</h2><p><strong>${money(o.price)}</strong></p><p class="fine">O valor é uma estimativa cadastrada pelo técnico, não uma avaliação automática.</p><div class="sign"><div>Assinatura do técnico</div><div>Ciência do cliente</div></div></body></html>`;
    const popup=window.open('','_blank','width=850,height=900');if(!popup){toast('Autorize pop-ups para imprimir.');return;}
    popup.document.open();popup.document.write(sheet);popup.document.close();popup.focus();
    popup.addEventListener('load',()=>popup.print(),{once:true});
  }
  function download(name,content,mime) {
    const blob=new Blob([content],{type:mime});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function exportBackup() {download(`ServicoIA-backup-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify({...state,exportedAt:stamp()},null,2),'application/json');toast('Backup JSON exportado.');}
  function csvSafe(text){const value=String(text??'');return '"'+(/^[=+\-@\t\r]/.test(value)?"'":'')+value.replace(/"/g,'""')+'"';}
  function exportCsv(){const rows=[['Número','Cliente','Serviço','Categoria','Equipamento','Prioridade','Status','Valor estimado','Data','Previsão'],...sortOrders(state.orders).map(o=>[o.number,customerFor(o)?.name||'',o.title,o.category,o.equipment,o.priority,o.status,Number(o.price||0).toFixed(2),o.createdAt,o.due])];download('ServicoIA-ordens.csv','\ufeff'+rows.map(row=>row.map(csvSafe).join(';')).join('\r\n'),'text/csv;charset=utf-8');toast('CSV exportado.');}
  async function importBackup(e) {
    const file=e.target.files?.[0];if(!file)return;
    try {if(file.size>3_000_000)throw Error('Arquivo muito grande.');const json=JSON.parse(await file.text());if(!validState(json))throw Error('Estrutura inválida.');
      if(json.orders.length>10000||json.customers.length>10000)throw Error('Backup acima do limite.');
      if(!json.orders.every(o=>o&&typeof o.id==='string'&&typeof o.customerId==='string'&&typeof o.title==='string'&&Number.isFinite(Number(o.price))&&Number(o.price)>=0&&Number(o.price)<1e8&&statuses.includes(o.status)))throw Error('Ordens inválidas.');
      if(!json.customers.every(c=>c&&typeof c.id==='string'&&typeof c.name==='string'))throw Error('Clientes inválidos.');
      if(!confirm('Importar o backup substituirá TODOS os dados atuais deste navegador. Continuar?'))return;
      const old=state;state={customers:json.customers,orders:json.orders,nextNumber:json.nextNumber,demo:false};if(!persist()){state=old;return;}
      renderAll();switchView('dashboard');toast('Backup importado.');
    } catch(error){toast(`Falha ao importar: ${error.message}`);} finally{e.target.value='';}
  }
  function clearDemo(){
    if(!state.demo){toast('Os registros já foram modificados. Use o backup ou exclua individualmente.');return;}
    if(!confirm('Remover todos os dados fictícios demonstrativos?'))return;
    state={customers:[],orders:[],nextNumber:1001,demo:false};persist();renderAll();switchView('dashboard');toast('Exemplos removidos.');
  }
  async function checkAI() {
    try {const response=await fetch('/api/config',{signal:AbortSignal.timeout(3500)});if(!response.ok)return;const info=await response.json();$('aiMode').innerHTML=`<span class="status-dot"></span> ${info.iaDisponivel?'IA Gemini conectada':'Regras locais'}`;}catch(e){/* arquivo local: regras locais */}
  }
  function bind() {
    $$('[data-view]').forEach(btn=>btn.addEventListener('click',()=>switchView(btn.dataset.view)));
    $('menuBtn').addEventListener('click',openSidebar);$('backdrop').addEventListener('click',closeSidebar);
    $('orderSearch').addEventListener('input',renderOrders);$('statusFilter').addEventListener('change',renderOrders);$('customerSearch').addEventListener('input',renderCustomers);
    $('addCustomerBtn').addEventListener('click',()=>openCustomer());$('quickCustomerBtn').addEventListener('click',()=>openCustomer(null,true));
    $('customerForm').addEventListener('submit',customerSubmit);$('cancelCustomerBtn').addEventListener('click',()=>$('customerDialog').close());$('closeCustomerBtn').addEventListener('click',()=>$('customerDialog').close());
    $('description').addEventListener('input',()=>{$('descriptionCount').textContent=`${$('description').value.length} / 4000`;});
    $('organizeBtn').addEventListener('click',organizeText);$('orderForm').addEventListener('submit',orderSubmit);$('resetFormBtn').addEventListener('click',resetOrderForm);
    $('closeOrderBtn').addEventListener('click',()=>$('orderDialog').close());$('saveStatusBtn').addEventListener('click',saveOrderUpdate);$('deleteOrderBtn').addEventListener('click',deleteOrder);$('printOrderBtn').addEventListener('click',printOrder);
    $('exportBtn').addEventListener('click',exportBackup);$('csvBtn').addEventListener('click',exportCsv);$('importBtn').addEventListener('click',()=>$('backupFile').click());$('backupFile').addEventListener('change',importBackup);$('clearDemoBtn').addEventListener('click',clearDemo);
    document.addEventListener('click',e=>{
      const order=e.target.closest('[data-order]'); if(order)openOrder(order.dataset.order);
      const customer=e.target.closest('[data-customer]');if(customer)openCustomer(customer.dataset.customer);
      const deleteClient=e.target.closest('[data-delete-customer]');if(deleteClient)deleteCustomer(deleteClient.dataset.deleteCustomer);
    });
    document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.matches('.recent-item'))openOrder(e.target.dataset.order);});
  }
  $('todayLabel').textContent=new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'});
  bind();persist();renderAll();checkAI();
})();
