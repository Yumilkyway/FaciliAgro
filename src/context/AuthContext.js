// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USERS_KEY = '@faciliagro:users';
const LOGGED_USER_KEY = '@faciliagro:logged_user';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [carregando, setCarregando] = useState(true);

  // Carrega a sessão do usuário ativo ao iniciar o app
  useEffect(() => {
    async function carregarSessao() {
      try {
        const sessao = await AsyncStorage.getItem(LOGGED_USER_KEY);
        if (sessao) {
          setUser(JSON.parse(sessao));
        }
      } catch (e) {
        console.error('Erro ao carregar sessão', e);
      } finally {
        setCarregando(false);
      }
    }
    carregarSessao();
  }, []);

  const login = useCallback(async (email, senha) => {
    try {
      const usersJson = await AsyncStorage.getItem(USERS_KEY);
      const users = usersJson ? JSON.parse(usersJson) : [];

      const usuarioValido = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.senha === senha
      );

      if (!usuarioValido) {
        return { sucesso: false, erro: 'E-mail ou senha incorretos.' };
      }

      const sessionUser = { id: usuarioValido.id, nome: usuarioValido.nome, email: usuarioValido.email };
      await AsyncStorage.setItem(LOGGED_USER_KEY, JSON.stringify(sessionUser));
      setUser(sessionUser);
      return { sucesso: true };
    } catch (_e) {
      return { sucesso: false, erro: 'Erro ao fazer login. Tente novamente.' };
    }
  }, []);

  const cadastro = useCallback(async (nome, email, senha) => {
    try {
      if (!nome.trim() || !email.trim() || !senha.trim()) {
        return { sucesso: false, erro: 'Preencha todos os campos obrigatórios.' };
      }

      const usersJson = await AsyncStorage.getItem(USERS_KEY);
      const users = usersJson ? JSON.parse(usersJson) : [];

      const usuarioExiste = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
      if (usuarioExiste) {
        return { sucesso: false, erro: 'Este e-mail já está cadastrado.' };
      }

      const novoUsuario = {
        id: `${Date.now()}`,
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        senha,
      };

      users.push(novoUsuario);
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));

      // Auto-login após o cadastro
      const sessionUser = { id: novoUsuario.id, nome: novoUsuario.nome, email: novoUsuario.email };
      await AsyncStorage.setItem(LOGGED_USER_KEY, JSON.stringify(sessionUser));
      setUser(sessionUser);

      return { sucesso: true };
    } catch (_e) {
      return { sucesso: false, erro: 'Erro ao realizar cadastro. Tente novamente.' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(LOGGED_USER_KEY);
      setUser(null);
    } catch (e) {
      console.error('Erro no logout', e);
    }
  }, []);

  const value = {
    user,
    carregando,
    login,
    cadastro,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return ctx;
}
