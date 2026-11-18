'use strict';

const readline = require('node:readline/promises');
const alunos = require('./alunos');

let rl = null;

function criarInterface() {
  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.on('SIGINT', () => {
    console.log('\nAté logo!');
    rl.close();
    process.exit(0);
  });

  return rl;
}

function obterInterface() {
  if (!rl || rl.closed) {
    criarInterface();
  }

  return rl;
}

function perguntar(texto) {
  return obterInterface().question(texto);
}

async function perguntarComPadrao(texto, padrao) {
  const resposta = (await perguntar(`${texto} [${padrao}]: `)).trim();

  return resposta || String(padrao);
}

async function perguntarAtivo(padrao) {
  const dica = padrao ? 'S/n' : 's/N';
  const resposta = (await perguntar(`Ativo? (${dica}): `)).trim().toLowerCase();

  if (!resposta) {
    return padrao;
  }

  if (['s', 'sim', 'y', 'yes'].includes(resposta)) {
    return true;
  }

  if (['n', 'nao', 'não', 'no'].includes(resposta)) {
    return false;
  }

  throw new Error('Resposta inválida. Digite "s" para sim ou "n" para não.');
}

async function confirmar(texto) {
  const resposta = (await perguntar(`${texto} (s/N): `)).trim().toLowerCase();

  return ['s', 'sim', 'y', 'yes'].includes(resposta);
}

function mostrarAlunos(lista) {
  if (!lista || lista.length === 0) {
    console.log('Nenhum aluno encontrado.\n');
    return;
  }

  console.table(
    lista.map((aluno) => ({
      ID: aluno.id,
      Nome: aluno.nome,
      Turma: aluno.turma,
      'Data de nascimento': aluno.dataNascimento,
      Ativo: aluno.ativo ? 'Sim' : 'Não',
    }))
  );

  console.log(`Total: ${lista.length} aluno(s).\n`);
}

async function cadastrarAluno() {
  console.log('--- Cadastrar aluno (CREATE) ---\n');

  const nome = await perguntar('Nome: ');
  const turma = await perguntar('Turma: ');
  const dataNascimento = await perguntar('Data de nascimento (AAAA-MM-DD): ');
  const ativo = await perguntarAtivo(true);

  const aluno = await alunos.criarAluno({ nome, turma, dataNascimento, ativo });

  console.log('\nAluno cadastrado com sucesso!\n');
  mostrarAlunos([aluno]);
}

async function listarAlunos() {
  console.log('--- Listar alunos (READ) ---\n');

  const lista = await alunos.listarAlunos();

  mostrarAlunos(lista);
}

async function buscarAluno() {
  console.log('--- Buscar aluno por ID (READ) ---\n');

  const id = await perguntar('ID do aluno: ');
  const aluno = await alunos.buscarAlunoPorId(id);

  if (!aluno) {
    console.log('Aluno não encontrado.\n');
    return;
  }

  mostrarAlunos([aluno]);
}

async function atualizarAluno() {
  console.log('--- Atualizar aluno (UPDATE) ---\n');

  const id = await perguntar('ID do aluno: ');
  const atual = await alunos.buscarAlunoPorId(id);

  if (!atual) {
    console.log('Aluno não encontrado.\n');
    return;
  }

  console.log('\nDados atuais:');
  mostrarAlunos([atual]);
  console.log('Pressione Enter para manter o valor atual.\n');

  const nome = await perguntarComPadrao('Nome', atual.nome);
  const turma = await perguntarComPadrao('Turma', atual.turma);
  const dataNascimento = await perguntarComPadrao(
    'Data de nascimento',
    atual.dataNascimento
  );
  const ativo = await perguntarAtivo(atual.ativo);

  const alunoAtualizado = await alunos.atualizarAluno(id, {
    nome,
    turma,
    dataNascimento,
    ativo,
  });

  console.log('\nAluno atualizado com sucesso!\n');
  mostrarAlunos([alunoAtualizado]);
}

async function excluirAluno() {
  console.log('--- Excluir aluno (DELETE) ---\n');

  const id = await perguntar('ID do aluno: ');
  const aluno = await alunos.buscarAlunoPorId(id);

  if (!aluno) {
    console.log('Aluno não encontrado.\n');
    return;
  }

  mostrarAlunos([aluno]);

  if (!(await confirmar('Confirma a exclusão deste aluno?'))) {
    console.log('Exclusão cancelada.\n');
    return;
  }

  await alunos.excluirAluno(id);

  console.log('Aluno excluído com sucesso.\n');
}

async function consultarPorTurma() {
  console.log('--- Consultar por turma ---\n');

  const turmas = await alunos.listarTurmas();

  if (turmas.length === 0) {
    console.log('Nenhum aluno cadastrado ainda.\n');
    return;
  }

  console.log(`Turmas disponíveis: ${turmas.join(' | ')}\n`);

  const turma = await perguntar('Turma: ');
  const lista = await alunos.listarPorTurma(turma);

  mostrarAlunos(lista);
}

async function consultarPorDataNascimento() {
  console.log('--- Consultar por data de nascimento ---\n');

  const data = await perguntar('Data de nascimento (AAAA-MM-DD): ');
  const lista = await alunos.listarPorDataNascimento(data);

  mostrarAlunos(lista);
}

async function consultarPorPeriodo() {
  console.log('--- Consultar por período de nascimento ---\n');

  const inicio = await perguntar('Data inicial (AAAA-MM-DD): ');
  const fim = await perguntar('Data final (AAAA-MM-DD): ');
  const lista = await alunos.listarPorPeriodoNascimento(inicio, fim);

  mostrarAlunos(lista);
}

function exibirMenu() {
  console.log(`
============================================
  CRUD de Alunos - Firebase Firestore
============================================
  1 - Cadastrar aluno               (CREATE)
  2 - Listar todos os alunos        (READ)
  3 - Buscar aluno por ID           (READ)
  4 - Atualizar aluno               (UPDATE)
  5 - Excluir aluno                 (DELETE)
  6 - Consultar alunos por turma
  7 - Consultar por data de nascimento
  8 - Consultar por período de nascimento
  0 - Sair
============================================`);
}

async function main() {
  process.stdout.write('Conectando ao Firestore... ');
  await alunos.testarConexao();
  console.log('OK!\n');

  criarInterface();

  let executando = true;

  while (executando) {
    exibirMenu();

    const opcao = (await perguntar('Escolha uma opção: ')).trim();
    console.log('');

    try {
      switch (opcao) {
        case '1':
          await cadastrarAluno();
          break;
        case '2':
          await listarAlunos();
          break;
        case '3':
          await buscarAluno();
          break;
        case '4':
          await atualizarAluno();
          break;
        case '5':
          await excluirAluno();
          break;
        case '6':
          await consultarPorTurma();
          break;
        case '7':
          await consultarPorDataNascimento();
          break;
        case '8':
          await consultarPorPeriodo();
          break;
        case '0':
          executando = false;
          console.log('Até logo!');
          break;
        default:
          console.log('Opção inválida. Digite um número do menu.\n');
      }
    } catch (erro) {
      console.error(`Erro: ${erro.message}\n`);
    }
  }
}

main()
  .catch((erro) => {
    console.error('\nNão foi possível iniciar a aplicação.');
    console.error(erro.message);
    process.exitCode = 1;
  })
  .finally(() => {
    rl.close();
  });
