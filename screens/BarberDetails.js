/**
 * BarberDetails — Full-page screen showing a single barber's profile.
 *
 * Features:
 * - Large header image of the barber
 * - Animated bottom drawer (collapsible sheet) that expands/collapses
 * - Displays barber's info, pricing, description, and portfolio images
 * - CTA button to navigate to "MakeAppointment" screen with the barber's ID
 *
 * Animation:
 * - Drawer height transitions between 40% and 90% of screen height
 * - Triggered by a "See Portfolio" / "Close Portfolio" button
 */


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
import AppLayout from '../components/appLayout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWindowDimensions } from 'react-native';





export default function BarberDetails() {

  const { height: SCREEN_HEIGHT } =  useWindowDimensions();

  // Get barber data from route params
  const route = useRoute();
  const { barber } = route.params;
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const COLLAPSED_HEIGHT = SCREEN_HEIGHT * 0.4;
  const EXPANDED_HEIGHT  = SCREEN_HEIGHT * 0.86;

  React.useEffect(() => {
    drawerHeight.setValue(expanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT);
  }, [SCREEN_HEIGHT, expanded]);
  

  const COLLAPSED_BOTTOM = insets.bottom + 30; // ≈ footer height
  const EXPANDED_BOTTOM  = insets.bottom + 15; // tiny breathing room


  // Animated drawer height starts at 40% of screen height
  const drawerHeight = useRef(new Animated.Value(COLLAPSED_HEIGHT)).current;
  const drawerBottom = useRef(new Animated.Value(COLLAPSED_BOTTOM)).current;
  const [expanded, setExpanded] = useState(false);

  // Toggle between collapsed (40%) and expanded (90%) drawer heights
  const toggleDrawer = () => {
    const next = !expanded;
    Animated.parallel([
      Animated.timing(drawerHeight, {
        toValue: next ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT,
        duration: 250,
        useNativeDriver: false,
      }),
      Animated.timing(drawerBottom, {
        toValue: next ? EXPANDED_BOTTOM : COLLAPSED_BOTTOM,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start();
    setExpanded(next);
  };

  return (
    <AppLayout>
    <View style={styles.container}>
      <Image source={barber.image} style={styles.image} />

      <Animated.View style={[styles.drawer, { height: drawerHeight, bottom: drawerBottom}]}>
        <ScrollView 
        contentContainerStyle={styles.sheetContent}
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
            onPress={() => navigation.navigate('MakeAppointment', { barberId: barber.id })}
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
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: '40%',
    resizeMode: 'cover',
  },
  drawer: {
    position: 'absolute',
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
    fontWeight: '600',
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
