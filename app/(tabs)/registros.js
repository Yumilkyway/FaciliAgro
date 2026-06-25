// app/(tabs)/registros.js
import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAnimals } from '../../src/context/AnimalsContext';
import AnimalRow from '../../src/components/AnimalRow';

export default function RegistrosScreen() {
  const router = useRouter();
  const { animais, carregando, excluirAnimal, online } = useAnimals();

  function confirmarExclusao(animal) {
    Alert.alert(
      'Excluir animal',
      `Remover o animal ${animal.codigo} dos registros?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => excluirAnimal(animal.id) },
      ]
    );
  }

  function editar(animal) {
    router.push({ pathname: '/registro-animal', params: { id: animal.id } });
  }

  return (
    <View style={styles.tela}>
      <View style={styles.header}>
        <Text style={styles.headerTexto}>{online ? 'Modo online' : 'Modo offline'}</Text>
      </View>

      <View style={styles.cabecalhoLista}>
        <Ionicons name="paw" size={20} color="#2e7d32" />
        <Text style={styles.titulo}>Registros</Text>
        <Pressable style={styles.botaoAdd} onPress={() => router.push('/registro-animal')}>
          <Ionicons name="add" size={20} color="#fff" />
        </Pressable>
      </View>

      <View style={styles.linhaTitulos}>
        <Text style={[styles.tituloColuna, { width: 50 }]}>Código</Text>
        <Text style={[styles.tituloColuna, { width: 55 }]}>Sexo</Text>
        <Text style={[styles.tituloColuna, { width: 75 }]}>Nascim.</Text>
        <Text style={[styles.tituloColuna, { width: 60 }]}>Idade</Text>
        <Text style={[styles.tituloColuna, { width: 65 }]}>Vacina</Text>
      </View>

      {carregando ? (
        <Text style={styles.vazio}>Carregando...</Text>
      ) : animais.length === 0 ? (
        <Text style={styles.vazio}>Nenhum animal cadastrado ainda.</Text>
      ) : (
        <FlatList
          data={animais}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AnimalRow animal={item} onEditar={editar} onExcluir={confirmarExclusao} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#fff' },
  header: { backgroundColor: '#43a047', alignItems: 'center', paddingVertical: 8 },
  headerTexto: { color: '#fff', fontWeight: '600', fontSize: 12 },
  cabecalhoLista: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 8,
  },
  titulo: { fontSize: 18, fontWeight: '700', flex: 1 },
  botaoAdd: {
    backgroundColor: '#2e7d32',
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linhaTitulos: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tituloColuna: { fontSize: 11, fontWeight: '700', color: '#555' },
  vazio: { textAlign: 'center', color: '#888', marginTop: 32 },
});
