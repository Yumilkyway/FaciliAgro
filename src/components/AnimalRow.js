import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { calcularCategoria, calcularIdade, formatarDataBR, statusVacina } from '../utils/dateUtils';

const LINK_GTA = 'https://www.gov.br/pt-br/servicos/habilitar-se-para-emissao-da-guia-de-transito-animal';

export default function AnimalRow({ animal, onEditar, onExcluir }) {
  const [aberto, setAberto] = useState(false);

  const idade = calcularIdade(animal.dataNascimento);
  const categoria = calcularCategoria(animal.dataNascimento, animal.sexo);
  const vacina = statusVacina(animal.dataUltimaVacina);

  const corVacina = vacina === 'Em dia' ? '#2e7d32' : '#c62828';
  
  // Cálculo da arroba estimada com base no peso do animal, assumindo que 1 arroba = 30 kg
  const arrobaEstimada = animal.peso ? (animal.peso / 30).toFixed(1) : '-';

  // Determina se o animal está vendido ou falecido para exibir o status apropriado
  const isVendido = !!animal.vendido;
  const isFalecido = !!animal.falecido;
  
  let statusBadge = null;
  let textStyleOverride = {};

  if (isFalecido) {
    statusBadge = (
      <View style={[styles.badge, { backgroundColor: '#ffebee' }]}>
        <Text style={[styles.badgeTexto, { color: '#c62828' }]}>ÓBITO</Text>
      </View>
    );
    textStyleOverride = { color: '#999', textDecorationLine: 'line-through' };
  } else if (isVendido) {
    statusBadge = (
      <View style={[styles.badge, { backgroundColor: '#e8f0fe' }]}>
        <Text style={[styles.badgeTexto, { color: '#1a73e8' }]}>VENDIDO</Text>
      </View>
    );
    textStyleOverride = { color: '#999' };
  }

  return (
    <View style={[styles.container, isFalecido && styles.containerObito, isVendido && styles.containerVendido]}>
      <Pressable style={styles.linha} onPress={() => setAberto(!aberto)}>
        <View style={[styles.celula, styles.colCodigo, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
          <Text style={[styles.textoCelula, styles.negrito, textStyleOverride]}>{animal.codigo}</Text>
          {statusBadge}
        </View>
        <Text style={[styles.celula, styles.colSexo, styles.textoCelula, textStyleOverride]}>{animal.sexo}</Text>
        <Text style={[styles.celula, styles.colNascimento, styles.textoCelula, textStyleOverride]}>
          {formatarDataBR(animal.dataNascimento)}
        </Text>
        <Text style={[styles.celula, styles.colIdade, styles.textoCelula, textStyleOverride]}>{idade.label}</Text>
        <Text style={[styles.celula, styles.colVacina, styles.textoCelula, { color: isFalecido || isVendido ? '#999' : corVacina }]}>
          {isFalecido ? 'N/A' : vacina}
        </Text>
      </Pressable>

      {aberto && (
        <View style={styles.dropdown}>
          <View style={styles.secaoDetalhes}>
            <DetalheLinha label="Raça" valor={animal.raca || '-'} />
            <DetalheLinha label="Categoria" valor={categoria} />
            <DetalheLinha label="Peso Vivo (kg)" valor={animal.peso ? `${animal.peso} kg` : '-'} />
            <DetalheLinha label="Arroba Estimada (@)" valor={animal.peso ? `${arrobaEstimada} @` : '-'} />
            {!isFalecido && (
              <>
                <DetalheLinha label="Última vacina" valor={animal.tipoVacina || '-'} />
                <DetalheLinha label="Data da vacina" valor={formatarDataBR(animal.dataUltimaVacina)} />
              </>
            )}

            {isFalecido && (
              <View style={styles.painelAlerta}>
                <Ionicons name="skull-outline" size={16} color="#c62828" />
                <Text style={styles.textoAlerta}>
                  Falecimento registrado em {formatarDataBR(animal.dataFalecimento)} por: {animal.causaFalecimento || 'Causa não informada'}
                </Text>
              </View>
            )}

            {isVendido && (
              <View style={styles.painelInfo}>
                <Ionicons name="cash-outline" size={16} color="#1a73e8" />
                <Text style={styles.textoInfo}>
                  Animal vendido e removido do rebanho ativo.
                </Text>
              </View>
            )}
          </View>

          <View style={styles.botoes}>
            <Pressable style={styles.botaoSecundario} onPress={() => Linking.openURL(LINK_GTA)}>
              <Text style={styles.botaoSecundarioTexto}>Emitir GTA</Text>
            </Pressable>
            <Pressable style={styles.botaoSecundario} onPress={() => onEditar(animal)}>
              <Text style={styles.botaoSecundarioTexto}>Editar / Histórico</Text>
            </Pressable>
            <Pressable style={styles.botaoExcluir} onPress={() => onExcluir(animal)}>
              <Text style={styles.botaoExcluirTexto}>Excluir</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

function DetalheLinha({ label, valor }) {
  return (
    <View style={styles.detalheLinha}>
      <Text style={styles.detalheLabel}>{label}</Text>
      <Text style={styles.detalheValor}>{valor}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  containerObito: {
    backgroundColor: '#fff8f8',
  },
  containerVendido: {
    backgroundColor: '#f8fafc',
  },
  linha: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  celula: { fontSize: 12, color: '#333' },
  textoCelula: { fontSize: 12 },
  negrito: { fontWeight: '600' },
  colCodigo: { width: 90 },
  colSexo: { width: 55 },
  colNascimento: { width: 75 },
  colIdade: { width: 85 },
  colVacina: { width: 65, fontWeight: '600' },
  badge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
    marginLeft: 2,
  },
  badgeTexto: {
    fontSize: 8,
    fontWeight: '700',
  },
  dropdown: {
    backgroundColor: '#f1f8f0',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#dcedda',
  },
  secaoDetalhes: {
    marginBottom: 10,
  },
  detalheLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detalheLabel: { fontSize: 13, color: '#557', fontWeight: '600' },
  detalheValor: { fontSize: 13, color: '#222' },
  botoes: { flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' },
  botaoSecundario: {
    backgroundColor: '#3e8e54',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  botaoSecundarioTexto: { color: '#fff', fontSize: 12, fontWeight: '600' },
  botaoExcluir: {
    backgroundColor: '#c62828',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  botaoExcluirTexto: { color: '#fff', fontSize: 12, fontWeight: '600' },
  painelAlerta: {
    flexDirection: 'row',
    backgroundColor: '#ffebee',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
    alignItems: 'center',
    gap: 8,
  },
  textoAlerta: {
    fontSize: 11,
    color: '#c62828',
    flex: 1,
    fontWeight: '600',
  },
  painelInfo: {
    flexDirection: 'row',
    backgroundColor: '#e8f0fe',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
    alignItems: 'center',
    gap: 8,
  },
  textoInfo: {
    fontSize: 11,
    color: '#1a73e8',
    flex: 1,
    fontWeight: '600',
  },
});
