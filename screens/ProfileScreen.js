import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Button, Alert, ActivityIndicator, ScrollView } from "react-native";
import { useAuth } from "../src/contexts/AuthContext";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default function ProfileScreen() {
  const { logout } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const uid = auth.currentUser.uid;
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          console.log("No se encontró información del usuario");
        }
      } catch (error) {
        console.error("Error al obtener datos de usuario:", error);
        Alert.alert("Error", "No se pudo cargar la información del usuario.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSignOut = async () => {
    try {
      await logout();
      console.log("Sesión cerrada exitosamente");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      Alert.alert("Error", "Hubo un problema al cerrar sesión.");
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Mi Perfil</Text>

      <Text style={styles.name}>{userData?.nombre} {userData?.apellidos}</Text>
      <Text style={styles.info}>Fecha de nacimiento: {userData?.fechaNacimiento}</Text>
      <Text style={styles.info}>Cédula: {userData?.cedula}</Text>
      <Text style={styles.description}>{userData?.descripcion}</Text>

      <View style={{ marginTop: 30, width: "100%" }}>
        <Button title="Cerrar sesión" color="#d9534f" onPress={handleSignOut} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    flexGrow: 1,
    alignItems: "center",
  },
  center: {
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    marginTop: 15,
    fontStyle: "italic",
    textAlign: "center",
  },
});
