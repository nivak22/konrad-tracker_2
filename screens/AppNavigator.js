import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Button, View, Text, ActivityIndicator } from "react-native";
import { useAuth } from "../src/contexts/AuthContext";


import LoginScreen from "./LoginScreen";
import SignUpScreen from "./SignUpScreen";
import HomeScreen from "./HomeScreen";
import HabitsScreen from "./HabitsScreen";
import CreateHabitScreen from "./CreateHabitScreen";
import EditHabitScreen from "./EditHabitScreen";
import ProfileScreen from "./ProfileScreen";
import ChatGPTScreen from "./ChatGPTScreen";


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
screenOptions={{
        headerShown: true,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Mis Hábitos" component={HabitsScreen} />
      <Tab.Screen name="ChatGPT" component={ChatGPTScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { currentUser, loading, authError, logout } = useAuth();

  useEffect(() => {
    // Configuración de notificaciones si quieres
  }, []);

  const handleSignOut = async () => {
    try {
      await logout();
      console.log("Sesión cerrada exitosamente");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{ marginTop: 10 }}>Inicializando aplicación...</Text>
      </View>
    );
  }

  if (authError) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <Text
          style={{ color: "red", fontSize: 18, textAlign: "center", marginBottom: 15 }}
        >
          Error de inicialización
        </Text>
        <Text style={{ textAlign: "center", marginBottom: 20 }}>{authError}</Text>
        <Button title="Reintentar" onPress={() => window.location.reload()} />
      </View>
    );
  }

  return (
    <NavigationContainer>
  <Stack.Navigator>
    {currentUser ? (
      <>
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CreateHabit"
          component={CreateHabitScreen}
          options={{ title: "Crear Hábito" }}
        />
        <Stack.Screen name="EditHabit" component={EditHabitScreen} />

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
          options={{ headerShown: false }}
        />
      </>
    )}
  </Stack.Navigator>
</NavigationContainer>

  );
}

export default AppNavigator;
