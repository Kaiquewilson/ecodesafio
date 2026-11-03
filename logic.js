/* EcoDesafio beta - regras de negócio (sem acesso ao DOM, para poder ser testado em Node). */
(function (root) {
  'use strict';

  var QUIZ_PONTOS = 5;
  var DIA = 24 * 60 * 60 * 1000;
  var STORAGE_KEY = 'ecodesafio-beta-v1';
  var NIVEIS = [
    { min: 0, nome: 'Semente' },
    { min: 30, nome: 'Muda' },
    { min: 70, nome: 'Árvore' },
    { min: 110, nome: 'Mata' }
  ];

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function erro(msg) { return { ok: false, erro: msg }; }
  function txt(t) { return String(t == null ? '' : t).trim(); }
  function maxId(lista) { return lista.reduce(function (m, x) { return Math.max(m, x.id); }, 0); }

  /* ---------- estado e armazenamento ---------- */
  function novoEstado(seed) {
    return {
      versao: 1,
      users: [],
      desafios: clone(seed.desafios),
      participacoes: [],
      respostas: [],
      eventos: [],
      sessao: null,
      proximoUser: 1,
      proximoDesafio: maxId(seed.desafios) + 1
    };
  }

  function carregar(storage, seed) {
    try {
      var raw = storage.getItem(STORAGE_KEY);
      if (raw) {
        var s = JSON.parse(raw);
        if (s && s.versao === 1 && Array.isArray(s.users) && Array.isArray(s.desafios)) { return s; }
      }
    } catch (e) { /* cai para o estado novo */ }
    return novoEstado(seed);
  }

  function salvar(storage, estado) {
    try { storage.setItem(STORAGE_KEY, JSON.stringify(estado)); return true; }
    catch (e) { return false; }
  }

  function registrar(estado, tipo, userId, desafioId, agora) {
    estado.eventos.push({ t: agora, tipo: tipo, userId: userId, desafioId: desafioId || null });
  }

  /* ---------- usuários (RF01) ---------- */
  function usuarioPorId(estado, id) {
    for (var i = 0; i < estado.users.length; i++) { if (estado.users[i].id === id) { return estado.users[i]; } }
    return null;
  }
  function usuarioAtual(estado) { return estado.sessao == null ? null : usuarioPorId(estado, estado.sessao); }

  function cadastrar(estado, dados, vizinhos, agora) {
    agora = agora || Date.now();
    var apelido = txt(dados.apelido);
    var email = txt(dados.email).toLowerCase();
    if (apelido.length < 2 || apelido.length > 20) { return erro('O apelido deve ter de 2 a 20 caracteres.'); }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { return erro('Digite um e-mail válido, como nome@exemplo.com.'); }
    var ap = apelido.toLowerCase();
    var usado = estado.users.some(function (u) { return u.apelido.toLowerCase() === ap; }) ||
      (vizinhos || []).some(function (v) { return v.apelido.toLowerCase() === ap; });
    if (usado) { return erro('Esse apelido já está em uso. Escolha outro.'); }
    if (estado.users.some(function (u) { return u.email === email; })) { return erro('Esse e-mail já tem cadastro. Use a opção Entrar.'); }
    var user = { id: estado.proximoUser++, apelido: apelido, email: email, admin: false, criadoEm: agora };
    estado.users.push(user);
    estado.sessao = user.id;
    registrar(estado, 'cadastro', user.id, null, agora);
    return { ok: true, user: user };
  }

  function entrar(estado, email, agora) {
    agora = agora || Date.now();
    email = txt(email).toLowerCase();
    var user = null;
    estado.users.forEach(function (u) { if (u.email === email && !u.admin) { user = u; } });
    if (!user) { return erro('Não encontramos esse e-mail. Confira a digitação ou crie sua conta.'); }
    estado.sessao = user.id;
    registrar(estado, 'login', user.id, null, agora);
    return { ok: true, user: user };
  }

  function entrarAdmin(estado, agora) {
    agora = agora || Date.now();
    var user = null;
    estado.users.forEach(function (u) { if (u.admin) { user = u; } });
    if (!user) {
      user = { id: estado.proximoUser++, apelido: 'Administrador', email: 'admin@beta.local', admin: true, criadoEm: agora };
      estado.users.push(user);
    }
    estado.sessao = user.id;
    return { ok: true, user: user };
  }

  function sair(estado) { estado.sessao = null; }

  /* ---------- desafios, participação e quiz (RF02, RF03, RF07) ---------- */
  function desafioPorId(estado, id) {
    for (var i = 0; i < estado.desafios.length; i++) { if (estado.desafios[i].id === id) { return estado.desafios[i]; } }
    return null;
  }
  function desafiosAtivos(estado) { return estado.desafios.filter(function (d) { return d.ativo; }); }

  function participacao(estado, userId, desafioId) {
    for (var i = 0; i < estado.participacoes.length; i++) {
      var p = estado.participacoes[i];
      if (p.userId === userId && p.desafioId === desafioId) { return p; }
    }
    return null;
  }
  function resposta(estado, userId, desafioId) {
    for (var i = 0; i < estado.respostas.length; i++) {
      var r = estado.respostas[i];
      if (r.userId === userId && r.desafioId === desafioId) { return r; }
    }
    return null;
  }

  function aceitar(estado, userId, desafioId, agora) {
    agora = agora || Date.now();
    var d = desafioPorId(estado, desafioId);
    if (!d || !d.ativo) { return erro('Esse desafio não está disponível.'); }
    if (participacao(estado, userId, desafioId)) { return erro('Você já aceitou esse desafio.'); }
    var p = { userId: userId, desafioId: desafioId, aceitoEm: agora, concluidoEm: null, observacao: '' };
    estado.participacoes.push(p);
    registrar(estado, 'aceito', userId, desafioId, agora);
    return { ok: true, participacao: p };
  }

  function concluir(estado, userId, desafioId, observacao, agora) {
    agora = agora || Date.now();
    var p = participacao(estado, userId, desafioId);
    if (!p) { return erro('Aceite o desafio antes de marcá-lo como concluído.'); }
    if (p.concluidoEm) { return erro('Esse desafio já foi concluído. Os pontos são contados uma única vez.'); }
    var obs = txt(observacao);
    if (obs.length > 280) { return erro('A observação pode ter até 280 caracteres.'); }
    p.concluidoEm = agora;
    p.observacao = obs;
    registrar(estado, 'concluido', userId, desafioId, agora);
    return { ok: true, participacao: p, pontos: desafioPorId(estado, desafioId).pontos };
  }

  function responder(estado, userId, desafioId, escolha, agora) {
    agora = agora || Date.now();
    var d = desafioPorId(estado, desafioId);
    if (!d || !d.pergunta) { return erro('Esse desafio não tem quiz.'); }
    if (resposta(estado, userId, desafioId)) { return erro('Você já respondeu a esse quiz.'); }
    if (typeof escolha !== 'number' || escolha < 0 || escolha >= d.pergunta.alternativas.length) { return erro('Escolha uma alternativa antes de responder.'); }
    var acertou = escolha === d.pergunta.correta;
    var r = { userId: userId, desafioId: desafioId, escolha: escolha, acertou: acertou, em: agora };
    estado.respostas.push(r);
    registrar(estado, 'quiz', userId, desafioId, agora);
    return { ok: true, resposta: r, acertou: acertou, pontos: acertou ? QUIZ_PONTOS : 0 };
  }

  /* ---------- pontos, nível, ranking, histórico (RF04, RF05, RF08) ---------- */
  function pontosDe(estado, userId, desde) {
    var pd = 0, pq = 0;
    estado.participacoes.forEach(function (p) {
      if (p.userId === userId && p.concluidoEm && (!desde || p.concluidoEm >= desde)) {
        var d = desafioPorId(estado, p.desafioId);
        if (d) { pd += d.pontos; }
      }
    });
    estado.respostas.forEach(function (r) {
      if (r.userId === userId && r.acertou && (!desde || r.em >= desde)) { pq += QUIZ_PONTOS; }
    });
    return { desafios: pd, quiz: pq, total: pd + pq };
  }

  function nivelDe(total) {
    var i = 0;
    for (var k = 0; k < NIVEIS.length; k++) { if (total >= NIVEIS[k].min) { i = k; } }
    var atual = NIVEIS[i];
    var proximo = NIVEIS[i + 1] || null;
    var pct = proximo ? Math.round(((total - atual.min) / (proximo.min - atual.min)) * 100) : 100;
    return { atual: atual, proximo: proximo, faltam: proximo ? proximo.min - total : 0, pct: pct };
  }

  function ranking(estado, tipo, vizinhos, agora) {
    agora = agora || Date.now();
    var desde = tipo === 'semana' ? agora - 7 * DIA : null;
    var linhas = [];
    estado.users.forEach(function (u) {
      if (u.admin) { return; }
      linhas.push({ userId: u.id, apelido: u.apelido, pontos: pontosDe(estado, u.id, desde).total, exemplo: false });
    });
    (vizinhos || []).forEach(function (v) {
      linhas.push({ userId: null, apelido: v.apelido, pontos: tipo === 'semana' ? v.semana : v.total, exemplo: true });
    });
    linhas.sort(function (a, b) { return b.pontos - a.pontos || a.apelido.localeCompare(b.apelido, 'pt-BR'); });
    linhas.forEach(function (l, i) {
      l.posicao = (i > 0 && l.pontos === linhas[i - 1].pontos) ? linhas[i - 1].posicao : i + 1;
    });
    return linhas;
  }

  function historico(estado, userId) {
    return estado.participacoes
      .filter(function (p) { return p.userId === userId && p.concluidoEm; })
      .sort(function (a, b) { return b.concluidoEm - a.concluidoEm; })
      .map(function (p) {
        return { desafio: desafioPorId(estado, p.desafioId), concluidoEm: p.concluidoEm, observacao: p.observacao, quiz: resposta(estado, userId, p.desafioId) };
      });
  }

  /* ---------- administração e métricas (RF09, RF10) ---------- */
  function validarDesafio(d, seed) {
    if (txt(d.titulo).length < 3 || txt(d.titulo).length > 80) { return 'O título deve ter de 3 a 80 caracteres.'; }
    if (txt(d.descricao).length < 10) { return 'A descrição precisa ter pelo menos 10 caracteres.'; }
    if (seed.temas.indexOf(d.tema) < 0) { return 'Escolha um tema da lista.'; }
    if (seed.dificuldades.indexOf(d.dificuldade) < 0) { return 'Escolha uma dificuldade da lista.'; }
    var pts = Number(d.pontos);
    if (!isFinite(pts) || pts % 1 !== 0 || pts < 1 || pts > 100) { return 'Os pontos devem ser um número inteiro de 1 a 100.'; }
    if (txt(d.conteudo).length < 20) { return 'O conteúdo educativo precisa ter pelo menos 20 caracteres.'; }
    var q = d.pergunta || {};
    if (txt(q.enunciado).length < 5) { return 'Escreva o enunciado da pergunta do quiz.'; }
    var alts = (q.alternativas || []).map(txt);
    if (alts.length !== 3 || alts.some(function (a) { return a.length === 0; })) { return 'Preencha as três alternativas do quiz.'; }
    if ([0, 1, 2].indexOf(Number(q.correta)) < 0) { return 'Marque qual alternativa é a correta.'; }
    return null;
  }

  function salvarDesafio(estado, dados, seed) {
    var msg = validarDesafio(dados, seed);
    if (msg) { return erro(msg); }
    var obj = {
      titulo: txt(dados.titulo), tema: dados.tema, dificuldade: dados.dificuldade, pontos: Number(dados.pontos),
      semana: txt(dados.semana) || 'Semana 1', ativo: dados.ativo !== false,
      descricao: txt(dados.descricao), conteudo: txt(dados.conteudo),
      pergunta: {
        enunciado: txt(dados.pergunta.enunciado),
        alternativas: dados.pergunta.alternativas.map(txt),
        correta: Number(dados.pergunta.correta),
        explicacao: txt(dados.pergunta.explicacao)
      }
    };
    if (dados.id) {
      var atual = desafioPorId(estado, dados.id);
      if (!atual) { return erro('Desafio não encontrado.'); }
      obj.id = atual.id;
      estado.desafios[estado.desafios.indexOf(atual)] = obj;
    } else {
      obj.id = estado.proximoDesafio++;
      estado.desafios.push(obj);
    }
    return { ok: true, desafio: obj };
  }

  function alternarAtivo(estado, id) {
    var d = desafioPorId(estado, id);
    if (!d) { return erro('Desafio não encontrado.'); }
    d.ativo = !d.ativo;
    return { ok: true, desafio: d };
  }

  function metricas(estado) {
    var reais = estado.users.filter(function (u) { return !u.admin; });
    var ids = {};
    reais.forEach(function (u) { ids[u.id] = true; });
    var parts = estado.participacoes.filter(function (p) { return ids[p.userId]; });
    var resp = estado.respostas.filter(function (r) { return ids[r.userId]; });
    var concluidos = parts.filter(function (p) { return p.concluidoEm; });
    var ativosSet = {};
    concluidos.forEach(function (p) { ativosSet[p.userId] = true; });
    var acertos = resp.filter(function (r) { return r.acertou; }).length;
    var somaPontos = reais.reduce(function (s, u) { return s + pontosDe(estado, u.id).total; }, 0);
    return {
      usuarios: reais.length,
      ativos: Object.keys(ativosSet).length,
      aceitos: parts.length,
      concluidos: concluidos.length,
      taxaConclusao: parts.length ? Math.round((concluidos.length / parts.length) * 1000) / 10 : null,
      quizRespondidas: resp.length,
      quizAcertos: acertos,
      taxaAcerto: resp.length ? Math.round((acertos / resp.length) * 1000) / 10 : null,
      pontosMedios: reais.length ? Math.round((somaPontos / reais.length) * 10) / 10 : null,
      porDesafio: estado.desafios.map(function (d) {
        var ac = parts.filter(function (p) { return p.desafioId === d.id; });
        return { id: d.id, titulo: d.titulo, aceitos: ac.length, concluidos: ac.filter(function (p) { return p.concluidoEm; }).length };
      })
    };
  }

  /* ---------- exportação (sem e-mails) ---------- */
  function celula(v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""').replace(/\r?\n/g, ' ') + '"'; }
  function iso(t) { return t ? new Date(t).toISOString() : ''; }

  function exportarCSV(estado) {
    var linhas = [['usuario', 'desafio', 'tema', 'aceito_em', 'concluido_em', 'observacao', 'quiz'].map(celula).join(';')];
    estado.participacoes.forEach(function (p) {
      var u = usuarioPorId(estado, p.userId);
      if (!u || u.admin) { return; }
      var d = desafioPorId(estado, p.desafioId) || {};
      var r = resposta(estado, p.userId, p.desafioId);
      linhas.push([u.apelido, d.titulo, d.tema, iso(p.aceitoEm), iso(p.concluidoEm), p.observacao, r ? (r.acertou ? 'acertou' : 'errou') : ''].map(celula).join(';'));
    });
    return linhas.join('\r\n');
  }

  function exportarJSON(estado) {
    var c = clone(estado);
    c.sessao = null;
    c.users = c.users.map(function (u) { return { id: u.id, apelido: u.apelido, admin: u.admin, criadoEm: u.criadoEm }; });
    return JSON.stringify(c, null, 2);
  }

  var API = {
    QUIZ_PONTOS: QUIZ_PONTOS, NIVEIS: NIVEIS, STORAGE_KEY: STORAGE_KEY, DIA: DIA,
    novoEstado: novoEstado, carregar: carregar, salvar: salvar,
    cadastrar: cadastrar, entrar: entrar, entrarAdmin: entrarAdmin, sair: sair, usuarioAtual: usuarioAtual, usuarioPorId: usuarioPorId,
    desafioPorId: desafioPorId, desafiosAtivos: desafiosAtivos, participacao: participacao, resposta: resposta,
    aceitar: aceitar, concluir: concluir, responder: responder,
    pontosDe: pontosDe, nivelDe: nivelDe, ranking: ranking, historico: historico,
    validarDesafio: validarDesafio, salvarDesafio: salvarDesafio, alternarAtivo: alternarAtivo,
    metricas: metricas, exportarCSV: exportarCSV, exportarJSON: exportarJSON
  };

  if (typeof module !== 'undefined' && module.exports) { module.exports = API; }
  else { root.EcoLogic = API; }
})(typeof window !== 'undefined' ? window : globalThis);
