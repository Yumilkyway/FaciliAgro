// app/(tabs)/menu.js
import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import MenuCard from '../../src/components/MenuCard';
import { useAnimals } from '../../src/context/AnimalsContext';

export default function MenuScreen() {
  const router = useRouter();
  const { animais, config, atualizarPrecoArroba, online } = useAnimals();
  const [precoInput, setPrecoInput] = useState(config.precoArroba ? String(config.precoArroba) : '');

  const machos = animais.filter((a) => a.sexo === 'Macho' && !a.falecido).length;
  const femeas = animais.filter((a) => a.sexo === 'Fêmea' && !a.falecido).length;

  function salvarPreco() {
    const valor = parseFloat(precoInput.replace(',', '.'));
    if (!isNaN(valor)) atualizarPrecoArroba(valor);
  }

  return (
    <View style={styles.tela}>
      <View style={styles.header}>
        <Text style={styles.headerTexto}>{online ? 'Modo online' : 'Modo offline'}</Text>
      </View>

      <ScrollView style={styles.conteudo} contentContainerStyle={{ padding: 16 }}>
        <MenuCard titulo="Lembretes (vacinação / alimentação)" onPress={() => {}} />
        <MenuCard titulo="Relatórios" onPress={() => {}} />

        <View style={styles.precoCard}>
          <Text style={styles.precoLabel}>Preço da arroba hoje (R$)</Text>
          <TextInput
            style={styles.precoInput}
            placeholder="Ex: 285,50"
            keyboardType="numeric"
            value={precoInput}
            onChangeText={setPrecoInput}
            onEndEditing={salvarPreco}
          />
        </View>

        <View style={styles.linhaQuantidades}>
          <View style={styles.quantidadeCard}>
            <Text style={styles.quantidadeNumero}>{machos}</Text>
            <Text style={styles.quantidadeLabel}>Machos</Text>
          </View>
          <View style={styles.quantidadeCard}>
            <Text style={styles.quantidadeNumero}>{femeas}</Text>
            <Text style={styles.quantidadeLabel}>Fêmeas</Text>
          </View>
        </View>

        <MenuCard
          titulo="+ Registrar novo animal"
          onPress={() => router.push('/registro-animal')}
          style={{ backgroundColor: '#dff0e0' }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#2e7d32' },
  header: { backgroundColor: '#43a047', alignItems: 'center', paddingVertical: 8 },
  headerTexto: { color: '#fff', fontWeight: '600', fontSize: 12 },
  conteudo: { flex: 1, backgroundColor: '#cde6cf' },
  precoCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  precoLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8, color: '#222' },
  precoInput: {
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  linhaQuantidades: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  quantidadeCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 20,
    alignItems: 'center',
  },
  quantidadeNumero: { fontSize: 22, fontWeight: '700', color: '#2e7d32' },
  quantidadeLabel: { fontSize: 12, color: '#444', marginTop: 4 },
});
