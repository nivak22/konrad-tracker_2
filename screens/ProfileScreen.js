// screens/ProfileScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button, // Mantendremos el Button original, pero lo estilizaremos donde sea posible o usaremos TouchableOpacity
  Alert,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity, // Para botones más personalizables
  SafeAreaView, // Para mejor layout en iOS
  Platform,
} from "react-native";
import { useAuth } from "../src/contexts/AuthContext"; // Asegúrate que la ruta es correcta
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // getAuth se usa en tu código original
import { Ionicons } from "@expo/vector-icons"; // Para iconos

// Colores del Manual de Marca
const BRAND_COLORS = {
  primary: "#1ABC9C",
  secondary: "#00BFFF",
  accent: "#FFCC33",
  neutralLight: "#E0E6ED", // Un gris más claro para fondos o bordes sutiles
  background: "#F4F7F9", // Fondo general de la app
  cardBackground: "#FFFFFF", // Para elementos tipo tarjeta
  textDark: "#2C3E50", // Texto oscuro principal
  textLight: "#FFFFFF", // Texto claro sobre fondos oscuros
  error: "#E74C3C", // Rojo para errores o botones destructivos
  placeholderText: "#AAB8C2", // Para placeholders o texto secundario
  separator: "#EAEAEA",
};

export default function ProfileScreen({ navigation }) { // Añadir navigation como prop
  const { logout, currentUser } = useAuth(); // Usar currentUser del contexto
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // const authInstance = getAuth(); // Renombrado en versiones anteriores, pero tu original usa auth directamente
  const auth = getAuth(); // Manteniendo tu variable original
  const db = getFirestore();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) { // Verificar si auth.currentUser existe
        console.log("ProfileScreen: No hay usuario autenticado (auth.currentUser es null).");
        setLoading(false);
        setUserData(null); // Asegurar que userData sea null
        return;
      }
      try {
        const uid = auth.currentUser.uid;
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          console.log("No se encontró información del usuario");
          setUserData({}); // Establecer a objeto vacío para evitar errores con userData?.
        }
      } catch (error) {
        console.error("Error al obtener datos de usuario:", error);
        Alert.alert("Error", "No se pudo cargar la información del usuario.");
        setUserData({}); // Establecer a objeto vacío en caso de error
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [auth.currentUser]); // Depender de auth.currentUser para recargar si cambia

  const handleSignOut = async () => {
    try {
      await logout();
      console.log("Sesión cerrada exitosamente");
      // La navegación a Login es manejada por AppNavigator
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      Alert.alert("Error", "Hubo un problema al cerrar sesión.");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeAreaLoading}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.primary} />
          <Text style={styles.loadingText}>Cargando Perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerCard}>
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person-circle-outline" size={80} color={BRAND_COLORS.primary} />
          </View>
          <Text style={styles.profileTitle}>Mi Perfil</Text>
          <Text style={styles.profileName}>
            {userData?.nombre || "Nombre no disponible"} {userData?.apellidos || ""}
          </Text>
          <Text style={styles.profileEmail}>{currentUser?.email}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Información Adicional</Text>
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={20} color={BRAND_COLORS.primary} style={styles.infoIcon} />
            <Text style={styles.infoLabel}>Fecha de nacimiento:</Text>
            <Text style={styles.infoValue}>{userData?.fechaNacimiento || "No especificado"}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.infoItem}>
            <Ionicons name="card-outline" size={20} color={BRAND_COLORS.primary} style={styles.infoIcon} />
            <Text style={styles.infoLabel}>Cédula:</Text>
            <Text style={styles.infoValue}>{userData?.cedula || "No especificado"}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.infoItem}>
            <Ionicons name="document-text-outline" size={20} color={BRAND_COLORS.primary} style={styles.infoIcon} />
            <Text style={styles.infoLabel}>Descripción:</Text>
          </View>
          <Text style={styles.descriptionValue}>{userData?.descripcion || "Sin descripción."}</Text>
        </View>

        <TouchableOpacity
          style={[styles.actionButton, styles.settingsButton]}
          onPress={() => navigation.navigate('SettingsScreen')} // Navegación a Configuración
        >
          <Ionicons name="settings-outline" size={22} color={BRAND_COLORS.textLight} />
          <Text style={styles.actionButtonText}>Configuración</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.signOutButton]}
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={22} color={BRAND_COLORS.textLight} />
          <Text style={styles.actionButtonText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BRAND_COLORS.background,
  },
  safeAreaLoading: { // Estilo para SafeAreaView cuando está cargando
    flex: 1,
    backgroundColor: BRAND_COLORS.background, // Puede ser el mismo o uno diferente
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    alignItems: "center", // Centrar el contenido del ScrollView
  },
  loadingContainer: { // Contenedor para el ActivityIndicator
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: BRAND_COLORS.textDark,
  },
  headerCard: {
    backgroundColor: BRAND_COLORS.cardBackground,
    borderRadius: 15,
    padding: 25,
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: BRAND_COLORS.neutralLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileTitle: { // Reemplaza tu 'title'
    fontSize: 26,
    fontWeight: "bold",
    color: BRAND_COLORS.textDark,
    marginBottom: 5, // Menos margen si el nombre va después
  },
  profileName: { // Reemplaza tu 'name'
    fontSize: 20,
    fontWeight: "600",
    color: BRAND_COLORS.primary, // Color primario para el nombre
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 15,
    color: BRAND_COLORS.placeholderText,
    marginBottom: 15,
  },
  infoCard: {
    backgroundColor: BRAND_COLORS.cardBackground,
    borderRadius: 15,
    padding: 20,
    width: "100%",
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: BRAND_COLORS.textDark,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: BRAND_COLORS.separator,
    paddingBottom: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoIcon: {
    marginRight: 12,
  },
  infoLabel: { // Reemplaza tu 'info' para la etiqueta
    fontSize: 16,
    color: BRAND_COLORS.textDark,
    fontWeight: '500',
  },
  infoValue: { // Para el valor del dato
    fontSize: 16,
    color: BRAND_COLORS.placeholderText,
    flex: 1, // Para que se alinee a la derecha si hay espacio
    textAlign: 'right',
  },
  descriptionValue: { // Reemplaza tu 'description'
    fontSize: 15,
    color: BRAND_COLORS.textDark,
    fontStyle: "italic",
    marginTop: 8,
    lineHeight: 22,
    opacity: 0.8,
  },
  separator: {
    height: 1,
    backgroundColor: BRAND_COLORS.separator,
    marginVertical: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 25, // Botones más redondeados
    width: "90%", // Ancho del botón
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  settingsButton: {
    backgroundColor: BRAND_COLORS.secondary, // Color secundario para Configuración
  },
  signOutButton: {
    backgroundColor: BRAND_COLORS.error, // Color de error para Cerrar Sesión
  },
  actionButtonText: {
    color: BRAND_COLORS.textLight,
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
});
