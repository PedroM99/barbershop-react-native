import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';


const screenWidth = Dimensions.get('window').width;
const itemSize = screenWidth / 2 - 50;

export default function Barber({ name, specialty, image, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={image} style={styles.image} />
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.specialty}>{specialty}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    width: itemSize,
    padding: 10,
    alignItems: 'center',
    marginHorizontal: 30,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  image: {
    width: itemSize - 20,
    height: itemSize - 20,
    borderRadius: 10,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  specialty: {
    color: '#666',
    fontSize: 14,
  },
});
