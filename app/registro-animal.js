// app/registro-animal.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Linking,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAnimals } from '../src/context/AnimalsContext';

const LINK_GTA = 'https://www.gov.br/pt-br/servicos/habilitar-se-para-emissao-da-guia-de-transito-animal';

export default function RegistroAnimalScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { animais, criarAnimal, editarAnimal } = useAnimals();

  const animalExistente = id ? animais.find((a) => a.id === id) : null;

  const [codigo, setCodigo] = useState('');
  const [dataNascimento, setDataNascimento] = useState(''); // formato YYYY-MM-DD
  const [sexo, setSexo] = useState('Macho');
  const [raca, setRaca] = useState('');
  const [peso, setPeso] = useState('');
  const [dataUltimaVacina, setDataUltimaVacina] = useState('');
  const [tipoVacina, setTipoVacina] = useState('');

  const [falecido, setFalecido] = useState(false);
  const [dataFalecimento, setDataFalecimento] = useState('');
  const [causaFalecimento, setCausaFalecimento] = useState('');

  useEffect(() => {
    if (animalExistente) {
      setCodigo(animalExistente.codigo || '');
      setDataNascimento(animalExistente.dataNascimento || '');
      setSexo(animalExistente.sexo || 'Macho');
      setRaca(animalExistente.raca || '');
      setPeso(animalExistente.peso ? String(animalExistente.peso) : '');
      setDataUltimaVacina(animalExistente.dataUltimaVacina || '');
      setTipoVacina(animalExistente.tipoVacina || '');
      setFalecido(!!animalExistente.falecido);
      setDataFalecimento(animalExistente.dataFalecimento || '');
      setCausaFalecimento(animalExistente.causaFalecimento || '');
    }
  }, [animalExistente]);

  function validarDataISO(valor) {
    return /^\d{4}-\d{2}-\d{2}$/.test(valor);
  }

  async function salvar() {
    if (!codigo.trim()) {
      Alert.alert('Atenção', 'Informe o código da orelha (identificação do animal).');
      return;
    }
    if (dataNascimento && !validarDataISO(dataNascimento)) {
      Alert.alert('Atenção', 'Data de nascimento deve estar no formato AAAA-MM-DD.');
      return;
    }

    const dados = {
      codigo: codigo.trim(),
      dataNascimento,
      sexo,
      raca: raca.trim(),
      peso: peso ? parseFloat(peso.replace(',', '.')) : null,
      dataUltimaVacina,
      tipoVacina: tipoVacina.trim(),
      falecido,
      dataFalecimento: falecido ? dataFalecimento : null,
      causaFalecimento: falecido ? causaFalecimento.trim() : null,
    };

    if (animalExistente) {
      await editarAnimal(animalExistente.id, dados);
    } else {
      await criarAnimal(dados);
    }

    router.back();
  }

  return (
    <ScrollView style={styles.tela} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.tituloTela}>{animalExistente ? 'Editar animal' : 'Registro de animal'}</Text>

      <Campo label="Identificação (código da orelha)" required>
        <TextInput style={styles.input} placeholder="Código da orelha" value={codigo} onChangeText={setCodigo} />
      </Campo>

      <Campo label="Data de nascimento">
        <TextInput
          style={styles.input}
          placeholder="AAAA-MM-DD"
          value={dataNascimento}
          onChangeText={setDataNascimento}
          keyboardType="numbers-and-punctuation"
        />
      </Campo>

      <Campo label="Sexo">
        <View style={styles.linhaSexo}>
          <Pressable
            style={[styles.botaoSexo, sexo === 'Macho' && styles.botaoSexoAtivo]}
            onPress={() => setSexo('Macho')}
          >
            <Text style={[styles.textoSexo, sexo === 'Macho' && styles.textoSexoAtivo]}>Macho</Text>
          </Pressable>
          <Pressable
            style={[styles.botaoSexo, sexo === 'Fêmea' && styles.botaoSexoAtivo]}
            onPress={() => setSexo('Fêmea')}
          >
            <Text style={[styles.textoSexo, sexo === 'Fêmea' && styles.textoSexoAtivo]}>Fêmea</Text>
          </Pressable>
        </View>
      </Campo>

      <Campo label="Raça">
        <TextInput style={styles.input} placeholder="Ex: Angus, Nelore, etc" value={raca} onChangeText={setRaca} />
      </Campo>

      <Campo label="Peso (kg) — pesagem">
        <TextInput
          style={styles.input}
          placeholder="Ex: 320"
          value={peso}
          onChangeText={setPeso}
          keyboardType="numeric"
        />
      </Campo>

      <Campo label="Data da última vacinação">
        <TextInput
          style={styles.input}
          placeholder="AAAA-MM-DD"
          value={dataUltimaVacina}
          onChangeText={setDataUltimaVacina}
        />
      </Campo>

      <Campo label="Tipo de vacina">
        <TextInput
          style={styles.input}
          placeholder="Ex: Febre aftosa"
          value={tipoVacina}
          onChangeText={setTipoVacina}
        />
      </Campo>

      <View style={styles.linhaFalecido}>
        <Text style={styles.labelCampo}>Registrar falecimento</Text>
        <Switch value={falecido} onValueChange={setFalecido} />
      </View>

      {falecido && (
        <>
          <Campo label="Data do falecimento">
            <TextInput
              style={styles.input}
              placeholder="AAAA-MM-DD"
              value={dataFalecimento}
              onChangeText={setDataFalecimento}
            />
          </Campo>
          <Campo label="Causa do falecimento">
            <TextInput
              style={styles.input}
              placeholder="Ex: Doença, acidente..."
              value={causaFalecimento}
              onChangeText={setCausaFalecimento}
            />
          </Campo>
        </>
      )}

      <Pressable style={styles.botaoGTA} onPress={() => Linking.openURL(LINK_GTA)}>
        <Text style={styles.botaoGTATexto}>Emitir GTA no site do governo ↗</Text>
      </Pressable>

      <Pressable style={styles.botaoSalvar} onPress={salvar}>
        <Text style={styles.botaoSalvarTexto}>SALVAR REGISTRO</Text>
      </Pressable>

      <Pressable style={styles.botaoCancelar} onPress={() => router.back()}>
        <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
      </Pressable>
    </ScrollView>
  );
}

function Campo({ label, required, children }) {
  return (
    <View style={styles.campo}>
      <Text style={styles.labelCampo}>
        {label} {required && <Text style={{ color: '#c62828' }}>*</Text>}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#fff' },
  tituloTela: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  campo: { marginBottom: 14 },
  labelCampo: { fontSize: 14, fontWeight: '600', marginBottom: 6, color: '#222' },
  input: {
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  linhaSexo: { flexDirection: 'row', gap: 12 },
  botaoSexo: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#eee',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  botaoSexoAtivo: { backgroundColor: '#e3f3e6', borderColor: '#2e7d32' },
  textoSexo: { fontWeight: '600', color: '#555' },
  textoSexoAtivo: { color: '#2e7d32' },
  linhaFalecido: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  botaoGTA: {
    backgroundColor: '#e8f0fe',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  botaoGTATexto: { color: '#1a73e8', fontWeight: '600' },
  botaoSalvar: {
    backgroundColor: '#2e7d32',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  botaoSalvarTexto: { color: '#fff', fontWeight: '700' },
  botaoCancelar: { alignItems: 'center', paddingVertical: 10, marginBottom: 24 },
  botaoCancelarTexto: { color: '#888' },
});
