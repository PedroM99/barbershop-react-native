import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');


export default function BarberDetails() {
  const route = useRoute();
  const { barber } = route.params;
  const navigation = useNavigation();

  const drawerHeight = useRef(new Animated.Value(SCREEN_HEIGHT * 0.4)).current;
  const [expanded, setExpanded] = useState(false);

  const toggleDrawer = () => {
    const newHeight = expanded ? SCREEN_HEIGHT * 0.4 : SCREEN_HEIGHT * 0.9;

    Animated.timing(drawerHeight, {
      toValue: newHeight,
      duration: 300,
      useNativeDriver: false,
    }).start();

    setExpanded(!expanded);
  };

  return (
    <View style={styles.container}>
      <Image source={barber.image} style={styles.image} />

      <Animated.View style={[styles.drawer, { height: drawerHeight }]}>
        <ScrollView contentContainerStyle={styles.sheetContent}
        showsVerticalScrollIndicator={false}
        >
          <Pressable onPress={toggleDrawer} style={styles.expandButton}>
            <Text style={styles.expandButtonText}>
              {expanded ? 'Close Portfolio' : 'See Portfolio'}
              </Text>
          </Pressable>

                    <Text style={styles.name}>{barber.name}</Text>
          <Text style={styles.specialty}>{barber.specialty}</Text>
          <Text style={styles.price}>Haircut: {barber.prices.haircut}</Text>
          <Text style={styles.price}>Haircut + Beard: {barber.prices.haircutBeard}</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{barber.description}</Text>
          </View>

           <Pressable
            style={styles.button}
            onPress={() => navigation.navigate('MakeAppointment', { barberId: barber.id, userId: 'user1' })}
           >
            <Text style={styles.buttonText}>Make Appointment</Text>
           </Pressable>

          {expanded && barber.portfolio?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Portfolio</Text>
    
              <ScrollView
              style={styles.portfolioScroll}
              contentContainerStyle={styles.portfolioContent}
              showsVerticalScrollIndicator={false}
              >
              {barber.portfolio.map((img, index) => (
              <Image key={index} source={img} style={styles.portfolioImage} />
              ))}
              </ScrollView>
            </View>
          )}

          
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: '50%',
    resizeMode: 'cover',
  },
  drawer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  sheetContent: {
    padding: 20,
    paddingBottom: 40,
  },
  expandButton: {
    backgroundColor: '#222', // dark background for contrast
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    alignSelf: 'center',
  },
  expandButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: 600,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  specialty: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  price: {
    fontSize: 14,
    color: '#333',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: '#444',
  },
  portfolioImage: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 10,
  },
  button: {
    marginTop: 30,
    backgroundColor: '#222',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  
  portfolioScroll: {
  flexGrow: 1,        // Let it grow vertically
  minHeight: 0,       // Prevent cutoff
  marginTop: 10,
},
portfolioContent: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
},

portfolioImage: {
  width: '48%',
  aspectRatio: 1,
  borderRadius: 10,
  marginBottom: 10,
},
});
