// src/context/AnimalsContext.js
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  getAnimais,
  adicionarAnimal,
  atualizarAnimal,
  removerAnimal,
  getConfig,
  salvarConfig,
} from '../services/storage';
import { iniciarObservadorDeConexao, pararObservadorDeConexao, sincronizar } from '../services/sync';

const AnimalsContext = createContext(null);

export function AnimalsProvider({ children }) {
  const [animais, setAnimais] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [online, setOnline] = useState(true);
  const [config, setConfig] = useState({ precoArroba: null, dataPrecoArroba: null });

  const carregarTudo = useCallback(async () => {
    setCarregando(true);
    const [lista, cfg] = await Promise.all([getAnimais(), getConfig()]);
    setAnimais(lista);
    setConfig(cfg);
    setCarregando(false);
  }, []);

  useEffect(() => {
    carregarTudo();
    iniciarObservadorDeConexao(setOnline);
    return () => pararObservadorDeConexao();
  }, [carregarTudo]);

  const criarAnimal = useCallback(async (dados) => {
    const novo = await adicionarAnimal(dados);
    setAnimais((prev) => [...prev, novo]);
    if (online) sincronizar();
    return novo;
  }, [online]);

  const editarAnimal = useCallback(async (id, dados) => {
    const atualizado = await atualizarAnimal(id, dados);
    setAnimais((prev) => prev.map((a) => (a.id === id ? atualizado : a)));
    if (online) sincronizar();
    return atualizado;
  }, [online]);

  const excluirAnimal = useCallback(async (id) => {
    await removerAnimal(id);
    setAnimais((prev) => prev.filter((a) => a.id !== id));
    if (online) sincronizar();
  }, [online]);

  const atualizarPrecoArroba = useCallback(async (valor) => {
    const novaConfig = { precoArroba: valor, dataPrecoArroba: new Date().toISOString() };
    await salvarConfig(novaConfig);
    setConfig(novaConfig);
  }, []);

  const value = {
    animais,
    carregando,
    online,
    config,
    criarAnimal,
    editarAnimal,
    excluirAnimal,
    atualizarPrecoArroba,
    recarregar: carregarTudo,
  };

  return <AnimalsContext.Provider value={value}>{children}</AnimalsContext.Provider>;
}

export function useAnimals() {
  const ctx = useContext(AnimalsContext);
  if (!ctx) throw new Error('useAnimals precisa estar dentro de <AnimalsProvider>');
  return ctx;
}
