# CRUD de Alunos com Firebase Firestore

Atividade prática de persistência de dados com **Node.js** e **Firebase Cloud Firestore** (Admin SDK). A aplicação roda no terminal, implementa as quatro operações CRUD e consultas por turma e por data de nascimento.

Todos os dados usados nas demonstrações são **fictícios**.

## Projeto Firebase (banco de dados)

- **Projeto:** `crud-alunos-firestore`
- **Console do projeto:** https://console.firebase.google.com/project/crud-alunos-firestore/overview
- **Banco de dados (Firestore):** https://console.firebase.google.com/project/crud-alunos-firestore/firestore/databases/-default-/data
- **Coleção:** `alunos`

> O acesso ao console exige login em uma conta Google com permissão no projeto.

## Requisitos da atividade e onde estão no projeto

| Requisito | Como é atendido |
|---|---|
| Criar projeto no Firebase e habilitar o Firestore | Passo a passo abaixo |
| Conexão com o Firebase Admin SDK | `src/firebase.js` |
| **CREATE** – cadastrar aluno | Menu `1` → `criarAluno()` |
| **READ** – listar alunos | Menu `2` → `listarAlunos()` |
| **READ** – buscar aluno por ID | Menu `3` → `buscarAlunoPorId()` |
| **UPDATE** – atualizar aluno | Menu `4` → `atualizarAluno()` |
| **DELETE** – excluir aluno | Menu `5` → `excluirAluno()` |
| Consulta por turma | Menu `6` → `listarPorTurma()` |
| Consulta por data de nascimento | Menu `7` → `listarPorDataNascimento()` |
| Consulta por período (extra) | Menu `8` → `listarPorPeriodoNascimento()` |
| Menu no terminal | `src/index.js` |

### Estrutura da coleção `alunos`

| Campo | Tipo | Exemplo |
|---|---|---|
| `nome` | string | `"Ana Beatriz Souza"` |
| `turma` | string | `"1º Ano A"` |
| `dataNascimento` | string (`AAAA-MM-DD`) | `"2009-03-14"` |
| `ativo` | boolean | `true` |

## Tecnologias

- [Node.js](https://nodejs.org/) 20 ou superior
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup) (`firebase-admin`)
- `node:readline/promises` para o menu no terminal
- `node:test` para os testes de validação (sem precisar de internet)

## Estrutura do projeto

```text
firestore-crud-alunos/
├── scripts/
│   └── seed.js            # insere dados fictícios (opcional)
├── src/
│   ├── alunos.js          # regras de acesso à coleção "alunos" (CRUD + consultas)
│   ├── firebase.js        # conexão com o Firebase Admin SDK
│   ├── index.js           # menu do terminal
│   └── validacao.js       # validação dos campos (sem dependência do Firebase)
├── test/
│   └── validacao.test.js  # testes automatizados das validações
├── .env.example           # modelo de configuração por variáveis de ambiente
├── .gitignore             # ignora serviceAccountKey.json e .env
├── package.json
└── README.md
```

## Configurando o Firebase

### 1. Criar o projeto

1. Acesse o [Console do Firebase](https://console.firebase.google.com/) e clique em **Adicionar projeto**.
2. Escolha um nome (ex.: `crud-alunos-seunome`), desative o Google Analytics (não é necessário) e clique em **Criar projeto**.

### 2. Criar o banco Firestore

1. No menu lateral, clique em **Build → Firestore Database**.
2. Clique em **Criar banco de dados**.
3. Escolha o local `southamerica-east1` (São Paulo) ou o mais próximo.
4. Selecione **Iniciar no modo de teste** e clique em **Criar**.

> O Admin SDK usa credenciais de conta de serviço e **ignora as regras de segurança** do Firestore. As regras de teste servem apenas durante o desenvolvimento. Nunca deixe regras abertas em produção.

### 3. Gerar a chave da conta de serviço

1. Clique na engrenagem ⚙️ → **Configurações do projeto** → aba **Contas de serviço**.
2. Clique em **Gerar nova chave privada** → **Gerar chave**.
3. Um arquivo `.json` será baixado.
4. Renomeie esse arquivo para **`serviceAccountKey.json`** e coloque na **raiz deste projeto**, junto do `package.json`.

O arquivo tem um formato parecido com este (os valores são secretos):

```json
{
  "type": "service_account",
  "project_id": "crud-alunos-xxxxx",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@crud-alunos-xxxxx.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

> **Nunca envie esse arquivo para o GitHub.** Ele já está no `.gitignore`.

### 4. Configuração alternativa com `.env` (opcional)

Se preferir não deixar o JSON na pasta, copie `.env.example` para `.env` e preencha as variáveis:

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# Linux / macOS
cp .env.example .env
```

Depois preencha:

```env
FIREBASE_PROJECT_ID=seu-projeto-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@seu-projeto-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSUA_CHAVE\n-----END PRIVATE KEY-----\n"
```

Se as variáveis estiverem preenchidas, elas têm prioridade sobre o `serviceAccountKey.json`. O `.env` também está no `.gitignore`.

## Instalação e execução

Pré-requisito: Node.js 20 ou superior instalado (`node --version`).

```bash
# 1. Entrar na pasta do projeto
cd firestore-crud-alunos

# 2. Instalar as dependências
npm install

# 3. (Opcional) Cadastrar alunos fictícios para testar e tirar prints
npm run seed

# 4. Iniciar a aplicação
npm start
```

Se tudo estiver configurado, o terminal mostra:

```text
Conectando ao Firestore... OK!
```

O menu fica assim:

```text
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
============================================
```

### Scripts disponíveis

| Comando | O que faz |
|---|---|
| `npm start` | Abre o menu no terminal |
| `npm run seed` | Insere 11 alunos fictícios |
| `npm run seed:limpar` | Apaga todos os alunos e insere os fictícios novamente |
| `npm test` | Executa os testes de validação (não acessa o Firebase) |

## Como as consultas funcionam

- **Por turma:** usa `where('turma', '==', turma)`.
- **Por data exata:** usa `where('dataNascimento', '==', data)`.
- **Por período:** usa `where('dataNascimento', '>=', inicio)` e `<=`, o que funciona porque a data é uma string ISO (`AAAA-MM-DD`) e é ordenada corretamente como texto.
- A ordenação dos resultados é feita em memória (`localeCompare`) para **não exigir índices compostos** no Firestore. Assim a atividade roda sem configuração extra no console.

## Roteiro para as capturas de tela

Sugestão de 9 capturas para entregar. Salve em uma pasta `docs/prints/` (ou anexe direto no Google Sala de Aula).

1. **Firestore criado** – Console do Firebase mostrando o banco e a coleção `alunos` com os documentos.
2. **Conexão pelo Admin SDK** – terminal com `Conectando ao Firestore... OK!` e o menu.
3. **CREATE** – preenchimento de um novo aluno e a mensagem de sucesso com o ID.
4. **READ (lista)** – saída do menu `2` com todos os alunos em tabela.
5. **READ (por ID)** – saída do menu `3` para um aluno específico.
6. **UPDATE** – dados atuais, alteração de um campo e resultado atualizado.
7. **DELETE** – confirmação e mensagem de exclusão, seguida de uma listagem provando que o aluno saiu.
8. **Consulta por turma** – menu `6` mostrando as turmas e o resultado filtrado.
9. **Consulta por data** – menu `7` com uma data exata e/ou menu `8` com um período.

Dica: use os alunos do `npm run seed` para manter os mesmos nomes e datas nos prints e no vídeo, se houver.

## Publicando no GitHub

Crie um repositório **vazio** em [github.com/new](https://github.com/new) (sem README, sem .gitignore) e depois rode:

```bash
cd firestore-crud-alunos

git init
git add .
git status
# Confirme que "serviceAccountKey.json" e ".env" NÃO aparecem na lista

git commit -m "Atividade prática: CRUD de alunos com Firestore"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/firestore-crud-alunos.git
git push -u origin main
```

Depois envie o link do repositório no Google Sala de Aula.

## Segurança da chave

- O `.gitignore` já bloqueia `serviceAccountKey.json` e `.env`.
- Rode `git status` **antes** do primeiro commit para conferir.
- Se a chave for commitada por engano:
  1. No Firebase, acesse **Configurações do projeto → Contas de serviço** e **exclua** a chave comprometida.
  2. Gere uma nova chave.
  3. Rode `git rm --cached serviceAccountKey.json` e faça um novo commit.
  4. Se o repositório já foi enviado, o histórico ainda contém o arquivo: o ideal é recriar o repositório sem a chave após revogá-la.

## Erros comuns

| Mensagem | Causa provável | Solução |
|---|---|---|
| `Arquivo de credenciais do Firebase não encontrado` | JSON fora do lugar ou com outro nome | Coloque `serviceAccountKey.json` na raiz do projeto |
| `Could not load the default credentials` | Nenhuma credencial configurada | Use o JSON ou preencha o `.env` |
| `Cannot find module 'firebase-admin'` | Dependências não instaladas | Rode `npm install` |
| `5 NOT_FOUND` / `PERMISSION_DENIED` | Firestore não criado ou projeto errado | Confira o projeto e crie o banco Firestore |
| `Failed to parse private key` / `DECODER routines` | Chave privada com `\n` quebrado no `.env` | Mantenha a chave entre aspas e use `\n` nas quebras |
| `ENOTFOUND` / timeout | Sem internet, proxy ou firewall | Verifique a conexão |
| Consulta não retorna nada | Turma escrita diferente ou data fora do formato | Copie exatamente uma turma listada e use `AAAA-MM-DD` |

## Checklist de entrega

- [ ] Projeto criado no Firebase e Firestore habilitado
- [ ] `serviceAccountKey.json` configurado localmente
- [ ] `npm install` e `npm start` funcionando
- [ ] CREATE, READ, UPDATE e DELETE testados
- [ ] Consulta por turma e por data de nascimento testadas
- [ ] Prints das operações salvos
- [ ] `serviceAccountKey.json` e `.env` fora do repositório
- [ ] Repositório publicado no GitHub
- [ ] Link enviado no Google Sala de Aula

## Observação

Os dados de alunos usados no `seed.js` são totalmente fictícios. Nenhuma informação real de estudante é utilizada no projeto.
