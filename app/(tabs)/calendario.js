// app/(tabs)/calendario.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Placeholder simples. Pode futuramente listar datas de vacinação, nascimentos e lembretes usando uma lib como react-native-calendars.
export default function CalendarioScreen() {
  return (
    <View style={styles.tela}>
      <View style={styles.header}>
        <Text style={styles.headerTexto}>Modo online</Text>
      </View>
      <View style={styles.conteudo}>
        <Text style={styles.texto}>Calendário de vacinas e lembretes (em desenvolvimento).</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#fff' },
  header: { backgroundColor: '#43a047', alignItems: 'center', paddingVertical: 8 },
  headerTexto: { color: '#fff', fontWeight: '600', fontSize: 12 },
  conteudo: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  texto: { textAlign: 'center', color: '#666' },
});
