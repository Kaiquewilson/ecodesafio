/* EcoDesafio beta - dados de exemplo (conteúdo de demonstração). */
(function (root) {
  'use strict';

  var SEED = {
    temas: ['Água', 'Energia', 'Reciclagem', 'Consumo'],
    dificuldades: ['Fácil', 'Média', 'Difícil'],

    desafios: [
      {
        id: 1, titulo: 'Separe o lixo reciclável', tema: 'Reciclagem', dificuldade: 'Fácil', pontos: 10,
        semana: 'Semana 1', ativo: true,
        descricao: 'Hoje, separe o que é reciclável do restante do lixo da sua casa: papel, plástico, metal e vidro de um lado; restos de comida do outro.',
        conteudo: 'Separar em casa é o primeiro passo da coleta seletiva. Materiais limpos e secos têm mais chance de ser reaproveitados, então basta um enxágue rápido nas embalagens. Comece com dois recipientes: um para os recicláveis e outro para o resto. Cada cidade tem regras próprias de coleta, por isso vale conferir os dias e os pontos de entrega do seu bairro.',
        pergunta: {
          enunciado: 'Qual cuidado ajuda uma embalagem a ser reaproveitada?',
          alternativas: ['Deixá-la limpa e seca', 'Misturá-la com restos de comida', 'Guardá-la dentro do lixo orgânico'],
          correta: 0,
          explicacao: 'Embalagens limpas e secas são mais fáceis de reaproveitar.'
        }
      },
      {
        id: 2, titulo: 'Tome um banho de 5 minutos', tema: 'Água', dificuldade: 'Fácil', pontos: 10,
        semana: 'Semana 1', ativo: true,
        descricao: 'Tome um banho de até 5 minutos e feche o registro enquanto se ensaboa.',
        conteudo: 'O banho é uma das maiores partes do consumo de água de uma casa. Fechar o registro ao se ensaboar e encurtar o tempo sob o chuveiro reduz o uso de água e, com chuveiro elétrico, também o de energia. Na primeira vez, use o cronômetro do celular como lembrete.',
        pergunta: {
          enunciado: 'Qual atitude economiza água e energia no banho?',
          alternativas: ['Deixar a água correndo enquanto se ensaboa', 'Fechar o registro ao se ensaboar', 'Aumentar a temperatura para acabar mais rápido'],
          correta: 1,
          explicacao: 'Com o registro fechado, a água não escorre enquanto você se ensaboa.'
        }
      },
      {
        id: 3, titulo: 'Leve sua sacola ao mercado', tema: 'Consumo', dificuldade: 'Fácil', pontos: 10,
        semana: 'Semana 1', ativo: true,
        descricao: 'Leve uma sacola reutilizável nas compras de hoje e recuse as sacolas descartáveis.',
        conteudo: 'Sacolas de uso único costumam ser usadas por poucos minutos, mas demoram muito para se decompor. O esquecimento é o principal motivo de não levar a própria sacola: deixe uma dobrada na bolsa, na mochila ou perto da porta de casa.',
        pergunta: {
          enunciado: 'O que ajuda a não esquecer a sacola reutilizável?',
          alternativas: ['Pedir várias sacolas descartáveis no caixa', 'Comprar uma sacola nova a cada ida ao mercado', 'Deixá-la dobrada na bolsa ou perto da porta'],
          correta: 2,
          explicacao: 'Deixar a sacola à vista ou sempre junto de você evita o esquecimento.'
        }
      },
      {
        id: 4, titulo: 'Apague a luz ao sair do cômodo', tema: 'Energia', dificuldade: 'Média', pontos: 20,
        semana: 'Semana 1', ativo: true,
        descricao: 'Por três dias, apague a luz sempre que sair de um cômodo e tire da tomada o que não estiver em uso.',
        conteudo: 'Luz acesa em cômodo vazio e aparelhos em modo de espera gastam energia sem trazer benefício. O hábito leva alguns dias para se firmar: associe o gesto de apagar a luz ao de sair do cômodo. Lâmpadas de LED consomem menos energia que as incandescentes.',
        pergunta: {
          enunciado: 'O que ajuda a criar o hábito de apagar a luz?',
          alternativas: ['Associar o gesto ao de sair do cômodo', 'Esperar que alguém lembre você', 'Apagar apenas quando for dormir'],
          correta: 0,
          explicacao: 'Ligar o gesto a uma ação que você já faz torna o hábito automático mais rápido.'
        }
      },
      {
        id: 5, titulo: 'Passe um dia sem descartáveis', tema: 'Consumo', dificuldade: 'Média', pontos: 20,
        semana: 'Semana 1', ativo: true,
        descricao: 'Passe um dia sem usar copos, pratos, talheres ou canudos descartáveis.',
        conteudo: 'Itens descartáveis são usados por minutos e viram lixo por muito mais tempo. Levar uma garrafa ou caneca própria resolve boa parte do dia: água, café e suco já têm onde ficar. Se for comer fora, leve também talheres reutilizáveis na bolsa.',
        pergunta: {
          enunciado: 'Qual item resolve boa parte do uso de descartáveis no dia?',
          alternativas: ['Copos de plástico em maior quantidade', 'Garrafa ou caneca própria', 'Canudos descartáveis de papel'],
          correta: 1,
          explicacao: 'Uma garrafa ou caneca própria substitui vários copos descartáveis.'
        }
      },
      {
        id: 6, titulo: 'Dê novo uso a uma embalagem', tema: 'Reciclagem', dificuldade: 'Difícil', pontos: 30,
        semana: 'Semana 1', ativo: true,
        descricao: 'Dê um novo uso criativo a uma embalagem que iria para o lixo e conte, na observação, como você fez.',
        conteudo: 'Reaproveitar vem antes de reciclar: dar outro uso a um pote, uma garrafa ou uma caixa evita que ela vire lixo logo. Ideias simples: pote de vidro como porta-mantimentos, garrafa PET como vaso ou regador, caixa de papelão como organizador. Conte como você fez; o seu método pode inspirar outra pessoa.',
        pergunta: {
          enunciado: 'Qual opção é um exemplo de reaproveitamento?',
          alternativas: ['Jogar o pote no lixo comum', 'Comprar um pote novo toda semana', 'Usar um pote de vidro para guardar mantimentos'],
          correta: 2,
          explicacao: 'Dar outro uso ao pote evita que ele vire lixo logo.'
        }
      }
    ],

    /* Participantes de exemplo, só para o ranking não ficar vazio. */
    vizinhos: [
      { apelido: 'Folha Verde', semana: 40, total: 90 },
      { apelido: 'Rio Limpo', semana: 30, total: 70 },
      { apelido: 'Ipê Amarelo', semana: 20, total: 55 },
      { apelido: 'Pé de Manga', semana: 10, total: 35 },
      { apelido: 'Cerrado', semana: 0, total: 20 }
    ]
  };

  if (typeof module !== 'undefined' && module.exports) { module.exports = SEED; }
  else { root.EcoSeed = SEED; }
})(typeof window !== 'undefined' ? window : globalThis);
