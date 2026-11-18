'use strict';

const { getDb } = require('../src/firebase');
const alunos = require('../src/alunos');

/**
 * Dados fictícios para demonstração e capturas de tela.
 * Todos os nomes, turmas e datas são inventados.
 */
const ALUNOS_FICTICIOS = [
  { nome: 'Ana Beatriz Souza', turma: '1º Ano A', dataNascimento: '2009-03-14', ativo: true },
  { nome: 'Bruno Carvalho Lima', turma: '1º Ano A', dataNascimento: '2009-07-02', ativo: true },
  { nome: 'Camila Ferreira Rocha', turma: '1º Ano A', dataNascimento: '2010-01-25', ativo: false },
  { nome: 'Daniel Oliveira Santos', turma: '2º Ano B', dataNascimento: '2008-11-08', ativo: true },
  { nome: 'Eduarda Martins Alves', turma: '2º Ano B', dataNascimento: '2009-05-30', ativo: true },
  { nome: 'Felipe Nascimento Costa', turma: '2º Ano B', dataNascimento: '2008-09-17', ativo: false },
  { nome: 'Gabriela Ribeiro Pinto', turma: '3º Ano C', dataNascimento: '2008-02-21', ativo: true },
  { nome: 'Henrique Almeida Barros', turma: '3º Ano C', dataNascimento: '2007-12-05', ativo: true },
  { nome: 'Isabela Gomes Ramos', turma: '3º Ano C', dataNascimento: '2008-06-12', ativo: true },
  { nome: 'João Pedro Araújo Dias', turma: '1º Ano B', dataNascimento: '2009-10-19', ativo: true },
  { nome: 'Larissa Teixeira Melo', turma: '2º Ano B', dataNascimento: '2009-03-14', ativo: true },
];

/**
 * Remove todos os documentos da coleção "alunos".
 * Usa um batch (limite de 500 operações por lote).
 */
async function limparColecao() {
  const db = getDb();
  const snapshot = await db.collection(alunos.COLECAO).get();

  if (snapshot.empty) {
    return 0;
  }

  const lote = db.batch();
  snapshot.docs.forEach((doc) => lote.delete(doc.ref));
  await lote.commit();

  return snapshot.size;
}

async function main() {
  if (process.argv.includes('--limpar')) {
    const removidos = await limparColecao();
    console.log(`${removidos} documento(s) removido(s) da coleção "alunos".\n`);
  }

  console.log('Inserindo alunos fictícios...\n');

  for (const dados of ALUNOS_FICTICIOS) {
    const aluno = await alunos.criarAluno(dados);
    console.log(`- ${aluno.nome} (${aluno.turma}) -> ID: ${aluno.id}`);
  }

  console.log(`\n${ALUNOS_FICTICIOS.length} aluno(s) cadastrado(s) com sucesso.`);
}

main().catch((erro) => {
  console.error('Erro ao popular o banco de dados:', erro.message);
  process.exitCode = 1;
});
