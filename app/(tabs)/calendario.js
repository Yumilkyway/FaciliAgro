import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAnimals } from '../../src/context/AnimalsContext';
import { Ionicons } from '@expo/vector-icons';
import { formatarDataBR } from '../../src/utils/dateUtils';

export default function CalendarioScreen() {
  const { animais, online } = useAnimals();

  // Consolida e ordena todos os eventos de todos os animais do produtor
  const todosEventos = useMemo(() => {
    const eventosConsolidados = [];

    animais.forEach((animal) => {
      if (animal.eventos && Array.isArray(animal.eventos)) {
        animal.eventos.forEach((evento) => {
          eventosConsolidados.push({
            ...evento,
            animalId: animal.id,
            animalCodigo: animal.codigo,
            animalRaca: animal.raca,
            animalSexo: animal.sexo,
          });
        });
      }
    });

    // Ordena por data decrescente (eventos mais recentes primeiro)
    return eventosConsolidados.sort((a, b) => new Date(b.data) - new Date(a.data));
  }, [animais]);

  function getIconeEvento(tipo) {
    switch (tipo) {
      case 'Pesagem': return 'scale-outline';
      case 'Vacina': return 'shield-checkmark-outline';
      case 'Óbito': return 'skull-outline';
      case 'Venda': return 'cash-outline';
      default: return 'construct-outline';
    }
  }

  function getCorEvento(tipo) {
    switch (tipo) {
      case 'Pesagem': return '#388e3c'; // Verde
      case 'Vacina': return '#1976d2'; // Azul
      case 'Óbito': return '#d32f2f'; // Vermelho
      case 'Venda': return '#f57c00'; // Laranja
      default: return '#7b1fa2'; // Roxo (Manejo geral)
    }
  }

  return (
    <SafeAreaView style={styles.tela}>
      <View style={styles.header}>
        <Text style={styles.tituloHeader}>Cronograma do Rebanho</Text>
        <Text style={styles.headerTexto}>{online ? 'Modo online' : 'Modo offline'}</Text>
      </View>

      <View style={styles.corpo}>
        <Text style={styles.subtitulo}>Histórico de Manejo & Atividades</Text>

        {todosEventos.length === 0 ? (
          <View style={styles.containerVazio}>
            <Ionicons name="calendar-outline" size={64} color="#aaa" />
            <Text style={styles.textoVazio}>
              Nenhum evento registrado ainda. Vá em &quot;Menu&quot;, registre ou edite um animal e adicione manejos.
            </Text>
          </View>
        ) : (
          <FlatList
            data={todosEventos}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listaScroll}
            renderItem={({ item, index }) => {
              const corEvento = getCorEvento(item.tipo);
              return (
                <View style={styles.linhaTimeline}>
                  <View style={styles.linhaEsquerdaContainer}>
                    <View style={[styles.circuloLinha, { backgroundColor: corEvento }]}>
                      <Ionicons name={getIconeEvento(item.tipo)} size={14} color="#fff" />
                    </View>
                    {index < todosEventos.length - 1 && <View style={styles.linhaVertical} />}
                  </View>

                  {/* Card do Evento */}
                  <View style={styles.cardEvento}>
                    <View style={styles.topoCard}>
                      <Text style={[styles.tipoTexto, { color: corEvento }]}>{item.tipo.toUpperCase()}</Text>
                      <Text style={styles.dataTexto}>{formatarDataBR(item.data)}</Text>
                    </View>

                    <Text style={styles.animalTexto}>
                      Animal Brinco: <Text style={{ fontWeight: 'bold' }}>{item.animalCodigo}</Text> ({item.animalSexo === 'Macho' ? 'M' : 'F'} | {item.animalRaca || 'Sem raça'})
                    </Text>

                    {item.tipo === 'Pesagem' && (
                      <Text style={styles.detalheTexto}>
                        Peso Registrado: <Text style={{ fontWeight: '600' }}>{item.peso} kg</Text> ({item.arrobaEstimada} @ estimadas)
                      </Text>
                    )}

                    {item.tipo === 'Vacina' && (
                      <Text style={styles.detalheTexto}>
                        Vacina Aplicada: <Text style={{ fontWeight: '600' }}>{item.tipoVacina}</Text>{' '}
                        {item.lote ? `(Lote: ${item.lote})` : ''}
                      </Text>
                    )}

                    {item.tipo === 'Óbito' && (
                      <Text style={[styles.detalheTexto, { color: '#d32f2f', fontWeight: '500' }]}>
                        Baixa por Morte - Causa: {item.causaMorte}
                      </Text>
                    )}

                    {item.tipo === 'Venda' && (
                      <Text style={styles.detalheTexto}>
                        Baixa por Venda - Guia GTA: {item.gta}
                      </Text>
                    )}

                    {item.observacao ? (
                      <Text style={styles.obsTexto}>Obs: &quot;{item.observacao}&quot;</Text>
                    ) : null}
                  </View>
                </View>
              );
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#f1f8f0' },
  header: {
    backgroundColor: '#2e7d32',
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  tituloHeader: { color: '#fff', fontSize: 18, fontWeight: '700' },
  headerTexto: { color: '#e8f5e9', fontWeight: '600', fontSize: 11, marginTop: 4 },
  corpo: { flex: 1, padding: 16 },
  subtitulo: { fontSize: 15, fontWeight: '700', color: '#2e7d32', marginBottom: 16 },
  containerVazio: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  textoVazio: {
    textAlign: 'center',
    color: '#777',
    fontSize: 14,
    lineHeight: 20,
  },
  listaScroll: { paddingBottom: 32 },
  linhaTimeline: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  linhaEsquerdaContainer: {
    alignItems: 'center',
    marginRight: 12,
    width: 24,
  },
  circuloLinha: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  linhaVertical: {
    width: 2,
    flex: 1,
    backgroundColor: '#cbd4cb',
    marginTop: 4,
    marginBottom: -16, 
  },
  cardEvento: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  topoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  tipoTexto: { fontSize: 11, fontWeight: '800' },
  dataTexto: { fontSize: 11, color: '#888' },
  animalTexto: { fontSize: 13, color: '#333', marginBottom: 4 },
  detalheTexto: { fontSize: 12, color: '#555', marginBottom: 4 },
  obsTexto: { fontSize: 11, color: '#777', fontStyle: 'italic', marginTop: 4, borderTopWidth: 1, borderTopColor: '#f1f1f1', paddingTop: 4 },
});
