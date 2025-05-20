// screens/SettingsScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  SafeAreaView,
  Platform,
  Linking, // Para abrir enlaces
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../src/contexts/AuthContext"; // Para la opción de eliminar cuenta (conceptual)

// Colores del Manual de Marca
const BRAND_COLORS = {
  primary: "#1ABC9C",
  secondary: "#00BFFF",
  accent: "#FFCC33",
  neutralLight: "#E0E6ED",
  background: "#F4F7F9",
  cardBackground: "#FFFFFF",
  textDark: "#2C3E50",
  textLight: "#FFFFFF",
  error: "#E74C3C",
  placeholderText: "#AAB8C2",
  separator: "#EAEAEA",
  iconColor: "#546E7A",
};

// Componente reutilizable para cada opción de configuración
const SettingOption = ({ iconName, title, subtitle, onPress, type = "navigation", value, onValueChange, isDestructive = false }) => {
  return (
    <TouchableOpacity style={styles.optionContainer} onPress={onPress} disabled={type === 'toggle'}>
      <Ionicons 
        name={iconName} 
        size={24} 
        color={isDestructive ? BRAND_COLORS.error : BRAND_COLORS.primary} 
        style={styles.optionIcon} 
      />
      <View style={styles.optionTextContainer}>
        <Text style={[styles.optionTitle, isDestructive && styles.destructiveText]}>{title}</Text>
        {subtitle && <Text style={styles.optionSubtitle}>{subtitle}</Text>}
      </View>
      {type === "navigation" && !isDestructive && (
        <Ionicons name="chevron-forward-outline" size={22} color={BRAND_COLORS.placeholderText} />
      )}
      {type === "toggle" && (
        <Switch
          trackColor={{ false: BRAND_COLORS.neutralLight, true: BRAND_COLORS.primary + '70' }}
          thumbColor={value ? BRAND_COLORS.primary : BRAND_COLORS.background}
          ios_backgroundColor={BRAND_COLORS.neutralLight}
          onValueChange={onValueChange}
          value={value}
        />
      )}
    </TouchableOpacity>
  );
};

export default function SettingsScreen({ navigation }) {
  const { logout } = useAuth(); // Ejemplo, si necesitaras logout o info de usuario
  const [notificationsEnabled, setNotificationsEnabled] = useState(true); // Estado de ejemplo
  const [darkModeEnabled, setDarkModeEnabled] = useState(false); // Estado de ejemplo

  const handleDeleteAccount = () => {
    Alert.alert(
      "Eliminar Cuenta",
      "¿Estás seguro de que quieres eliminar tu cuenta permanentemente? Esta acción no se puede deshacer y todos tus datos se perderán.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí, Eliminar Cuenta",
          style: "destructive",
          onPress: () => {
            console.log("Lógica para eliminar cuenta aquí...");
            // Aquí iría la lógica para eliminar la cuenta del usuario de Firebase Auth y Firestore
            // Y luego, probablemente, logout() y navegar a la pantalla de inicio de sesión.
            Alert.alert("Cuenta Eliminada", "Tu cuenta ha sido eliminada (simulación).");
          },
        },
      ]
    );
  };

  // Obtener la versión de la app (ejemplo, necesitarías expo-application o similar)
  const appVersion = Platform.select({
    ios: () => "1.0.0 (Build 1)", // require('expo-application').nativeApplicationVersion,
    android: () => "1.0.0 (Build 1)", // require('expo-application').nativeApplicationVersion,
  })();


  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* <View style={styles.header}> // El header ya lo provee el StackNavigator
          <Text style={styles.headerTitle}>Configuración</Text>
        </View> */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notificaciones</Text>
          <View style={styles.optionsCard}>
            <SettingOption
              iconName="notifications-outline"
              title="Activar Notificaciones"
              type="toggle"
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cuenta</Text>
          <View style={styles.optionsCard}>
            <SettingOption
              iconName="lock-closed-outline"
              title="Cambiar Contraseña"
              onPress={() => Alert.alert("Próximamente", "La funcionalidad para cambiar contraseña estará disponible pronto.")}
            />
            <View style={styles.separator} />
            <SettingOption
              iconName="trash-bin-outline"
              title="Eliminar Cuenta"
              onPress={handleDeleteAccount}
              isDestructive
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Apariencia</Text>
          <View style={styles.optionsCard}>
            <SettingOption
              iconName="moon-outline"
              title="Modo Oscuro"
              type="toggle"
              value={darkModeEnabled}
              onValueChange={setDarkModeEnabled}
              subtitle={darkModeEnabled ? "Activado" : "Desactivado"}
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acerca de</Text>
          <View style={styles.optionsCard}>
            <SettingOption
              iconName="information-circle-outline"
              title="Versión de la App"
              subtitle={appVersion} 
              onPress={() => {}} // No hace nada al presionar, solo muestra info
              type="info" // Un tipo custom para que no muestre la flecha
            />
             <View style={styles.separator} />
            <SettingOption
              iconName="document-text-outline"
              title="Política de Privacidad"
              onPress={() => Linking.openURL('https://tuapp.com/privacidad')} // Reemplaza con tu URL real
            />
            <View style={styles.separator} />
            <SettingOption
              iconName="reader-outline"
              title="Términos de Servicio"
              onPress={() => Linking.openURL('https://tuapp.com/terminos')} // Reemplaza con tu URL real
            />
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BRAND_COLORS.background,
  },
  scrollContainer: {
    paddingBottom: 30,
  },
  // header: { // No es necesario si el StackNavigator ya tiene un header
  //   paddingVertical: 15,
  //   paddingHorizontal: 20,
  //   backgroundColor: BRAND_COLORS.cardBackground,
  //   borderBottomWidth: 1,
  //   borderBottomColor: BRAND_COLORS.separator,
  // },
  // headerTitle: {
  //   fontSize: 20,
  //   fontWeight: '600',
  //   color: BRAND_COLORS.textDark,
  //   textAlign: 'center',
  // },
  section: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: BRAND_COLORS.placeholderText, // Un color más sutil para títulos de sección
    textTransform: 'uppercase', // Mayúsculas para un look más de "setting"
    marginBottom: 10,
    marginLeft: 10, // Pequeño margen
  },
  optionsCard: {
    backgroundColor: BRAND_COLORS.cardBackground,
    borderRadius: 12,
    overflow: 'hidden', // Para que los separadores no se salgan
    elevation: 1, // Sombra muy sutil
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: BRAND_COLORS.cardBackground,
  },
  optionIcon: {
    marginRight: 15,
    width: 24, // Ancho fijo para alineación
    textAlign: 'center',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    color: BRAND_COLORS.textDark,
  },
  optionSubtitle: {
    fontSize: 13,
    color: BRAND_COLORS.placeholderText,
    marginTop: 2,
  },
  destructiveText: {
    color: BRAND_COLORS.error,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: BRAND_COLORS.separator,
    marginLeft: 54, // Alineado después del espacio del ícono (15 padding + 24 icon + 15 margin)
  },
});
