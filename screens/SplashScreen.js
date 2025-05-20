// screens/SplashScreen.js
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Image } from 'react-native'; // Importar Image

// Asegúrate de que la ruta a tu logo sea correcta.
// Si tu logo está en ./assets/images/logo.png, la ruta sería: require('../assets/images/logo.png')
// Por ahora, asumimos que está en ./assets/logo.png relativo a la raíz del proyecto.
// React Native maneja las diferentes densidades de píxeles automáticamente si provees
// imágenes como logo@2x.png, logo@3x.png en la misma carpeta.
const logoImage = require('../assets/logo.png'); // ¡IMPORTANTE! Ajusta esta ruta

const SplashScreen = ({ onAnimationEnd }) => {
  // Ref para el valor de la animación de opacidad
  const fadeAnim = useRef(new Animated.Value(0)).current;
  // Ref para el valor de la animación de escala (opcional, para un efecto sutil)
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Secuencia de animación:
    // 1. Fade in del logo y texto
    // 2. Escala sutil del logo (opcional)
    // 3. Pausa
    // 4. Fade out de toda la pantalla
    Animated.sequence([
      Animated.parallel([ // Animaciones que ocurren al mismo tiempo
        Animated.timing(fadeAnim, {
          toValue: 1, // Opacidad final
          duration: 1000, // Duración del fade in
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1, // Escala final
          duration: 1200, // Duración de la animación de escala
          easing: Easing.out(Easing.ease), // Un easing suave
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(2500), // Pausa aumentada a 2.5 segundos (antes 1500)
      Animated.timing(fadeAnim, { // Fade out
        toValue: 0,
        duration: 500, // Duración del fade out
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onAnimationEnd) {
        onAnimationEnd(); // Llama a la función cuando la animación termina
      }
    });
  }, [fadeAnim, scaleAnim, onAnimationEnd]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Animated.Image // Cambiado de Animated.View a Animated.Image para animar la imagen directamente
        source={logoImage}
        style={[
          styles.logo,
          { transform: [{ scale: scaleAnim }] } // Aplicar la animación de escala
        ]}
        resizeMode="contain" // Asegura que el logo se vea bien sin cortarse
      />
      <Text style={styles.appName}>Tu App de Hábitos</Text>
      {/* Reemplaza "Tu App de Hábitos" si tienes un nombre definido y no está en el logo */}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // Fondo blanco según tu manual
  },
  logo: {
    width: 150, // Ajusta el ancho según el tamaño de tu logo
    height: 150, // Ajusta la altura según el tamaño de tu logo
    marginBottom: 20, // Espacio entre el logo y el nombre de la app
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A4A4A', // Gris oscuro para el texto, según manual
    // marginTop: 0, // Ajustar si el logo ya tiene el nombre o si se ve mejor sin margen superior
  },
});

export default SplashScreen;
