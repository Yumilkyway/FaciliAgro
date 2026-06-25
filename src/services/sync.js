// src/services/sync.js
// a função `enviarParaBackend` é um STUB. tem que substituir pela chamada real à API (ex: fetch para sua API REST/Firebase/Supabase)

import NetInfo from '@react-native-community/netinfo';
import { getFilaSync, limparFilaSync } from './storage';

let unsubscribe = null;

export function iniciarObservadorDeConexao(onStatusChange, userId) {
  unsubscribe = NetInfo.addEventListener((state) => {
    const online = !!state.isConnected && !!state.isInternetReachable;
    if (onStatusChange) onStatusChange(online);
    if (online) sincronizar(userId);
  });
  return unsubscribe;
}

export function pararObservadorDeConexao() {
  if (unsubscribe) unsubscribe();
}

async function enviarParaBackend(operacoes, userId) {
  // substituir pelo endpoint real da API do projeto :D
  console.log('[sync] Simulando envio de', operacoes.length, 'operações para o backend para o usuário', userId);
  return true;
}

export async function sincronizar(userId) {
  if (!userId) return;
  const fila = await getFilaSync(userId);
  if (fila.length === 0) return;

  const sucesso = await enviarParaBackend(fila, userId);
  if (sucesso) {
    await limparFilaSync(userId);
    console.log('[sync] Fila sincronizada e limpa com sucesso para o usuário:', userId);
  }
}
