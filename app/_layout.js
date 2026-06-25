// app/_layout.js
import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { AnimalsProvider } from '../src/context/AnimalsContext';

function RootLayoutNavigation() {
  const { user, carregando } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (carregando) return;

    const noGrupoTabs = segments[0] === '(tabs)' || segments[0] === 'registro-animal';
    const noGrupoAuth = segments[0] === 'login' || segments[0] === 'cadastro';

    if (!user && noGrupoTabs) {
      // Redireciona para o login se tentar acessar o app sem estar logado
      router.replace('/login');
    } else if (user && (noGrupoAuth || segments.length === 0 || segments[0] === 'index')) {
      // Redireciona para a tela de registros se já estiver logado
      router.replace('/(tabs)/registros');
    }
  }, [user, carregando, segments, router]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="cadastro" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="registro-animal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AnimalsProvider>
        <RootLayoutNavigation />
      </AnimalsProvider>
    </AuthProvider>
  );
}
