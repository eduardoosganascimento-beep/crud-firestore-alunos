'use strict';

/**
 * Validações dos dados do aluno. Este módulo não depende do Firebase,
 * então pode ser testado sozinho (npm test).
 */

const CAMPOS = ['nome', 'turma', 'dataNascimento', 'ativo'];
const REGEX_DATA = /^\d{4}-\d{2}-\d{2}$/;

function validarNome(valor) {
  if (typeof valor !== 'string' || !valor.trim()) {
    throw new Error('O nome é obrigatório.');
  }

  const nome = valor.trim().replace(/\s+/g, ' ');

  if (nome.length < 3) {
    throw new Error('O nome deve ter pelo menos 3 caracteres.');
  }

  return nome;
}

function validarTurma(valor) {
  if (typeof valor !== 'string' || !valor.trim()) {
    throw new Error('A turma é obrigatória.');
  }

  return valor.trim().replace(/\s+/g, ' ');
}

/**
 * Aceita somente strings no formato AAAA-MM-DD que representem uma data real
 * e que não estejam no futuro.
 */
function validarDataNascimento(valor) {
  if (typeof valor !== 'string' || !REGEX_DATA.test(valor.trim())) {
    throw new Error('A data de nascimento deve estar no formato AAAA-MM-DD (ex.: 2009-03-15).');
  }

  const data = valor.trim();
  const dataConvertida = new Date(`${data}T00:00:00.000Z`);

  if (Number.isNaN(dataConvertida.getTime()) || dataConvertida.toISOString().slice(0, 10) !== data) {
    throw new Error(`Data inválida: ${data}. Confira o dia e o mês.`);
  }

  if (dataConvertida.getTime() > Date.now()) {
    throw new Error('A data de nascimento não pode estar no futuro.');
  }

  return data;
}

function validarAtivo(valor) {
  if (typeof valor !== 'boolean') {
    throw new Error('O campo "ativo" deve ser true (ativo) ou false (inativo).');
  }

  return valor;
}

const VALIDADORES = {
  nome: validarNome,
  turma: validarTurma,
  dataNascimento: validarDataNascimento,
  ativo: validarAtivo,
};

/**
 * Valida um aluno completo (CREATE). Exige os quatro campos da atividade.
 */
function validarAluno(dados) {
  if (!dados || typeof dados !== 'object') {
    throw new Error('Dados do aluno inválidos.');
  }

  const aluno = {};

  for (const campo of CAMPOS) {
    if (!(campo in dados)) {
      throw new Error(`Campo obrigatório ausente: ${campo}.`);
    }

    aluno[campo] = VALIDADORES[campo](dados[campo]);
  }

  return aluno;
}

/**
 * Valida uma atualização parcial (UPDATE). Aceita apenas campos conhecidos
 * e exige pelo menos um campo.
 */
function validarAtualizacao(dados) {
  if (!dados || typeof dados !== 'object') {
    throw new Error('Dados da atualização inválidos.');
  }

  const campos = Object.keys(dados);

  if (campos.length === 0) {
    throw new Error('Informe ao menos um campo para atualizar.');
  }

  const desconhecidos = campos.filter((campo) => !CAMPOS.includes(campo));

  if (desconhecidos.length > 0) {
    throw new Error(`Campo(s) inválido(s) para atualização: ${desconhecidos.join(', ')}.`);
  }

  const atualizacao = {};

  for (const campo of campos) {
    atualizacao[campo] = VALIDADORES[campo](dados[campo]);
  }

  return atualizacao;
}

module.exports = {
  CAMPOS,
  validarAluno,
  validarAtualizacao,
  validarNome,
  validarTurma,
  validarDataNascimento,
  validarAtivo,
};
