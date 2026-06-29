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
import { useAuth } from './AuthContext';

const AnimalsContext = createContext(null);

export function AnimalsProvider({ children }) {
  const { user } = useAuth();
  const [animais, setAnimais] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [online, setOnline] = useState(true);
  const [config, setConfig] = useState({ precoArroba: null, dataPrecoArroba: null });

  const carregarTudo = useCallback(async () => {
    if (!user) {
      setAnimais([]);
      setConfig({ precoArroba: null, dataPrecoArroba: null });
      setCarregando(false);
      return;
    }
    setCarregando(true);
    const [lista, cfg] = await Promise.all([getAnimais(user.id), getConfig(user.id)]);
    setAnimais(lista);
    setConfig(cfg);
    setCarregando(false);
  }, [user]);

  useEffect(() => {
    // Avoid synchronous setState within effect by deferring
    const timer = setTimeout(() => {
      carregarTudo();
    }, 0);
    
    if (user) {
      iniciarObservadorDeConexao(setOnline, user.id);
      return () => {
        clearTimeout(timer);
        pararObservadorDeConexao();
      };
    }
    return () => clearTimeout(timer);
  }, [user, carregarTudo]);

  const criarAnimal = useCallback(async (dados) => {
    if (!user) return null;
    // Garante que tenha a lista de eventos inicial
    const novosDados = {
      ...dados,
      eventos: dados.eventos || [
        {
          id: `${Date.now()}_nasc`,
          tipo: 'Manejo',
          data: dados.dataNascimento || new Date().toISOString().split('T')[0],
          observacao: 'Cadastro inicial do animal no rebanho.',
        }
      ]
    };
    const novo = await adicionarAnimal(novosDados, user.id);
    setAnimais((prev) => [...prev, novo]);
    if (online) sincronizar(user.id);
    return novo;
  }, [user, online]);

  const editarAnimal = useCallback(async (id, dados) => {
    if (!user) return null;
    const atualizado = await atualizarAnimal(id, dados, user.id);
    setAnimais((prev) => prev.map((a) => (a.id === id ? atualizado : a)));
    if (online) sincronizar(user.id);
    return atualizado;
  }, [user, online]);

  const excluirAnimal = useCallback(async (id) => {
    if (!user) return;
    await removerAnimal(id, user.id);
    setAnimais((prev) => prev.filter((a) => a.id !== id));
    if (online) sincronizar(user.id);
  }, [user, online]);

  const atualizarPrecoArroba = useCallback(async (valor) => {
    if (!user) return;
    const novaConfig = { precoArroba: valor, dataPrecoArroba: new Date().toISOString() };
    await salvarConfig(novaConfig, user.id);
    setConfig(novaConfig);
  }, [user]);

  // Função para cadastrar novos eventos e atualizar as propriedades principais do animal correspondente
  const adicionarEvento = useCallback(async (animalId, evento) => {
    if (!user) return null;

    const lista = await getAnimais(user.id);
    const animal = lista.find((a) => a.id === animalId);
    if (!animal) return null;

    const novoEvento = {
      ...evento,
      id: evento.id || `${Date.now()}_evt`,
      criadoEm: new Date().toISOString(),
    };

    const eventos = animal.eventos ? [...animal.eventos, novoEvento] : [novoEvento];
    const dadosAtualizados = { eventos };

    // Se o evento impactar o estado atual do animal, atualiza os campos:
    if (evento.tipo === 'Pesagem') {
      dadosAtualizados.peso = parseFloat(evento.peso);
    } else if (evento.tipo === 'Vacina') {
      dadosAtualizados.dataUltimaVacina = evento.data;
      dadosAtualizados.tipoVacina = evento.tipoVacina;
    } else if (evento.tipo === 'Óbito') {
      dadosAtualizados.falecido = true;
      dadosAtualizados.dataFalecimento = evento.data;
      dadosAtualizados.causaFalecimento = evento.causaMorte;
    } else if (evento.tipo === 'Venda') {
      dadosAtualizados.vendido = true;
      dadosAtualizados.status = 'Vendido';
    }

    const animalAtualizado = await atualizarAnimal(animalId, dadosAtualizados, user.id);
    setAnimais((prev) => prev.map((a) => (a.id === animalId ? animalAtualizado : a)));
    if (online) sincronizar(user.id);

    return animalAtualizado;
  }, [user, online]);

  const value = {
    animais,
    carregando,
    online,
    config,
    criarAnimal,
    editarAnimal,
    excluirAnimal,
    adicionarEvento,
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
