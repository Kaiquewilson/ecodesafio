# EcoDesafio (versão beta)

Plataforma de desafios semanais de sustentabilidade para a comunidade, com pontos, ranking, conteúdo educativo e quiz.

Projeto desenvolvido para a disciplina **Projeto e Desenvolvimento I** do curso de Ciência da Computação (UNIP EaD), com o tema *Tecnologia e Sustentabilidade na Comunidade*.

**Autor:** Kaique Wilson Pereira da Silva

## O que o beta faz

- Cadastro e entrada apenas com e-mail e apelido
- Lista de desafios sustentáveis, com dificuldade e pontuação
- Aceitar e concluir desafios, com observação opcional
- Conteúdo educativo e quiz sobre cada desafio
- Ranking da comunidade e níveis (Semente, Muda, Árvore e Mata)
- Painel administrativo com métricas de uso

## Como usar

Abra a página publicada no GitHub Pages ou, no computador, abra o arquivo `index.html` no navegador.

## Observações

- Os dados ficam apenas no navegador de quem usa (localStorage). Não há servidor nem banco de dados.
- Os vizinhos do ranking marcados como "exemplo" são fictícios.
- Esta é uma versão beta para testes; a versão final proposta no trabalho usa Python e Django.

## Tecnologias

HTML, CSS e JavaScript, sem bibliotecas externas. As regras de negócio ficam em `js/logic.js` e têm testes automatizados em `tests/`.
