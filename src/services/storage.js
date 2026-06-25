// src/services/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const ANIMAIS_KEY = '@faciliagro:animais';
const FILA_SYNC_KEY = '@faciliagro:fila_sync'; // fila de alterações pendentes de sincronização
const CONFIG_KEY = '@faciliagro:config'; // ex: preço da arroba do dia

// ---------- ANIMAIS ----------

export async function getAnimais() {
  try {
    const json = await AsyncStorage.getItem(ANIMAIS_KEY);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    console.error('Erro ao ler animais do storage', e);
    return [];
  }
}

export async function salvarAnimais(lista) {
  try {
    await AsyncStorage.setItem(ANIMAIS_KEY, JSON.stringify(lista));
  } catch (e) {
    console.error('Erro ao salvar animais no storage', e);
  }
}

export async function adicionarAnimal(animal) {
  const lista = await getAnimais();
  const novo = {
    ...animal,
    id: animal.id || `${Date.now()}`,
    atualizadoEm: new Date().toISOString(),
  };
  const novaLista = [...lista, novo];
  await salvarAnimais(novaLista);
  await adicionarNaFilaSync({ tipo: 'CRIAR', animal: novo });
  return novo;
}

export async function atualizarAnimal(id, dadosAtualizados) {
  const lista = await getAnimais();
  const novaLista = lista.map((a) =>
    a.id === id ? { ...a, ...dadosAtualizados, atualizadoEm: new Date().toISOString() } : a
  );
  await salvarAnimais(novaLista);
  const atualizado = novaLista.find((a) => a.id === id);
  await adicionarNaFilaSync({ tipo: 'ATUALIZAR', animal: atualizado });
  return atualizado;
}

export async function removerAnimal(id) {
  const lista = await getAnimais();
  const novaLista = lista.filter((a) => a.id !== id);
  await salvarAnimais(novaLista);
  await adicionarNaFilaSync({ tipo: 'REMOVER', id });
}

// ---------- FILA DE SINCRONIZAÇÃO ----------

export async function getFilaSync() {
  try {
    const json = await AsyncStorage.getItem(FILA_SYNC_KEY);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    return [];
  }
}

async function adicionarNaFilaSync(operacao) {
  const fila = await getFilaSync();
  fila.push({ ...operacao, criadoEm: new Date().toISOString() });
  await AsyncStorage.setItem(FILA_SYNC_KEY, JSON.stringify(fila));
}

export async function limparFilaSync() {
  await AsyncStorage.setItem(FILA_SYNC_KEY, JSON.stringify([]));
}

// ---------- CONFIGURAÇÕES (ex: preço da arroba) ----------

export async function getConfig() {
  try {
    const json = await AsyncStorage.getItem(CONFIG_KEY);
    return json ? JSON.parse(json) : { precoArroba: null, dataPrecoArroba: null };
  } catch (e) {
    return { precoArroba: null, dataPrecoArroba: null };
  }
}

export async function salvarConfig(config) {
  await AsyncStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}
