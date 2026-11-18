'use strict';

const { getDb } = require('./firebase');
const {
  validarAluno,
  validarAtualizacao,
  validarTurma,
  validarDataNascimento,
} = require('./validacao');

const COLECAO = 'alunos';

function colecao() {
  return getDb().collection(COLECAO);
}

function montarAluno(id, dados) {
  return {
    id,
    nome: dados.nome,
    turma: dados.turma,
    dataNascimento: dados.dataNascimento,
    ativo: dados.ativo,
  };
}

function ordenarPorNome(lista) {
  return lista.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}

function ordenarPorDataNascimento(lista) {
  return lista.sort(
    (a, b) =>
      a.dataNascimento.localeCompare(b.dataNascimento) ||
      a.nome.localeCompare(b.nome, 'pt-BR')
  );
}

/**
 * Testa a conexão fazendo uma leitura simples na coleção.
 */
async function testarConexao() {
  await colecao().limit(1).get();
}

/**
 * CREATE - cadastra um aluno e devolve o documento criado (com o ID).
 */
async function criarAluno(dados) {
  const aluno = validarAluno(dados);
  const referencia = await colecao().add(aluno);

  return { id: referencia.id, ...aluno };
}

/**
 * READ - lista todos os alunos em ordem alfabética.
 * O orderBy em um único campo não precisa de índice composto.
 */
async function listarAlunos() {
  const snapshot = await colecao().orderBy('nome').get();

  return snapshot.docs.map((doc) => montarAluno(doc.id, doc.data()));
}

/**
 * READ - busca um aluno pelo ID. Devolve null quando não existe.
 */
async function buscarAlunoPorId(id) {
  if (!id || !id.trim()) {
    throw new Error('Informe o ID do aluno.');
  }

  const doc = await colecao().doc(id.trim()).get();

  if (!doc.exists) {
    return null;
  }

  return montarAluno(doc.id, doc.data());
}

/**
 * UPDATE - atualiza apenas os campos enviados. Devolve null quando o ID
 * não existe.
 */
async function atualizarAluno(id, dados) {
  if (!id || !id.trim()) {
    throw new Error('Informe o ID do aluno.');
  }

  const atualizacao = validarAtualizacao(dados);
  const referencia = colecao().doc(id.trim());
  const doc = await referencia.get();

  if (!doc.exists) {
    return null;
  }

  await referencia.update(atualizacao);

  return montarAluno(doc.id, { ...doc.data(), ...atualizacao });
}

/**
 * DELETE - exclui o aluno. Devolve null quando o ID não existe.
 */
async function excluirAluno(id) {
  const aluno = await buscarAlunoPorId(id);

  if (!aluno) {
    return null;
  }

  await colecao().doc(aluno.id).delete();

  return aluno;
}

/**
 * Consulta por turma (igualdade). A ordenação é feita em memória para não
 * exigir um índice composto (where + orderBy).
 */
async function listarPorTurma(turma) {
  const turmaValidada = validarTurma(turma);
  const snapshot = await colecao().where('turma', '==', turmaValidada).get();
  const lista = snapshot.docs.map((doc) => montarAluno(doc.id, doc.data()));

  return ordenarPorNome(lista);
}

/**
 * Consulta por data de nascimento exata (AAAA-MM-DD).
 */
async function listarPorDataNascimento(data) {
  const dataValidada = validarDataNascimento(data);
  const snapshot = await colecao()
    .where('dataNascimento', '==', dataValidada)
    .get();
  const lista = snapshot.docs.map((doc) => montarAluno(doc.id, doc.data()));

  return ordenarPorNome(lista);
}

/**
 * Consulta por período de nascimento (inclusive). Funciona porque a data é
 * uma string ISO (AAAA-MM-DD), que é ordenada corretamente de forma
 * lexicográfica.
 */
async function listarPorPeriodoNascimento(dataInicio, dataFim) {
  const inicio = validarDataNascimento(dataInicio);
  const fim = validarDataNascimento(dataFim);

  if (inicio > fim) {
    throw new Error('A data inicial deve ser anterior ou igual à data final.');
  }

  const snapshot = await colecao()
    .where('dataNascimento', '>=', inicio)
    .where('dataNascimento', '<=', fim)
    .get();
  const lista = snapshot.docs.map((doc) => montarAluno(doc.id, doc.data()));

  return ordenarPorDataNascimento(lista);
}

/**
 * Lista as turmas cadastradas (sem repetir), útil para o menu.
 */
async function listarTurmas() {
  const snapshot = await colecao().get();
  const turmas = new Set(snapshot.docs.map((doc) => doc.data().turma));

  return [...turmas].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

module.exports = {
  COLECAO,
  testarConexao,
  criarAluno,
  listarAlunos,
  buscarAlunoPorId,
  atualizarAluno,
  excluirAluno,
  listarPorTurma,
  listarPorDataNascimento,
  listarPorPeriodoNascimento,
  listarTurmas,
};
