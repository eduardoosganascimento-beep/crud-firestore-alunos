'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  validarAluno,
  validarAtualizacao,
  validarDataNascimento,
} = require('../src/validacao');

test('aceita um aluno válido e normaliza os espaços', () => {
  const aluno = validarAluno({
    nome: '  Ana   Beatriz Souza ',
    turma: ' 1º Ano A ',
    dataNascimento: '2009-03-14',
    ativo: true,
  });

  assert.deepEqual(aluno, {
    nome: 'Ana Beatriz Souza',
    turma: '1º Ano A',
    dataNascimento: '2009-03-14',
    ativo: true,
  });
});

test('exige todos os campos no cadastro', () => {
  assert.throws(
    () => validarAluno({ nome: 'Ana Beatriz' }),
    /Campo obrigatório ausente/
  );
});

test('rejeita nome vazio ou muito curto', () => {
  assert.throws(
    () =>
      validarAluno({
        nome: '   ',
        turma: '1º Ano A',
        dataNascimento: '2009-03-14',
        ativo: true,
      }),
    /nome é obrigatório/i
  );

  assert.throws(
    () =>
      validarAluno({
        nome: 'Li',
        turma: '1º Ano A',
        dataNascimento: '2009-03-14',
        ativo: true,
      }),
    /pelo menos 3 caracteres/
  );
});

test('rejeita data fora do formato AAAA-MM-DD', () => {
  assert.throws(() => validarDataNascimento('14/03/2009'), /AAAA-MM-DD/);
  assert.throws(() => validarDataNascimento('2009-3-14'), /AAAA-MM-DD/);
});

test('rejeita data inexistente', () => {
  assert.throws(() => validarDataNascimento('2009-02-30'), /Data inválida/);
});

test('rejeita data de nascimento no futuro', () => {
  assert.throws(() => validarDataNascimento('2999-01-01'), /futuro/);
});

test('rejeita o campo ativo que não seja booleano', () => {
  assert.throws(() => validarAluno({
    nome: 'Ana Beatriz',
    turma: '1º Ano A',
    dataNascimento: '2009-03-14',
    ativo: 'sim',
  }), /true \(ativo\) ou false \(inativo\)/);
});

test('atualização parcial aceita um único campo', () => {
  assert.deepEqual(validarAtualizacao({ turma: '2º Ano B' }), {
    turma: '2º Ano B',
  });
});

test('atualização vazia é rejeitada', () => {
  assert.throws(() => validarAtualizacao({}), /ao menos um campo/);
});

test('atualização com campo desconhecido é rejeitada', () => {
  assert.throws(
    () => validarAtualizacao({ email: 'ana@exemplo.com' }),
    /Campo\(s\) inválido\(s\)/
  );
});
