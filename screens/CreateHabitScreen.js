// screens/CreateHabitScreen.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  Switch,
  Platform,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Animated,
  Easing,
} from "react-native";
import { db, auth } from "../src/firebaseConfig"; // Asegúrate que la ruta es correcta
import { collection, addDoc } from "firebase/firestore";
import Toast from "react-native-toast-message"; // Sigue siendo útil para errores o feedback rápido
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Notifications from "expo-notifications";
import { Ionicons } from "@expo/vector-icons"; // Para iconos

// Colores del Manual de Marca
const BRAND_COLORS = {
  primary: "#1ABC9C", // Verde Azulado Motivador
  secondary: "#00BFFF", // Azul Confianza
  accent: "#FFCC33", // Amarillo Energía
  neutralLight: "#D3D3D3", // Gris Neutro Claro
  background: "#FFFFFF", // Blanco Puro
  textDark: "#4A4A4A", // Gris Oscuro (para texto)
  textLight: "#FFFFFF", // Blanco (para texto sobre fondos oscuros)
  error: "#E74C3C", // Un rojo para errores
  success: "#2ECC71", // Un verde para éxito
  placeholderText: "#A0A0A0",
  inputBackground: "#F0F0F0", // Un fondo muy claro para inputs
};

// Componente reutilizable para botones de selección de fecha/hora
const DateTimePickerButton = ({ onPress, title, value, iconName }) => (
  <TouchableOpacity style={styles.dateTimePickerButton} onPress={onPress}>
    <Ionicons name={iconName} size={22} color={BRAND_COLORS.primary} style={styles.dateTimePickerButtonIcon} />
    <Text style={styles.dateTimePickerButtonTitle}>{title}</Text>
    <Text style={styles.dateTimePickerButtonValue}>{value}</Text>
  </TouchableOpacity>
);

export default function CreateHabitScreen({ navigation }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [endDate, setEndDate] = useState(new Date());
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [isIndefinite, setIsIndefinite] = useState(false);
  const [notificationTime, setNotificationTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current; // Para la animación de éxito

  useEffect(() => {
    // Animación de entrada para la pantalla
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const triggerSuccessAnimation = () => {
    // Muestra el overlay de éxito
    setShowSuccessOverlay(true);
    Animated.spring(successAnim, {
      toValue: 1,
      friction: 5, // Controla el "rebote" de la animación de resorte
      useNativeDriver: true,
    }).start();

    // Después de 2 segundos, oculta el overlay y navega hacia atrás
    setTimeout(() => {
      Animated.timing(successAnim, {
        toValue: 0,
        duration: 300, // Duración del desvanecimiento
        easing: Easing.in(Easing.ease), // Easing para la salida
        useNativeDriver: true,
      }).start(() => {
        setShowSuccessOverlay(false);
        navigation.goBack(); // Navega a la pantalla anterior (debería ser HabitsScreen)
      });
    }, 2000); // Duración en milisegundos que el overlay de éxito es visible
  };

  const handleSaveHabit = async () => {
    // Validaciones básicas
    if (!name.trim()) {
      Toast.show({ type: "error", text1: "Nombre del Hábito", text2: "El nombre es obligatorio." });
      return;
    }
    if (!isIndefinite && !endDate) {
      Toast.show({ type: "error", text1: "Fecha de Finalización", text2: "Selecciona una fecha o marca como indefinido." });
      return;
    }

    try {
      const userId = auth.currentUser.uid;
      const habitData = {
        name: name.trim(),
        description: description.trim(),
        endDate: isIndefinite ? null : endDate.toISOString(),
        isIndefinite,
        notificationTime: notificationTime.toISOString(),
        createdAt: new Date().toISOString(),
        status: "active",
        daysCompleted: {},
      };

      await addDoc(collection(db, "users", userId, "habits"), habitData);

      // Programar notificación
      if (Platform.OS !== "web") {
        try {
            const { status } = await Notifications.getPermissionsAsync();
            if (status === 'granted') {
                await Notifications.scheduleNotificationAsync({
                    content: {
                    title: `Recordatorio: ${habitData.name}`,
                    body: habitData.description || "¡Es hora de tu hábito!",
                    sound: 'default',
                    },
                    trigger: {
                    hour: notificationTime.getHours(),
                    minute: notificationTime.getMinutes(),
                    repeats: true,
                    },
                });
            } else {
                console.log("Permiso de notificaciones no concedido.");
                // Considera mostrar un Toast.info aquí si el permiso no está concedido
            }
        } catch (notifError) {
            console.error("Error al programar notificación:", notifError);
            Toast.show({ type: "info", text1: "Notificación", text2: "No se pudo programar el recordatorio." });
        }
      }
      triggerSuccessAnimation(); // Llama a la animación de éxito y posterior navegación
    } catch (error) {
      console.error("Error al guardar el hábito:", error);
      Toast.show({ type: "error", text1: "Error", text2: "No se pudo guardar el hábito." });
    }
  };

  const onEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setNotificationTime(selectedTime);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          <Text style={styles.headerTitle}>Crear Nuevo Hábito</Text>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre del Hábito</Text>
              <TextInput
                placeholder="Ej: Leer 30 minutos"
                style={styles.input}
                placeholderTextColor={BRAND_COLORS.placeholderText}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Descripción (Opcional)</Text>
              <TextInput
                placeholder="Ej: Leer un libro de desarrollo personal"
                style={[styles.input, styles.textArea]}
                placeholderTextColor={BRAND_COLORS.placeholderText}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.label}>¿Hábito Indefinido?</Text>
              <Switch
                trackColor={{ false: BRAND_COLORS.neutralLight, true: BRAND_COLORS.primary + '70' }}
                thumbColor={isIndefinite ? BRAND_COLORS.primary : BRAND_COLORS.background}
                ios_backgroundColor={BRAND_COLORS.neutralLight}
                onValueChange={setIsIndefinite}
                value={isIndefinite}
                style={styles.switchElement}
              />
            </View>

            {!isIndefinite && (
              <Animated.View style={styles.inputGroup}>
                <Text style={styles.label}>Fecha de Finalización</Text>
                <DateTimePickerButton
                  title="Seleccionar Fecha"
                  value={endDate.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                  onPress={() => setShowEndDatePicker(true)}
                  iconName="calendar-outline"
                />
                {showEndDatePicker && (
                  <DateTimePicker
                    value={endDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    minimumDate={new Date()}
                    onChange={onEndDateChange}
                    locale="es-ES"
                  />
                )}
              </Animated.View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Hora de Recordatorio</Text>
               <DateTimePickerButton
                  title="Seleccionar Hora"
                  value={notificationTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  onPress={() => setShowTimePicker(true)}
                  iconName="alarm-outline"
                />
              {showTimePicker && (
                <DateTimePicker
                  value={notificationTime}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  is24Hour={false}
                  onChange={onTimeChange}
                />
              )}
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveHabit}>
              <Ionicons name="checkmark-circle-outline" size={24} color={BRAND_COLORS.textLight} />
              <Text style={styles.saveButtonText}>Guardar Hábito</Text>
            </TouchableOpacity>

          </ScrollView>
        </Animated.View>
        
        {/* Overlay de Éxito */}
        {showSuccessOverlay && (
          <Animated.View style={[styles.successOverlay, { transform: [{ scale: successAnim }] }]}>
            <Ionicons name="checkmark-circle" size={80} color={BRAND_COLORS.textLight} />
            <Text style={styles.successOverlayText}>¡Hábito Creado con Éxito!</Text>
          </Animated.View>
        )}

      </KeyboardAvoidingView>
      <Toast config={toastConfig} />
    </SafeAreaView>
  );
}

// Configuración personalizada para Toast (opcional, pero recomendado para consistencia)
const toastConfig = {
  success: ({ text1, text2, ...rest }) => (
    <View style={styles.toastBase}>
      <Ionicons name="checkmark-circle" size={24} color={BRAND_COLORS.success} style={{marginRight: 10}}/>
      <View>
        <Text style={styles.toastText1}>{text1}</Text>
        {text2 && <Text style={styles.toastText2}>{text2}</Text>}
      </View>
    </View>
  ),
  error: ({ text1, text2, ...rest }) => (
    <View style={styles.toastBase}>
      <Ionicons name="alert-circle" size={24} color={BRAND_COLORS.error} style={{marginRight: 10}}/>
      <View>
        <Text style={styles.toastText1}>{text1}</Text>
        {text2 && <Text style={styles.toastText2}>{text2}</Text>}
      </View>
    </View>
  ),
  info: ({ text1, text2, ...rest }) => (
     <View style={styles.toastBase}>
      <Ionicons name="information-circle" size={24} color={BRAND_COLORS.secondary} style={{marginRight: 10}}/>
      <View>
        <Text style={styles.toastText1}>{text1}</Text>
        {text2 && <Text style={styles.toastText2}>{text2}</Text>}
      </View>
    </View>
  )
};

// Estilos (similares a EditHabitScreen para consistencia)
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BRAND_COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 0,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: BRAND_COLORS.textDark,
    textAlign: "center",
    marginVertical: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: BRAND_COLORS.textDark,
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    backgroundColor: BRAND_COLORS.inputBackground,
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: BRAND_COLORS.textDark,
    borderWidth: 1,
    borderColor: BRAND_COLORS.neutralLight,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: 15,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    marginBottom: 10,
    backgroundColor: BRAND_COLORS.inputBackground,
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  switchElement:{
    transform: Platform.OS === 'ios' ? [] : [{ scaleX: 1.2 }, { scaleY: 1.2 }]
  },
  dateTimePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND_COLORS.inputBackground,
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BRAND_COLORS.neutralLight,
  },
  dateTimePickerButtonIcon: {
    marginRight: 10,
  },
  dateTimePickerButtonTitle: {
    fontSize: 16,
    color: BRAND_COLORS.primary,
    fontWeight: '500',
    flex: 1,
  },
  dateTimePickerButtonValue: {
    fontSize: 16,
    color: BRAND_COLORS.textDark,
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: BRAND_COLORS.primary, // Color primario para "Crear"
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    shadowColor: BRAND_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  saveButtonText: {
    color: BRAND_COLORS.textLight,
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: BRAND_COLORS.primary + 'E6', // Color primario con opacidad para "Crear"
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  successOverlayText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: BRAND_COLORS.textLight,
    marginTop: 15,
  },
  toastBase: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: BRAND_COLORS.background,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    borderLeftWidth: 5,
    borderLeftColor: BRAND_COLORS.primary, 
  },
  toastText1: {
    fontSize: 15,
    fontWeight: 'bold',
    color: BRAND_COLORS.textDark,
  },
  toastText2: {
    fontSize: 13,
    color: BRAND_COLORS.textDark,
  },
});
