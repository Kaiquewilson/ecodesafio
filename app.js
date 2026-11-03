/* EcoDesafio beta - interface. Usa EcoLogic (regras) e EcoSeed (dados de exemplo). */
(function () {
  'use strict';
  var L = window.EcoLogic, S = window.EcoSeed;
  var estado = L.carregar(window.localStorage, S);
  var principal = document.getElementById('principal');
  var topo = document.getElementById('topo');
  var abas = document.getElementById('abas');
  var aviso = document.getElementById('aviso');
  var timerAviso = null;

  function esc(t) {
    return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function salvar() {
    if (!L.salvar(window.localStorage, estado)) { avisar('Não foi possível salvar neste navegador.'); }
  }
  function avisar(msg) {
    aviso.textContent = msg; aviso.classList.add('on');
    clearTimeout(timerAviso); timerAviso = setTimeout(function () { aviso.classList.remove('on'); }, 3200);
  }
  function ir(rota) { if (location.hash === '#' + rota) { render(); } else { location.hash = rota; } }
  function dataHora(t) { return new Date(t).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }); }

  /* ---------- peças visuais ---------- */
  var COR_TEMA = { 'Água': '#2f7fb5', 'Energia': '#e0a100', 'Reciclagem': '#2b6a38', 'Consumo': '#9a5b2e' };
  function tampinha(tema, texto, classe) {
    var cor = COR_TEMA[tema] || '#2b6a38';
    var dentes = '';
    for (var i = 0; i < 12; i++) {
      var a = i * 30 * Math.PI / 180;
      dentes += '<circle cx="' + (30 + 27 * Math.cos(a)).toFixed(1) + '" cy="' + (30 + 27 * Math.sin(a)).toFixed(1) + '" r="4.6" fill="' + cor + '"/>';
    }
    return '<svg class="' + (classe || 'tampa') + '" viewBox="0 0 60 60" aria-hidden="true" focusable="false">' + dentes +
      '<circle cx="30" cy="30" r="25" fill="' + cor + '"/><circle cx="30" cy="30" r="20" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2"/>' +
      '<text x="30" y="36" text-anchor="middle" fill="#fff">' + esc(texto || '') + '</text></svg>';
  }
  var ICONES = {
    desafios: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 13l4 4L19 7"/><rect x="3" y="3" width="18" height="18" rx="4"/></svg>',
    ranking: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 20V10M12 20V4M18 20v-7"/></svg>',
    perfil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/></svg>',
    metricas: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19h16M7 16V9M12 16V5M17 16v-4"/></svg>',
    gerir: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h10"/></svg>'
  };
  function marca() {
    return '<a class="marca" href="#/">' + tampinha('Reciclagem', '', 'x') .replace('class="x"', '') + 'EcoDesafio</a>';
  }

  /* ---------- moldura (topo e abas) ---------- */
  function moldura(rota) {
    var u = L.usuarioAtual(estado);
    var acoes = '';
    if (u) { acoes = '<span class="nome-user">' + esc(u.admin ? 'Administrador' : u.apelido) + '</span><button class="btn sec peq" id="btn-sair" type="button">Sair</button>'; }
    topo.innerHTML = marca() + '<div class="topo-acoes">' + acoes + '</div>';
    var sair = document.getElementById('btn-sair');
    if (sair) { sair.addEventListener('click', function () { L.sair(estado); salvar(); ir('/'); }); }
    var itens = [];
    if (u && !u.admin) { itens = [['/desafios', 'Desafios', 'desafios'], ['/ranking', 'Ranking', 'ranking'], ['/perfil', 'Meu perfil', 'perfil']]; }
    if (u && u.admin) { itens = [['/admin', 'Desafios', 'gerir'], ['/admin/metricas', 'Métricas', 'metricas']]; }
    abas.innerHTML = itens.map(function (i) {
      var atual = rota === i[0] || (i[0] !== '/admin' && rota.indexOf(i[0] + '/') === 0) || (i[0] === '/desafios' && rota.indexOf('/desafio/') === 0) || (i[0] === '/admin' && /^\/admin\/(novo|editar)/.test(rota));
      return '<a href="#' + i[0] + '"' + (atual ? ' aria-current="page"' : '') + '>' + ICONES[i[2]] + '<span>' + i[1] + '</span></a>';
    }).join('');
  }

  /* ---------- telas ---------- */
  function telaEntrada(erroMsg) {
    principal.className = '';
    principal.innerHTML =
      '<section class="hero">' + tampinha('Reciclagem', '+10', 'tampa-gde') +
      '<h1>Um desafio por vez, um bairro mais sustentável.</h1>' +
      '<p>Aceite desafios simples, ganhe pontos e veja a sua turma subir no ranking.</p></section>' +
      '<div class="cartao"><h2>Entrar</h2>' +
      (erroMsg ? '<div class="erro" role="alert">' + esc(erroMsg) + '</div>' : '') +
      '<form id="f-entrar" novalidate><div class="campo"><label for="e-email">E-mail</label>' +
      '<input id="e-email" type="email" autocomplete="email" inputmode="email" required></div>' +
      '<button class="btn bloco" type="submit">Entrar</button></form>' +
      '<p class="sutil" style="margin-top:.9rem">Ainda não tem conta? <a href="#/cadastro">Criar conta</a></p></div>' +
      '<p class="sutil">Para a equipe de teste: <button class="btn sec peq" id="btn-admin" type="button">Entrar como administrador</button></p>';
    document.getElementById('f-entrar').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var r = L.entrar(estado, document.getElementById('e-email').value);
      if (!r.ok) { telaEntrada(r.erro); document.getElementById('e-email').focus(); return; }
      salvar(); ir('/desafios');
    });
    document.getElementById('btn-admin').addEventListener('click', function () {
      L.entrarAdmin(estado); salvar(); ir('/admin');
    });
  }

  function telaCadastro(erroMsg, valores) {
    valores = valores || {};
    principal.className = '';
    principal.innerHTML =
      '<a class="voltar" href="#/">Voltar</a><div class="cartao"><h1>Criar conta</h1>' +
      '<p class="sutil">Use um apelido: ele aparece no ranking no lugar do seu nome.</p>' +
      (erroMsg ? '<div class="erro" role="alert">' + esc(erroMsg) + '</div>' : '') +
      '<form id="f-cad" novalidate><div class="campo"><label for="c-ap">Apelido <span class="dica">De 2 a 20 caracteres</span></label>' +
      '<input id="c-ap" type="text" maxlength="20" autocomplete="nickname" value="' + esc(valores.apelido) + '" required></div>' +
      '<div class="campo"><label for="c-em">E-mail <span class="dica">Usado só para você entrar de novo</span></label>' +
      '<input id="c-em" type="email" autocomplete="email" inputmode="email" value="' + esc(valores.email) + '" required></div>' +
      '<button class="btn bloco" type="submit">Criar conta</button></form></div>';
    document.getElementById('f-cad').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var v = { apelido: document.getElementById('c-ap').value, email: document.getElementById('c-em').value };
      var r = L.cadastrar(estado, v, S.vizinhos);
      if (!r.ok) { telaCadastro(r.erro, v); document.getElementById('c-ap').focus(); return; }
      salvar(); avisar('Conta criada. Bem-vindo, ' + r.user.apelido + '!'); ir('/desafios');
    });
  }

  function etiquetas(d) {
    return '<ul class="meta"><li class="etq">' + esc(d.tema) + '</li><li class="etq cinza">' + esc(d.dificuldade) + '</li><li class="etq ipe">' + d.pontos + ' pontos</li></ul>';
  }

  function telaDesafios(u) {
    principal.className = '';
    var tot = L.pontosDe(estado, u.id).total;
    var lista = L.desafiosAtivos(estado);
    var html = '<h1>Desafios da semana</h1>';
    if (!lista.length) {
      html += '<div class="vazio">Nenhum desafio disponível no momento. Volte em breve.</div>';
    }
    lista.forEach(function (d) {
      var p = L.participacao(estado, u.id, d.id);
      var sit = !p ? '' : (p.concluidoEm ? '<span class="etq">Concluído</span>' : '<span class="etq ipe">Em andamento</span>');
      html += '<a class="cartao link" href="#/desafio/' + d.id + '"><div class="linha"><div><h3>' + esc(d.titulo) + '</h3>' + etiquetas(d) +
        (sit ? '<p style="margin:.5rem 0 0">' + sit + '</p>' : '') + '</div>' + tampinha(d.tema, '+' + d.pontos) + '</div></a>';
    });
    principal.innerHTML = '<p class="sutil">Você tem <b>' + tot + '</b> pontos.</p>' + html;
  }

  function telaDesafio(u, id) {
    principal.className = '';
    var d = L.desafioPorId(estado, id);
    if (!d) { principal.innerHTML = '<a class="voltar" href="#/desafios">Voltar aos desafios</a><div class="vazio">Desafio não encontrado.</div>'; return; }
    var p = L.participacao(estado, u.id, id);
    var r = L.resposta(estado, u.id, id);
    var html = '<a class="voltar" href="#/desafios">Voltar aos desafios</a>' +
      '<div class="linha"><h1>' + esc(d.titulo) + '</h1>' + tampinha(d.tema, '+' + d.pontos) + '</div>' + etiquetas(d) +
      '<p style="margin-top:.9rem">' + esc(d.descricao) + '</p>';

    if (!p) {
      html += '<button class="btn bloco" id="btn-aceitar" type="button"' + (d.ativo ? '' : ' disabled') + '>Aceitar desafio</button>';
    } else if (!p.concluidoEm) {
      html += '<div class="cartao"><h2>Marcar como concluído</h2><form id="f-concluir" novalidate>' +
        '<div class="campo"><label for="obs">Observação <span class="dica">Opcional. Conte como foi (até 280 caracteres)</span></label>' +
        '<textarea id="obs" maxlength="280"></textarea></div>' +
        '<button class="btn bloco" type="submit">Concluí o desafio (+' + d.pontos + ' pontos)</button></form></div>';
    } else {
      html += '<div class="ok" role="status"><b>Desafio concluído</b> em ' + dataHora(p.concluidoEm) + '. Você ganhou ' + d.pontos + ' pontos.' +
        (p.observacao ? '<br>Sua observação: ' + esc(p.observacao) : '') + '</div>';
    }

    html += '<h2>Para saber mais</h2><div class="leitura">' + esc(d.conteudo) + '</div>';

    if (d.pergunta) {
      html += '<h2>Quiz rápido</h2>';
      if (r) {
        html += '<fieldset class="opcoes" disabled><legend>' + esc(d.pergunta.enunciado) + '</legend>' +
          d.pergunta.alternativas.map(function (a, i) {
            var c = i === d.pergunta.correta ? ' certa' : (i === r.escolha ? ' errada' : '');
            return '<div class="opcao' + c + '">' + (i === r.escolha ? '(sua resposta) ' : '') + (i === d.pergunta.correta ? '(correta) ' : '') + esc(a) + '</div>';
          }).join('') + '</fieldset>' +
          '<div class="' + (r.acertou ? 'ok' : 'erro') + '" role="status">' + (r.acertou ? 'Você acertou! +' + L.QUIZ_PONTOS + ' pontos. ' : 'Não foi dessa vez. ') + esc(d.pergunta.explicacao) + '</div>';
      } else {
        html += '<form id="f-quiz" novalidate><fieldset class="opcoes"><legend>' + esc(d.pergunta.enunciado) + '</legend>' +
          d.pergunta.alternativas.map(function (a, i) {
            return '<label class="opcao"><input type="radio" name="q" value="' + i + '"><span>' + esc(a) + '</span></label>';
          }).join('') + '</fieldset><div id="quiz-erro"></div>' +
          '<button class="btn bloco" type="submit">Responder (vale +' + L.QUIZ_PONTOS + ' pontos se acertar)</button></form>';
      }
    }
    principal.innerHTML = html;

    var ba = document.getElementById('btn-aceitar');
    if (ba) { ba.addEventListener('click', function () {
      var x = L.aceitar(estado, u.id, id); if (!x.ok) { avisar(x.erro); return; }
      salvar(); avisar('Desafio aceito. Boa!'); render();
    }); }
    var fc = document.getElementById('f-concluir');
    if (fc) { fc.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var x = L.concluir(estado, u.id, id, document.getElementById('obs').value);
      if (!x.ok) { avisar(x.erro); return; }
      salvar(); avisar('+' + x.pontos + ' pontos! Desafio concluído.'); render();
    }); }
    var fq = document.getElementById('f-quiz');
    if (fq) { fq.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var sel = fq.querySelector('input[name=q]:checked');
      var x = L.responder(estado, u.id, id, sel ? Number(sel.value) : null);
      if (!x.ok) { document.getElementById('quiz-erro').innerHTML = '<div class="erro" role="alert">' + esc(x.erro) + '</div>'; return; }
      salvar(); avisar(x.acertou ? 'Acertou! +' + x.pontos + ' pontos.' : 'Resposta registrada.'); render();
    }); }
  }

  function telaRanking(u, tipo) {
    principal.className = '';
    var lin = L.ranking(estado, tipo, S.vizinhos);
    var minha = lin.filter(function (l) { return l.userId === u.id; })[0];
    principal.innerHTML = '<h1>Ranking</h1>' +
      '<div class="abas-int"><a href="#/ranking"' + (tipo === 'semana' ? ' aria-current="page"' : '') + '>Esta semana</a>' +
      '<a href="#/ranking/geral"' + (tipo === 'geral' ? ' aria-current="page"' : '') + '>Geral</a></div>' +
      '<p class="sutil">' + (tipo === 'semana' ? 'Pontos dos últimos 7 dias.' : 'Todos os pontos acumulados.') +
      ' Participantes marcados como “exemplo” são fictícios, só para o ranking não ficar vazio.</p>' +
      (minha ? '<p><b>Você está em ' + minha.posicao + 'º lugar</b> com ' + minha.pontos + ' pontos.</p>' : '') +
      '<ol class="rank">' + lin.map(function (l) {
        return '<li' + (l.userId === u.id ? ' class="eu"' : '') + '><span class="pos">' + l.posicao + '</span><span class="nome">' + esc(l.apelido) +
          (l.userId === u.id ? ' (você)' : '') + (l.exemplo ? ' <span class="etq cinza">exemplo</span>' : '') + '</span><span class="pts">' + l.pontos + '</span></li>';
      }).join('') + '</ol>';
  }

  function telaPerfil(u) {
    principal.className = '';
    var pts = L.pontosDe(estado, u.id);
    var nv = L.nivelDe(pts.total);
    var hist = L.historico(estado, u.id);
    principal.innerHTML = '<h1>' + esc(u.apelido) + '</h1>' +
      '<div class="painel"><div><div class="grande">' + pts.total + '</div><div>pontos</div></div><div class="miolo">' +
      '<div class="nivel">Nível ' + esc(nv.atual.nome) + '</div><div class="barra" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + nv.pct + '" aria-label="Progresso para o próximo nível"><span style="width:' + nv.pct + '%"></span></div>' +
      '<p>' + (nv.proximo ? 'Faltam ' + nv.faltam + ' pontos para o nível ' + esc(nv.proximo.nome) + '.' : 'Você chegou ao nível máximo.') + '</p></div></div>' +
      '<p class="sutil">Desafios: ' + pts.desafios + ' pontos. Quiz: ' + pts.quiz + ' pontos.</p>' +
      '<h2>Histórico</h2>' +
      (hist.length ? hist.map(function (h) {
        return '<div class="cartao"><div class="linha"><div><h3>' + esc(h.desafio ? h.desafio.titulo : 'Desafio removido') + '</h3><p class="sutil" style="margin:0">Concluído em ' + dataHora(h.concluidoEm) +
          (h.quiz ? ' · Quiz: ' + (h.quiz.acertou ? 'acertou' : 'errou') : '') + '</p>' + (h.observacao ? '<p style="margin:.4rem 0 0">' + esc(h.observacao) + '</p>' : '') +
          '</div>' + (h.desafio ? tampinha(h.desafio.tema, '+' + h.desafio.pontos) : '') + '</div></div>';
      }).join('') : '<div class="vazio">Você ainda não concluiu nenhum desafio. <a href="#/desafios">Ver desafios</a></div>');
  }

  /* ---------- administração ---------- */
  function telaAdmin() {
    principal.className = 'largo';
    var linhas = estado.desafios.map(function (d) {
      return '<tr><td>' + esc(d.titulo) + '</td><td>' + esc(d.tema) + '</td><td>' + esc(d.dificuldade) + '</td><td>' + d.pontos + '</td><td>' +
        (d.ativo ? '<span class="etq">Ativo</span>' : '<span class="etq cinza">Inativo</span>') + '</td><td><a class="btn sec peq" href="#/admin/editar/' + d.id +
        '">Editar</a> <button class="btn sec peq" type="button" data-alt="' + d.id + '">' + (d.ativo ? 'Desativar' : 'Ativar') + '</button></td></tr>';
    }).join('');
    principal.innerHTML = '<div class="linha"><h1>Gerenciar desafios</h1><a class="btn" href="#/admin/novo">Novo desafio</a></div>' +
      '<div class="tabela-rolar"><table><thead><tr><th>Título</th><th>Tema</th><th>Dificuldade</th><th>Pontos</th><th>Situação</th><th>Ações</th></tr></thead><tbody>' + linhas + '</tbody></table></div>';
    Array.prototype.forEach.call(principal.querySelectorAll('[data-alt]'), function (b) {
      b.addEventListener('click', function () { L.alternarAtivo(estado, Number(b.getAttribute('data-alt'))); salvar(); render(); });
    });
  }

  function opcoesSel(lista, atual) {
    return lista.map(function (x) { return '<option' + (x === atual ? ' selected' : '') + '>' + esc(x) + '</option>'; }).join('');
  }

  function telaForm(id, erroMsg, dados) {
    principal.className = 'largo';
    var d = dados || (id ? L.desafioPorId(estado, id) : null) || { titulo: '', tema: S.temas[0], dificuldade: S.dificuldades[0], pontos: 10, descricao: '', conteudo: '', ativo: true, pergunta: { enunciado: '', alternativas: ['', '', ''], correta: 0, explicacao: '' } };
    var q = d.pergunta;
    principal.innerHTML = '<a class="voltar" href="#/admin">Voltar</a><h1>' + (id ? 'Editar desafio' : 'Novo desafio') + '</h1>' +
      (erroMsg ? '<div class="erro" role="alert">' + esc(erroMsg) + '</div>' : '') +
      '<form id="f-des" class="cartao" novalidate>' +
      '<div class="campo"><label for="a-tit">Título</label><input id="a-tit" type="text" maxlength="80" value="' + esc(d.titulo) + '"></div>' +
      '<div class="campo"><label for="a-des">Descrição do desafio</label><textarea id="a-des">' + esc(d.descricao) + '</textarea></div>' +
      '<div class="grade"><div><label for="a-tema">Tema</label><select id="a-tema">' + opcoesSel(S.temas, d.tema) + '</select></div>' +
      '<div><label for="a-dif">Dificuldade</label><select id="a-dif">' + opcoesSel(S.dificuldades, d.dificuldade) + '</select></div>' +
      '<div><label for="a-pts">Pontos</label><input id="a-pts" type="number" min="1" max="100" step="1" value="' + esc(d.pontos) + '"></div></div>' +
      '<div class="campo"><label for="a-con">Conteúdo educativo</label><textarea id="a-con">' + esc(d.conteudo) + '</textarea></div>' +
      '<h2>Pergunta do quiz</h2><div class="campo"><label for="a-q">Enunciado</label><input id="a-q" type="text" value="' + esc(q.enunciado) + '"></div>' +
      [0, 1, 2].map(function (i) {
        return '<div class="campo"><label for="a-alt' + i + '">Alternativa ' + (i + 1) + '</label><input id="a-alt' + i + '" type="text" value="' + esc(q.alternativas[i]) + '"></div>';
      }).join('') +
      '<div class="campo"><label for="a-ok">Alternativa correta</label><select id="a-ok">' +
      [0, 1, 2].map(function (i) { return '<option value="' + i + '"' + (Number(q.correta) === i ? ' selected' : '') + '>Alternativa ' + (i + 1) + '</option>'; }).join('') + '</select></div>' +
      '<div class="campo"><label for="a-exp">Explicação da resposta</label><input id="a-exp" type="text" value="' + esc(q.explicacao) + '"></div>' +
      '<div class="acoes"><button class="btn" type="submit">Salvar desafio</button><a class="btn sec" href="#/admin">Cancelar</a></div></form>';
    document.getElementById('f-des').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var v = function (i) { return document.getElementById(i).value; };
      var novo = {
        id: id || null, titulo: v('a-tit'), descricao: v('a-des'), tema: v('a-tema'), dificuldade: v('a-dif'), pontos: v('a-pts'), conteudo: v('a-con'),
        ativo: d.ativo !== false, semana: d.semana,
        pergunta: { enunciado: v('a-q'), alternativas: [v('a-alt0'), v('a-alt1'), v('a-alt2')], correta: Number(v('a-ok')), explicacao: v('a-exp') }
      };
      var r = L.salvarDesafio(estado, novo, S);
      if (!r.ok) { telaForm(id, r.erro, novo); return; }
      salvar(); avisar('Desafio salvo.'); ir('/admin');
    });
  }

  function baixar(nome, texto, tipo) {
    var blob = new Blob(['﻿' + texto], { type: tipo });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = nome;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  function telaMetricas() {
    principal.className = 'largo';
    var m = L.metricas(estado);
    function pc(v) { return v == null ? 'sem dados' : String(v).replace('.', ',') + '%'; }
    function nu(v) { return v == null ? 'sem dados' : String(v).replace('.', ','); }
    principal.innerHTML = '<h1>Métricas de uso</h1>' +
      '<p class="sutil">Contam apenas contas criadas neste navegador. O administrador e os participantes de exemplo ficam de fora.</p>' +
      '<div class="grade">' +
      '<div class="num"><b>' + m.usuarios + '</b><span>usuários cadastrados</span></div>' +
      '<div class="num"><b>' + m.ativos + '</b><span>usuários com ao menos 1 desafio concluído</span></div>' +
      '<div class="num"><b>' + m.aceitos + '</b><span>desafios aceitos</span></div>' +
      '<div class="num"><b>' + m.concluidos + '</b><span>desafios concluídos</span></div>' +
      '<div class="num"><b>' + pc(m.taxaConclusao) + '</b><span>taxa de conclusão (concluídos ÷ aceitos)</span></div>' +
      '<div class="num"><b>' + m.quizRespondidas + '</b><span>perguntas de quiz respondidas</span></div>' +
      '<div class="num"><b>' + pc(m.taxaAcerto) + '</b><span>taxa de acerto no quiz</span></div>' +
      '<div class="num"><b>' + nu(m.pontosMedios) + '</b><span>pontos médios por usuário</span></div></div>' +
      '<h2>Por desafio</h2><div class="tabela-rolar"><table><thead><tr><th>Desafio</th><th>Aceitos</th><th>Concluídos</th></tr></thead><tbody>' +
      m.porDesafio.map(function (x) { return '<tr><td>' + esc(x.titulo) + '</td><td>' + x.aceitos + '</td><td>' + x.concluidos + '</td></tr>'; }).join('') + '</tbody></table></div>' +
      '<h2>Exportar e reiniciar</h2><p class="sutil">Os arquivos exportados não trazem e-mails. Use-os para montar a tabela de resultados do relatório.</p>' +
      '<div class="acoes"><button class="btn sec" id="x-csv" type="button">Baixar CSV</button><button class="btn sec" id="x-json" type="button">Baixar JSON</button>' +
      '<button class="btn perigo" id="x-zero" type="button">Apagar todos os dados deste navegador</button></div>';
    document.getElementById('x-csv').addEventListener('click', function () { baixar('ecodesafio-uso.csv', L.exportarCSV(estado), 'text/csv;charset=utf-8'); });
    document.getElementById('x-json').addEventListener('click', function () { baixar('ecodesafio-dados.json', L.exportarJSON(estado), 'application/json'); });
    document.getElementById('x-zero').addEventListener('click', function () {
      if (window.confirm('Apagar todas as contas, participações e alterações feitas neste navegador? Isso não pode ser desfeito.')) {
        estado = L.novoEstado(S); salvar(); avisar('Dados apagados.'); ir('/');
      }
    });
  }

  /* ---------- roteador ---------- */
  function render() {
    var rota = (location.hash || '#/').slice(1) || '/';
    var u = L.usuarioAtual(estado);
    var partes = rota.split('/').filter(Boolean);
    moldura(rota);
    document.title = 'EcoDesafio (versão beta)';

    var publica = rota === '/' || rota === '/cadastro';
    if (!u && !publica) { ir('/'); return; }
    if (u && publica) { ir(u.admin ? '/admin' : '/desafios'); return; }
    if (u && u.admin !== (partes[0] === 'admin') && !publica) { ir(u.admin ? '/admin' : '/desafios'); return; }

    if (rota === '/') { telaEntrada(); }
    else if (rota === '/cadastro') { telaCadastro(); }
    else if (rota === '/desafios') { telaDesafios(u); }
    else if (partes[0] === 'desafio' && partes[1]) { telaDesafio(u, Number(partes[1])); }
    else if (partes[0] === 'ranking') { telaRanking(u, partes[1] === 'geral' ? 'geral' : 'semana'); }
    else if (rota === '/perfil') { telaPerfil(u); }
    else if (rota === '/admin') { telaAdmin(); }
    else if (rota === '/admin/novo') { telaForm(null); }
    else if (partes[0] === 'admin' && partes[1] === 'editar') { telaForm(Number(partes[2])); }
    else if (rota === '/admin/metricas') { telaMetricas(); }
    else { ir(u ? (u.admin ? '/admin' : '/desafios') : '/'); return; }
    window.scrollTo(0, 0);
  }

  window.addEventListener('hashchange', render);
  render();
})();
