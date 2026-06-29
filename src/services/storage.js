import AsyncStorage from '@react-native-async-storage/async-storage';

function getKeys(userId) {
  const prefix = userId ? `@faciliagro:${userId}` : '@faciliagro';
  return {
    ANIMAIS_KEY: `${prefix}:animais`,
    FILA_SYNC_KEY: `${prefix}:fila_sync`,
    CONFIG_KEY: `${prefix}:config`,
  };
}

// ---------- ANIMAIS ----------

export async function getAnimais(userId) {
  try {
    const keys = getKeys(userId);
    const json = await AsyncStorage.getItem(keys.ANIMAIS_KEY);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    console.error('Erro ao ler animais do storage', e);
    return [];
  }
}

export async function salvarAnimais(lista, userId) {
  try {
    const keys = getKeys(userId);
    await AsyncStorage.setItem(keys.ANIMAIS_KEY, JSON.stringify(lista));
  } catch (e) {
    console.error('Erro ao salvar animais no storage', e);
  }
}

export async function adicionarAnimal(animal, userId) {
  const lista = await getAnimais(userId);
  const novo = {
    ...animal,
    id: animal.id || `${Date.now()}`,
    atualizadoEm: new Date().toISOString(),
    eventos: animal.eventos || [], // Garante que a lista de eventos exista
  };
  const novaLista = [...lista, novo];
  await salvarAnimais(novaLista, userId);
  await adicionarNaFilaSync({ tipo: 'CRIAR', animal: novo }, userId);
  return novo;
}

export async function atualizarAnimal(id, dadosAtualizados, userId) {
  const lista = await getAnimais(userId);
  const novaLista = lista.map((a) =>
    a.id === id ? { ...a, ...dadosAtualizados, atualizadoEm: new Date().toISOString() } : a
  );
  await salvarAnimais(novaLista, userId);
  const atualizado = novaLista.find((a) => a.id === id);
  await adicionarNaFilaSync({ tipo: 'ATUALIZAR', animal: atualizado }, userId);
  return atualizado;
}

export async function removerAnimal(id, userId) {
  const lista = await getAnimais(userId);
  const novaLista = lista.filter((a) => a.id !== id);
  await salvarAnimais(novaLista, userId);
  await adicionarNaFilaSync({ tipo: 'REMOVER', id }, userId);
}

// ---------- FILA DE SINCRONIZAÇÃO ----------

export async function getFilaSync(userId) {
  try {
    const keys = getKeys(userId);
    const json = await AsyncStorage.getItem(keys.FILA_SYNC_KEY);
    return json ? JSON.parse(json) : [];
  } catch (_e) {
    return [];
  }
}

async function adicionarNaFilaSync(operacao, userId) {
  const keys = getKeys(userId);
  const fila = await getFilaSync(userId);
  fila.push({ ...operacao, criadoEm: new Date().toISOString() });
  await AsyncStorage.setItem(keys.FILA_SYNC_KEY, JSON.stringify(fila));
}

export async function limparFilaSync(userId) {
  const keys = getKeys(userId);
  await AsyncStorage.setItem(keys.FILA_SYNC_KEY, JSON.stringify([]));
}

// ---------- CONFIGURAÇÕES (ex: preço da arroba) ----------

export async function getConfig(userId) {
  try {
    const keys = getKeys(userId);
    const json = await AsyncStorage.getItem(keys.CONFIG_KEY);
    return json ? JSON.parse(json) : { precoArroba: null, dataPrecoArroba: null };
  } catch (_e) {
    return { precoArroba: null, dataPrecoArroba: null };
  }
}

export async function salvarConfig(config, userId) {
  const keys = getKeys(userId);
  await AsyncStorage.setItem(keys.CONFIG_KEY, JSON.stringify(config));
}
