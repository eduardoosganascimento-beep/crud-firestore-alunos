// Configuração do app Web no Firebase (projeto: crud-alunos-firestore)
// Esta chave identifica o app web no Firebase e pode ser usada no front-end.
// A segurança dos dados é controlada pelas Regras de Segurança do Firestore.
const firebaseConfig = {
  apiKey: "AIzaSyDaccWBPXCW30hiF1hhVrLxFviBIdDmUzM",
  authDomain: "crud-alunos-firestore.firebaseapp.com",
  projectId: "crud-alunos-firestore",
  storageBucket: "crud-alunos-firestore.firebasestorage.app",
  messagingSenderId: "130191054789",
  appId: "1:130191054789:web:2ceb22ad9fa86e17769dac"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const statusEl = document.getElementById("status");
const resumoEl = document.getElementById("resumo");
const corpoTabela = document.getElementById("corpo-tabela");
const contadorEl = document.getElementById("contador");
const filtroTurma = document.getElementById("filtro-turma");
const filtroData = document.getElementById("filtro-data");
const filtroInicio = document.getElementById("filtro-inicio");
const filtroFim = document.getElementById("filtro-fim");
const filtroAtivo = document.getElementById("filtro-ativo");
const filtroBusca = document.getElementById("filtro-busca");
const btnLimpar = document.getElementById("btn-limpar");
const btnAtualizar = document.getElementById("btn-atualizar");

let todosAlunos = [];
let unsubscribe = null;

function definirStatus(tipo, mensagem) {
  statusEl.className = "status " + tipo;
  statusEl.textContent = mensagem;
}

function escaparHtml(texto) {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatarDataBR(dataIso) {
  if (!dataIso || !/^\d{4}-\d{2}-\d{2}$/.test(dataIso)) {
    return dataIso || "-";
  }
  const [ano, mes, dia] = dataIso.split("-");
  return `${dia}/${mes}/${ano}`;
}

function montarAluno(id, dados) {
  return {
    id,
    nome: dados.nome || "",
    turma: dados.turma || "",
    dataNascimento: dados.dataNascimento || "",
    ativo: Boolean(dados.ativo)
  };
}

function compararAlunos(a, b) {
  return a.nome.localeCompare(b.nome, "pt-BR") || a.id.localeCompare(b.id);
}

function atualizarResumo(listaFiltrada) {
  const total = todosAlunos.length;
  const exibidos = listaFiltrada.length;
  const turmas = new Set(todosAlunos.map((a) => a.turma).filter(Boolean)).size;
  const ativos = todosAlunos.filter((a) => a.ativo).length;

  resumoEl.textContent =
    `Total no banco: ${total} aluno(s) · ${turmas} turma(s) · ` +
    `${ativos} ativo(s) · Exibindo: ${exibidos}`;
}

function atualizarOpcoesTurma() {
  const valorAtual = filtroTurma.value;
  const turmas = [...new Set(todosAlunos.map((a) => a.turma).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "pt-BR"));

  filtroTurma.innerHTML = '<option value="">Todas as turmas</option>';
  for (const turma of turmas) {
    const option = document.createElement("option");
    option.value = turma;
    option.textContent = turma;
    filtroTurma.appendChild(option);
  }

  if (turmas.includes(valorAtual)) {
    filtroTurma.value = valorAtual;
  }
}

function obterFiltros() {
  return {
    turma: filtroTurma.value,
    dataExata: filtroData.value,
    inicio: filtroInicio.value,
    fim: filtroFim.value,
    ativo: filtroAtivo.value,
    busca: filtroBusca.value.trim().toLowerCase()
  };
}

function aplicarFiltros() {
  const f = obterFiltros();
  let lista = [...todosAlunos];

  if (f.turma) {
    lista = lista.filter((a) => a.turma === f.turma);
  }

  if (f.dataExata) {
    lista = lista.filter((a) => a.dataNascimento === f.dataExata);
  }

  if (f.inicio) {
    lista = lista.filter((a) => a.dataNascimento >= f.inicio);
  }

  if (f.fim) {
    lista = lista.filter((a) => a.dataNascimento <= f.fim);
  }

  if (f.ativo === "true") {
    lista = lista.filter((a) => a.ativo === true);
  } else if (f.ativo === "false") {
    lista = lista.filter((a) => a.ativo === false);
  }

  if (f.busca) {
    lista = lista.filter(
      (a) =>
        a.nome.toLowerCase().includes(f.busca) ||
        a.id.toLowerCase().includes(f.busca)
    );
  }

  lista.sort(compararAlunos);
  renderizarTabela(lista);
  atualizarResumo(lista);
}

function renderizarTabela(lista) {
  contadorEl.textContent = `${lista.length} aluno(s)`;

  if (lista.length === 0) {
    corpoTabela.innerHTML =
      '<tr><td colspan="5" class="vazio">Nenhum aluno encontrado com os filtros atuais.</td></tr>';
    return;
  }

  corpoTabela.innerHTML = lista
    .map((aluno) => {
      const badgeClasse = aluno.ativo ? "ativo" : "inativo";
      const badgeTexto = aluno.ativo ? "Sim" : "Não";
      return `
        <tr>
          <td><code>${escaparHtml(aluno.id)}</code></td>
          <td>${escaparHtml(aluno.nome)}</td>
          <td>${escaparHtml(aluno.turma)}</td>
          <td>${escaparHtml(formatarDataBR(aluno.dataNascimento))} <small>(${escaparHtml(aluno.dataNascimento)})</small></td>
          <td><span class="badge ${badgeClasse}">${badgeTexto}</span></td>
        </tr>
      `;
    })
    .join("");
}

function tratarErro(erro) {
  console.error("Erro ao acessar o Firestore:", erro);
  let mensagem = "Erro ao conectar ao Firestore.";

  if (erro && erro.code === "permission-denied") {
    mensagem += " Permissão negada pelas regras de segurança do Firestore.";
  } else if (erro && erro.code === "unavailable") {
    mensagem += " Serviço indisponível. Verifique sua conexão com a internet.";
  } else if (erro && erro.message) {
    mensagem += " " + erro.message;
  }

  definirStatus("erro", mensagem);
  corpoTabela.innerHTML =
    '<tr><td colspan="5" class="vazio">Não foi possível carregar os dados. Confira a conexão e as regras do Firestore.</td></tr>';
}

function iniciarEscuta() {
  if (unsubscribe) {
    unsubscribe();
  }

  definirStatus("carregando", "Conectando ao Firestore...");

  unsubscribe = db.collection("alunos").onSnapshot(
    (snapshot) => {
      todosAlunos = snapshot.docs.map((doc) => montarAluno(doc.id, doc.data()));
      atualizarOpcoesTurma();
      aplicarFiltros();
      definirStatus("sucesso", "Conectado ao Firestore. Dados atualizados em tempo real.");
    },
    (erro) => {
      tratarErro(erro);
    }
  );
}

function limparFiltros() {
  filtroTurma.value = "";
  filtroData.value = "";
  filtroInicio.value = "";
  filtroFim.value = "";
  filtroAtivo.value = "";
  filtroBusca.value = "";
  aplicarFiltros();
}

[
  filtroTurma,
  filtroData,
  filtroInicio,
  filtroFim,
  filtroAtivo,
  filtroBusca
].forEach((el) => {
  el.addEventListener("input", aplicarFiltros);
  el.addEventListener("change", aplicarFiltros);
});

btnLimpar.addEventListener("click", limparFiltros);
btnAtualizar.addEventListener("click", iniciarEscuta);

iniciarEscuta();
