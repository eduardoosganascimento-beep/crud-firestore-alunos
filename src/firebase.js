'use strict';

const fs = require('node:fs');
const path = require('node:path');
const admin = require('firebase-admin');

const RAIZ_PROJETO = path.join(__dirname, '..');
const ARQUIVO_CHAVE_PADRAO = path.join(RAIZ_PROJETO, 'serviceAccountKey.json');
const ARQUIVO_ENV = path.join(RAIZ_PROJETO, '.env');

carregarEnv();

/**
 * Carrega o .env automaticamente (recurso nativo do Node.js 20.12+),
 * sem precisar da dependência "dotenv".
 */
function carregarEnv() {
  if (fs.existsSync(ARQUIVO_ENV) && typeof process.loadEnvFile === 'function') {
    process.loadEnvFile(ARQUIVO_ENV);
  }
}

/**
 * Monta a credencial da conta de serviço. A ordem de prioridade é:
 *   1. Variáveis FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY
 *   2. Caminho indicado em GOOGLE_APPLICATION_CREDENTIALS
 *   3. Arquivo serviceAccountKey.json na raiz do projeto
 */
function criarCredencial() {
  const {
    FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY,
    GOOGLE_APPLICATION_CREDENTIALS,
  } = process.env;

  if (FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY) {
    return admin.credential.cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      // No .env a chave fica em uma linha só, com "\n" no lugar das quebras.
      privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });
  }

  const caminhoChave = GOOGLE_APPLICATION_CREDENTIALS
    ? path.resolve(RAIZ_PROJETO, GOOGLE_APPLICATION_CREDENTIALS)
    : ARQUIVO_CHAVE_PADRAO;

  if (!fs.existsSync(caminhoChave)) {
    throw new Error(
      [
        'Arquivo de credenciais do Firebase não encontrado.',
        '',
        `Coloque o arquivo "serviceAccountKey.json" em: ${ARQUIVO_CHAVE_PADRAO}`,
        'ou configure as variáveis FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL',
        'e FIREBASE_PRIVATE_KEY em um arquivo .env (veja o .env.example).',
        '',
        'Passo a passo completo no README, seção "Configurando o Firebase".',
      ].join('\n')
    );
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(fs.readFileSync(caminhoChave, 'utf8'));
  } catch (erro) {
    throw new Error(`Não foi possível ler o arquivo ${caminhoChave}: ${erro.message}`);
  }

  return admin.credential.cert(serviceAccount);
}

/**
 * Inicializa o Firebase Admin SDK apenas uma vez e devolve a instância
 * do Firestore para ser usada pelos outros módulos.
 */
function getDb() {
  if (!admin.apps.length) {
    admin.initializeApp({ credential: criarCredencial() });
  }

  return admin.firestore();
}

module.exports = { getDb };
