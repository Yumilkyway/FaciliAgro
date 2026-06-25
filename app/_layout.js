// app/_layout.js
import { Stack } from 'expo-router';
import { AnimalsProvider } from '../src/context/AnimalsContext';

export default function RootLayout() {
  return (
    <AnimalsProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="registro-animal" options={{ presentation: 'modal' }} />
      </Stack>
    </AnimalsProvider>
  );
}
