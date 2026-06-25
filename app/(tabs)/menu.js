// app/(tabs)/menu.js
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import MenuCard from '../../src/components/MenuCard';
import { useAnimals } from '../../src/context/AnimalsContext';
import { useAuth } from '../../src/context/AuthContext';
import { obterPrecoArroba } from '../../src/services/apiArroba';
import { calcularCategoria, formatarDataBR, statusVacina } from '../../src/utils/dateUtils';

const PRECO_FALLBACK = 285.50;

export default function MenuScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { animais, config, atualizarPrecoArroba, online } = useAnimals();

  const [precoInput, setPrecoInput] = useState('');
  const [fontePreco, setFontePreco] = useState('Manual');

  // Controle de visibilidade dos modais de Lembretes e Relatórios
  const [modalLembretes, setModalLembretes] = useState(false);
  const [modalRelatorios, setModalRelatorios] = useState(false);

  // Busca a cotação real da arroba na API do Ipeadata ao carregar a tela
  useEffect(() => {
    async function carregarCotacaoReal() {
      if (online) {
        const resultado = await obterPrecoArroba();
        if (resultado) {
          atualizarPrecoArroba(resultado.precoArroba);
          setPrecoInput(String(resultado.precoArroba));
          setFontePreco('API Ipeadata (Boi Gordo CEPEA/B3)');
          return;
        }
      }
      
      // Fallback
      if (config.precoArroba) {
        setPrecoInput(String(config.precoArroba));
        setFontePreco('Salvo anteriormente (Offline)');
      } else {
        setPrecoInput(String(PRECO_FALLBACK));
        atualizarPrecoArroba(PRECO_FALLBACK);
        setFontePreco('Padrão fallback');
      }
    }
    carregarCotacaoReal();
  }, [online, config.precoArroba, atualizarPrecoArroba]);

  const machos = animais.filter((a) => a.sexo === 'Macho' && !a.falecido && !a.vendido).length;
  const femeas = animais.filter((a) => a.sexo === 'Fêmea' && !a.falecido && !a.vendido).length;
  const totalAtivo = machos + femeas;

  // Filtragem de animais pendentes de vacina
  const animaisVacinaPendente = animais.filter(
    (a) => !a.falecido && !a.vendido && statusVacina(a.dataUltimaVacina) === 'Pendente'
  );

  // Dados para Relatórios
  const totalObitos = animais.filter((a) => a.falecido).length;
  const totalVendidos = animais.filter((a) => a.vendido).length;
  const pesoTotal = animais
    .filter((a) => !a.falecido && !a.vendido)
    .reduce((soma, a) => soma + (a.peso || 0), 0);
  const arrobasTotais = parseFloat((pesoTotal / 30).toFixed(1));

  // Categorização
  const categorias = {
    'Bezerro(a)': 0,
    'Novilho': 0,
    'Novilha': 0,
    'Boi': 0,
    'Vaca': 0,
  };

  animais
    .filter((a) => !a.falecido && !a.vendido)
    .forEach((a) => {
      const cat = calcularCategoria(a.dataNascimento, a.sexo);
      if (categorias[cat] !== undefined) {
        categorias[cat]++;
      } else {
        // Fallback genérico caso a string mude
        if (a.sexo === 'Macho') categorias['Boi']++;
        else categorias['Vaca']++;
      }
    });

  function salvarPrecoManualmente() {
    const valor = parseFloat(precoInput.replace(',', '.'));
    if (!isNaN(valor)) {
      atualizarPrecoArroba(valor);
      setFontePreco('Alterado manualmente');
      Alert.alert('Sucesso', 'Preço da arroba atualizado manualmente.');
    } else {
      Alert.alert('Erro', 'Insira um valor numérico válido.');
    }
  }

  function handleLogout() {
    Alert.alert('Sair', 'Deseja encerrar a sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);
  }

  return (
    <View style={styles.tela}>
      {/* Header com nome do usuário e botão sair */}
      <View style={styles.header}>
        <View style={styles.linhaHeaderSuperior}>
          <Text style={styles.usuarioTexto}>Olá, {user?.nome || 'Produtor'}</Text>
          <Pressable onPress={handleLogout} style={styles.botaoSair}>
            <Ionicons name="log-out-outline" size={20} color="#fff" />
          </Pressable>
        </View>
        <Text style={styles.headerTexto}>{online ? 'Modo online' : 'Modo offline'}</Text>
      </View>

      <ScrollView style={styles.conteudo} contentContainerStyle={{ padding: 16 }}>
        {/* Lembretes */}
        <MenuCard
          titulo={`Lembretes (${animaisVacinaPendente.length} vacinas pendentes)`}
          onPress={() => setModalLembretes(true)}
          style={animaisVacinaPendente.length > 0 ? styles.cardAlerta : null}
        />

        {/* Relatórios */}
        <MenuCard titulo="Relatórios de Rebanho" onPress={() => setModalRelatorios(true)} />

        {/* Cotação Arroba */}
        <View style={styles.precoCard}>
          <Text style={styles.precoLabel}>Preço da arroba hoje (R$)</Text>
          <View style={styles.linhaPreco}>
            <TextInput
              style={styles.precoInput}
              placeholder="Ex: 285,50"
              keyboardType="numeric"
              value={precoInput}
              onChangeText={setPrecoInput}
            />
            <Pressable style={styles.botaoSalvarPreco} onPress={salvarPrecoManualmente}>
              <Text style={styles.botaoSalvarPrecoTexto}>Salvar</Text>
            </Pressable>
          </View>
          <Text style={styles.fontePrecoTexto}>Fonte: {fontePreco}</Text>
        </View>

        {/* Resumo Rápido Rebanho */}
        <View style={styles.linhaQuantidades}>
          <View style={styles.quantidadeCard}>
            <Text style={styles.quantidadeNumero}>{machos}</Text>
            <Text style={styles.quantidadeLabel}>Machos Ativos</Text>
          </View>
          <View style={styles.quantidadeCard}>
            <Text style={styles.quantidadeNumero}>{femeas}</Text>
            <Text style={styles.quantidadeLabel}>Fêmeas Ativas</Text>
          </View>
        </View>

        <MenuCard
          titulo="+ Registrar Novo Animal"
          onPress={() => router.push('/registro-animal')}
          style={{ backgroundColor: '#2e7d32', color: '#fff' }}
        />
      </ScrollView>

      {/* MODAL DE LEMBRETES */}
      <Modal visible={modalLembretes} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>Lembretes de Vacinação</Text>
              <Pressable onPress={() => setModalLembretes(false)}>
                <Ionicons name="close" size={24} color="#555" />
              </Pressable>
            </View>

            {animaisVacinaPendente.length === 0 ? (
              <View style={styles.mensagemSucessoContainer}>
                <Ionicons name="checkmark-circle-outline" size={48} color="#2e7d32" />
                <Text style={styles.mensagemSucesso}>Tudo em dia! Nenhum gado com vacina atrasada.</Text>
              </View>
            ) : (
              <FlatList
                data={animaisVacinaPendente}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.itemLembrete}>
                    <Ionicons name="alert-circle-outline" size={24} color="#c62828" />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.textoLembreteTitulo}>Animal Brinco: {item.codigo}</Text>
                      <Text style={styles.textoLembreteDetalhe}>
                        Última Vacina: {item.tipoVacina || 'Nenhuma registrada'} -{' '}
                        {item.dataUltimaVacina ? formatarDataBR(item.dataUltimaVacina) : 'Pendente'}
                      </Text>
                    </View>
                    <Pressable
                      style={styles.botaoVacinar}
                      onPress={() => {
                        setModalLembretes(false);
                        router.push({ pathname: '/registro-animal', params: { id: item.id } });
                      }}
                    >
                      <Text style={styles.botaoVacinarTexto}>Lançar</Text>
                    </Pressable>
                  </View>
                )}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* MODAL DE RELATÓRIOS */}
      <Modal visible={modalRelatorios} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>Relatório Geral do Rebanho</Text>
              <Pressable onPress={() => setModalRelatorios(false)}>
                <Ionicons name="close" size={24} color="#555" />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.secaoRelatorioScroll}>
              <Text style={styles.tituloSecaoRelatorio}>Resumo de Cabeças</Text>
              <View style={styles.gridRelatorio}>
                <ItemGrid label="Total Ativo" valor={totalAtivo} />
                <ItemGrid label="Total Machos" valor={machos} />
                <ItemGrid label="Total Fêmeas" valor={femeas} />
                <ItemGrid label="Total Arrobas" valor={`${arrobasTotais} @`} />
              </View>

              <Text style={styles.tituloSecaoRelatorio}>Divisão por Categorias (Ativos)</Text>
              <View style={styles.listaCategorias}>
                <LinhaCategoria label="Bezerros/as (< 8 meses)" valor={categorias['Bezerro(a)']} />
                <LinhaCategoria label="Novilhos (M, 8 - 24 meses)" valor={categorias['Novilho']} />
                <LinhaCategoria label="Novilhas (F, 8 - 24 meses)" valor={categorias['Novilha']} />
                <LinhaCategoria label="Bois (M, > 24 meses)" valor={categorias['Boi']} />
                <LinhaCategoria label="Vacas (F, > 24 meses)" valor={categorias['Vaca']} />
              </View>

              <Text style={styles.tituloSecaoRelatorio}>Métricas Financeiras Estimadas</Text>
              <View style={styles.financeiroCard}>
                <Text style={styles.financeiroLabel}>Preço Unitário da @</Text>
                <Text style={styles.financeiroValor}>R$ {parseFloat(precoInput).toFixed(2)}</Text>
                <Text style={styles.financeiroLabel}>Valor Estimado do Rebanho Ativo</Text>
                <Text style={styles.financeiroValorGrande}>
                  R$ {(arrobasTotais * parseFloat(precoInput)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
                <Text style={styles.subtextCalc}>
                  * Calculado com base em rendimento estimado de 50% de carcaça.
                </Text>
              </View>

              <Text style={styles.tituloSecaoRelatorio}>Baixas e Ocorrências Históricas</Text>
              <View style={styles.gridRelatorio}>
                <ItemGrid label="Total Óbitos" valor={totalObitos} cor="#c62828" />
                <ItemGrid label="Total Vendidos" valor={totalVendidos} cor="#1a73e8" />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function ItemGrid({ label, valor, cor = '#2e7d32' }) {
  return (
    <View style={styles.itemGrid}>
      <Text style={styles.itemGridLabel}>{label}</Text>
      <Text style={[styles.itemGridValor, { color: cor }]}>{valor}</Text>
    </View>
  );
}

function LinhaCategoria({ label, valor }) {
  return (
    <View style={styles.linhaCategoria}>
      <Text style={styles.categoriaLabel}>{label}</Text>
      <Text style={styles.categoriaValor}>{valor} cab.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#cde6cf' },
  header: {
    backgroundColor: '#2e7d32',
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  linhaHeaderSuperior: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  usuarioTexto: { color: '#fff', fontSize: 18, fontWeight: '700' },
  botaoSair: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTexto: { color: '#e8f5e9', fontWeight: '600', fontSize: 11 },
  conteudo: { flex: 1 },
  cardAlerta: {
    backgroundColor: '#ffebee',
    borderColor: '#ef9a9a',
    borderWidth: 1,
  },
  precoCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  precoLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8, color: '#222' },
  linhaPreco: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  precoInput: {
    flex: 1,
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: '700',
    color: '#2e7d32',
  },
  botaoSalvarPreco: {
    backgroundColor: '#2e7d32',
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  botaoSalvarPrecoTexto: { color: '#fff', fontWeight: '700', fontSize: 13 },
  fontePrecoTexto: { fontSize: 10, color: '#666', marginTop: 8, fontStyle: 'italic' },
  linhaQuantidades: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  quantidadeCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 2,
  },
  quantidadeNumero: { fontSize: 24, fontWeight: '700', color: '#2e7d32' },
  quantidadeLabel: { fontSize: 11, color: '#555', marginTop: 4, fontWeight: '500' },

  // Modais estilo Notion
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxHeight: '85%',
    padding: 20,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  modalTitulo: { fontSize: 18, fontWeight: '700', color: '#2e7d32' },

  // Itens de Lembrete
  mensagemSucessoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  mensagemSucesso: { fontSize: 14, color: '#2e7d32', fontWeight: '600', textAlign: 'center' },
  itemLembrete: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  textoLembreteTitulo: { fontSize: 13, fontWeight: '700', color: '#333' },
  textoLembreteDetalhe: { fontSize: 11, color: '#666', marginTop: 2 },
  botaoVacinar: {
    backgroundColor: '#2e7d32',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  botaoVacinarTexto: { color: '#fff', fontSize: 11, fontWeight: '700' },

  // Relatórios
  secaoRelatorioScroll: { gap: 16 },
  tituloSecaoRelatorio: { fontSize: 14, fontWeight: '700', color: '#2e7d32', marginTop: 8 },
  gridRelatorio: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  itemGrid: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  itemGridLabel: { fontSize: 11, color: '#666' },
  itemGridValor: { fontSize: 18, fontWeight: '700', marginTop: 4 },
  listaCategorias: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  linhaCategoria: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  categoriaLabel: { fontSize: 12, color: '#444' },
  categoriaValor: { fontSize: 12, fontWeight: '700', color: '#333' },
  financeiroCard: {
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#a5d6a7',
  },
  financeiroLabel: { fontSize: 11, color: '#3e8e41', fontWeight: '600' },
  financeiroValor: { fontSize: 14, fontWeight: '600', color: '#1b5e20', marginBottom: 8 },
  financeiroValorGrande: { fontSize: 20, fontWeight: '800', color: '#1b5e20' },
  subtextCalc: { fontSize: 10, color: '#666', marginTop: 6, fontStyle: 'italic' },
});
