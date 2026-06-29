import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function handleEntrar() {
    if (!email.trim() || !senha.trim()) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
      return;
    }

    setEnviando(true);
    const resultado = await login(email, senha);
    setEnviando(false);

    if (resultado.sucesso) {
      router.replace('/(tabs)/registros');
    } else {
      Alert.alert('Erro no Login', resultado.erro);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.tela}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Logo círculo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCirculo}>
            <Text style={styles.logoTexto}>Logo</Text>
          </View>
        </View>

        {/* Formulário */}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="E-mail"
            placeholderTextColor="#aed581"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#aed581"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />

          <Pressable
            style={({ pressed }) => [styles.botao, pressed && styles.botaoPressionado]}
            onPress={handleEntrar}
            disabled={enviando}
          >
            {enviando ? (
              <ActivityIndicator color="#2e7d32" />
            ) : (
              <Text style={styles.botaoTexto}>ENTRAR</Text>
            )}
          </Pressable>

          <Pressable style={styles.linkCadastro} onPress={() => router.push('/cadastro')}>
            <Text style={styles.linkCadastroTexto}>Não tem conta? Cadastre-se</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#2e7d32' },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoCirculo: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#e8f5e9',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  logoTexto: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1b5e20',
  },
  form: {
    width: '100%',
    gap: 16,
  },
  input: {
    backgroundColor: '#3e8e41',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#4caf50',
  },
  botao: {
    backgroundColor: '#e8f5e9',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  botaoPressionado: {
    backgroundColor: '#c8e6c9',
  },
  botaoTexto: {
    color: '#1b5e20',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  linkCadastro: {
    alignItems: 'center',
    marginTop: 12,
  },
  linkCadastroTexto: {
    color: '#e8f5e9',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
