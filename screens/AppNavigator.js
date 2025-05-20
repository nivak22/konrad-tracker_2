import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, ActivityIndicator, StyleSheet, Button, Platform } from "react-native"; // Añadido Platform
import { useAuth } from "../src/contexts/AuthContext";

// Importar los iconos
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// Importar la nueva SplashScreen
import SplashScreen from "./SplashScreen"; // Asegúrate que la ruta sea correcta

import LoginScreen from "./LoginScreen";
import SignUpScreen from "./SignUpScreen";
import HomeScreen from "./HomeScreen";
import HabitsScreen from "./HabitsScreen";
import CreateHabitScreen from "./CreateHabitScreen";
import EditHabitScreen from "./EditHabitScreen";
import ProfileScreen from "./ProfileScreen";
import ChatGPTScreen from "./ChatGPTScreen";
import SettingsScreen from "./SettingsScreen"; // Asegúrate que la ruta sea correcta

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Colores del Manual de Marca (puedes centralizarlos en un archivo si los usas en más lugares)
const BRAND_COLORS = {
  primary: '#1ABC9C',
  secondary: '#00BFFF',
  neutralLight: '#D3D3D3', // Usado en tabBarStyle y podría usarse en otros bordes
  textDark: '#4A4A4A', // Para texto sobre fondos claros
  textLight: '#FFFFFF', // Para texto sobre fondos oscuros (como el header)
  tabBarActive: '#1ABC9C', 
  tabBarInactive: '#B0BEC5', 
  error: '#E74C3C', // Para el texto de error
};


function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // headerShown: true, // El header de las pestañas se mostrará por defecto.
                          // Si quieres un header global para el Stack, puedes ponerlo en false aquí
                          // y dejar que el Stack.Navigator lo maneje.
                          // Por ahora, lo dejamos para que cada pestaña tenga su propio header.
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let IconComponent = Ionicons;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Mis Hábitos') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'ChatGPT') {
            IconComponent = MaterialCommunityIcons;
            iconName = focused ? 'brain' : 'brain'; 
          } else if (route.name === 'Perfil') { // El nombre aquí debe coincidir con el de Tab.Screen
            iconName = focused ? 'person-circle' : 'person-circle-outline';
          }
          return <IconComponent name={iconName} size={focused ? size + 2 : size} color={color} />;
        },
        tabBarActiveTintColor: BRAND_COLORS.tabBarActive,
        tabBarInactiveTintColor: BRAND_COLORS.tabBarInactive,
        tabBarStyle: {
          backgroundColor: BRAND_COLORS.textLight, // Fondo blanco para la barra de pestañas
          borderTopColor: BRAND_COLORS.neutralLight, 
          borderTopWidth: Platform.OS === 'android' ? 0 : 0.5, // Sin borde en Android, sutil en iOS
          // paddingBottom: Platform.OS === 'ios' ? 20 : 0, 
          // height: Platform.OS === 'ios' ? 90 : 70, 
        },
        tabBarLabelStyle: {
          fontSize: 11, 
          fontWeight: '500', 
          // paddingBottom: Platform.OS === 'ios' ? 0 : 5, 
        },
        headerStyle: {
          backgroundColor: BRAND_COLORS.primary, 
        },
        headerTintColor: BRAND_COLORS.textLight, 
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: "Inicio" }}/>
      <Tab.Screen name="Mis Hábitos" component={HabitsScreen} options={{ title: "Mis Hábitos" }}/>
      <Tab.Screen name="ChatGPT" component={ChatGPTScreen} options={{ title: "Asistente IA" }}/>
      <Tab.Screen name="Perfil" component={ProfileScreen} options={{ title: "Mi Perfil" }} /> 
      {/* Asegúrate que el nombre "Perfil" coincida con el usado en tabBarIcon */}
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { currentUser, loading: authLoading, authError } = useAuth(); 
  const [isAppReady, setIsAppReady] = useState(false); 

  useEffect(() => {
    // Lógica de inicialización de la app si es necesaria
  }, []);

  const handleSplashAnimationEnd = () => {
    setIsAppReady(true); 
  };

  if (!isAppReady) {
    return <SplashScreen onAnimationEnd={handleSplashAnimationEnd} />;
  }

  if (authLoading) {
    return (
      <View style={styles.centeredView}>
        <ActivityIndicator size="large" color={BRAND_COLORS.primary} />
        <Text style={[styles.statusText, {color: BRAND_COLORS.textDark}]}>Verificando sesión...</Text>
      </View>
    );
  }

  if (authError) {
    return (
      <View style={styles.centeredViewWithPadding}>
        <Text style={[styles.errorTitleText, {color: BRAND_COLORS.error}]}>
          Error de Conexión
        </Text>
        <Text style={[styles.errorText, {color: BRAND_COLORS.textDark}]}>{authError}</Text>
        <Button 
          title="Reintentar" 
          onPress={() => {
            // Idealmente, aquí llamarías a una función en tu AuthContext para reintentar la inicialización.
            // Por ejemplo: authContext.retryInitialization();
            // Como fallback, o si no tienes esa función, podrías forzar un reload en desarrollo web:
            if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location && window.location.reload) {
               window.location.reload();
            } else {
                // En móvil, recargar no es una opción directa. Podrías pedir al usuario que reinicie la app.
                Alert.alert("Error de conexión", "Por favor, verifica tu conexión e intenta reiniciar la aplicación.");
            }
          }}
          color={BRAND_COLORS.primary}
        />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ // Opciones globales para el StackNavigator
          headerStyle: {
            backgroundColor: BRAND_COLORS.primary,
          },
          headerTintColor: BRAND_COLORS.textLight,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerBackTitleVisible: false, // Ocultar texto de "Atrás" en iOS
        }}
      >
        {currentUser ? (
          <>
            <Stack.Screen
              name="MainTabs"
              component={MainTabs}
              options={{ headerShown: false }} // Ocultar el header del Stack para MainTabs, ya que Tab.Navigator tiene el suyo
            />
            <Stack.Screen
              name="CreateHabit"
              component={CreateHabitScreen}
              options={{ title: "Crear Hábito" }}
            />
            <Stack.Screen 
              name="EditHabit" 
              component={EditHabitScreen} 
              options={{ title: "Editar Hábito" }}
            />
            {/* AÑADIR SettingsScreen AQUÍ */}
            <Stack.Screen
              name="SettingsScreen"
              component={SettingsScreen}
              options={{ title: "Configuración" }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="SignUp"
              component={SignUpScreen}
              options={{ headerShown: false }} // Consistente con Login
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BRAND_COLORS.textLight, 
  },
  statusText: {
    marginTop: 15,
    fontSize: 16,
  },
  centeredViewWithPadding: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
    backgroundColor: BRAND_COLORS.textLight, 
  },
  errorTitleText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: "center",
    marginBottom: 15,
  },
  errorText: {
    textAlign: "center",
    marginBottom: 20,
    fontSize: 16,
    lineHeight: 22,
  }
});

export default AppNavigator;
