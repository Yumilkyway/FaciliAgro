import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';

export default function MenuCard({ titulo, onPress, style }) {
  return (
    <Pressable style={[styles.card, style]} onPress={onPress}>
      <Text style={styles.texto}>{titulo}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    elevation: 2,
  },
  texto: { fontSize: 14, color: '#222' },
});
