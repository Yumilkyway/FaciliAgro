// src/components/AnimalRow.js
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Linking } from 'react-native';
import { calcularIdade, calcularCategoria, statusVacina, formatarDataBR } from '../utils/dateUtils';

const LINK_GTA = 'https://www.gov.br/pt-br/servicos/habilitar-se-para-emissao-da-guia-de-transito-animal';

export default function AnimalRow({ animal, onEditar, onExcluir }) {
  const [aberto, setAberto] = useState(false);

  const idade = calcularIdade(animal.dataNascimento);
  const categoria = calcularCategoria(animal.dataNascimento, animal.sexo);
  const vacina = statusVacina(animal.dataUltimaVacina);

  const corVacina = vacina === 'Em dia' ? '#2e7d32' : '#c62828';

  return (
    <View style={styles.container}>
      <Pressable style={styles.linha} onPress={() => setAberto(!aberto)}>
        <Text style={[styles.celula, styles.colCodigo]}>{animal.codigo}</Text>
        <Text style={[styles.celula, styles.colSexo]}>{animal.sexo}</Text>
        <Text style={[styles.celula, styles.colNascimento]}>{formatarDataBR(animal.dataNascimento)}</Text>
        <Text style={[styles.celula, styles.colIdade]}>{idade.label}</Text>
        <Text style={[styles.celula, styles.colVacina, { color: corVacina }]}>{vacina}</Text>
      </Pressable>

      {aberto && (
        <View style={styles.dropdown}>
          <DetalheLinha label="Raça" valor={animal.raca || '-'} />
          <DetalheLinha label="Categoria" valor={categoria} />
          <DetalheLinha label="Peso (kg)" valor={animal.peso ? `${animal.peso} kg` : '-'} />
          <DetalheLinha label="Última vacina" valor={animal.tipoVacina || '-'} />
          <DetalheLinha label="Data da vacina" valor={formatarDataBR(animal.dataUltimaVacina)} />

          {animal.falecido && (
            <>
              <DetalheLinha label="Falecimento" valor={formatarDataBR(animal.dataFalecimento)} />
              <DetalheLinha label="Causa" valor={animal.causaFalecimento || '-'} />
            </>
          )}

          <View style={styles.botoes}>
            <Pressable style={styles.botaoSecundario} onPress={() => Linking.openURL(LINK_GTA)}>
              <Text style={styles.botaoSecundarioTexto}>Emitir GTA</Text>
            </Pressable>
            <Pressable style={styles.botaoSecundario} onPress={() => onEditar(animal)}>
              <Text style={styles.botaoSecundarioTexto}>Editar</Text>
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
  linha: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  celula: { fontSize: 12, color: '#333' },
  colCodigo: { width: 50, fontWeight: '600' },
  colSexo: { width: 55 },
  colNascimento: { width: 75 },
  colIdade: { width: 60 },
  colVacina: { width: 65, fontWeight: '600' },
  dropdown: {
    backgroundColor: '#f1f8f0',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#dcedda',
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
});
