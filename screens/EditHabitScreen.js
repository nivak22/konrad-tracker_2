// screens/EditHabitScreen.js
import React, { useState, useEffect, useRef } from 'react';
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
} from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../src/firebaseConfig'; // Asegúrate que la ruta es correcta
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

// Colores del Manual de Marca (los mismos que en CreateHabitScreen)
const BRAND_COLORS = {
  primary: "#1ABC9C",
  secondary: "#00BFFF",
  accent: "#FFCC33",
  neutralLight: "#D3D3D3",
  background: "#FFFFFF",
  textDark: "#4A4A4A",
  textLight: "#FFFFFF",
  error: "#E74C3C",
  success: "#2ECC71",
  placeholderText: "#A0A0A0",
  inputBackground: "#F0F0F0",
};

// Componente reutilizable para botones de selección de fecha/hora (igual que en CreateHabitScreen)
const DateTimePickerButton = ({ onPress, title, value, iconName }) => (
  <TouchableOpacity style={styles.dateTimePickerButton} onPress={onPress}>
    <Ionicons name={iconName} size={22} color={BRAND_COLORS.primary} style={styles.dateTimePickerButtonIcon} />
    <Text style={styles.dateTimePickerButtonTitle}>{title}</Text>
    <Text style={styles.dateTimePickerButtonValue}>{value}</Text>
  </TouchableOpacity>
);

export default function EditHabitScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { habit } = route.params; // Recibe el hábito completo, incluyendo su ID y userId

  // Inicializar estados con los datos del hábito
  // Convertir Timestamps de Firestore a objetos Date de JavaScript
  const initialEndDate = habit.endDate && habit.endDate.seconds ? new Date(habit.endDate.seconds * 1000 + (habit.endDate.nanoseconds || 0) / 1000000) : new Date();
  const initialNotificationTime = habit.notificationTime && habit.notificationTime.seconds ? new Date(habit.notificationTime.seconds * 1000 + (habit.notificationTime.nanoseconds || 0) / 1000000) : new Date();

  const [name, setName] = useState(habit.name);
  const [description, setDescription] = useState(habit.description || ""); // Asegurar que no sea undefined
  const [endDate, setEndDate] = useState(initialEndDate);
  const [isIndefinite, setIsIndefinite] = useState(habit.isIndefinite);
  const [notificationTime, setNotificationTime] = useState(initialNotificationTime);
  
  const [showEndDatePicker, setShowEndDatePicker] = useState(false); // Renombrado para claridad
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

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
      friction: 5,
      useNativeDriver: true,
    }).start();

    // Después de 2 segundos, oculta el overlay y navega hacia atrás
    setTimeout(() => {
      Animated.timing(successAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        setShowSuccessOverlay(false);
        navigation.goBack();
      });
    }, 2000);
  };

  const handleUpdateHabit = async () => {
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
      // Asegúrate de que `habit.userId` y `habit.id` estén disponibles.
      // Si `habit` viene directamente de Firestore, `habit.id` es el ID del documento.
      // `userId` debería ser parte del objeto `habit` o recuperado de `auth.currentUser.uid` si es el mismo usuario.
      // Para este ejemplo, asumimos que `habit.userId` está en el objeto `habit` que pasas por params.
      // Si no, necesitarías obtener el `userId` actual: const userId = auth.currentUser.uid;
      const habitRef = doc(db, 'users', habit.userId || auth.currentUser.uid, 'habits', habit.id);
      
      const updatedData = {
        name: name.trim(),
        description: description.trim(),
        endDate: isIndefinite ? null : endDate.toISOString(),
        isIndefinite,
        notificationTime: notificationTime.toISOString(),
        // No actualizamos createdAt, status o daysCompleted aquí, a menos que sea necesario
      };

      await updateDoc(habitRef, updatedData);
      
      // Aquí podrías re-programar las notificaciones si la hora cambió.
      // Por simplicidad, este ejemplo no lo incluye, pero sería similar a CreateHabitScreen.
      // Sería importante cancelar la notificación anterior y programar una nueva.

      triggerSuccessAnimation(); // Muestra feedback visual y navega
    } catch (error) {
      console.error('Error actualizando hábito: ', error);
      Toast.show({ type: "error", text1: "Error", text2: "No se pudo actualizar el hábito." });
    }
  };

  // Manejadores para los DateTimePicker
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
          <Text style={styles.headerTitle}>Editar Hábito</Text>
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

            <TouchableOpacity style={styles.saveButton} onPress={handleUpdateHabit}>
              <Ionicons name="save-outline" size={24} color={BRAND_COLORS.textLight} />
              <Text style={styles.saveButtonText}>Actualizar Hábito</Text>
            </TouchableOpacity>

          </ScrollView>
        </Animated.View>
        
        {showSuccessOverlay && (
          <Animated.View style={[styles.successOverlay, { transform: [{ scale: successAnim }] }]}>
            <Ionicons name="checkmark-circle" size={80} color={BRAND_COLORS.textLight} />
            <Text style={styles.successOverlayText}>¡Hábito Actualizado!</Text>
          </Animated.View>
        )}

      </KeyboardAvoidingView>
      <Toast config={toastConfig} />
    </SafeAreaView>
  );
}

// Configuración de Toast (igual que en CreateHabitScreen)
const toastConfig = {
  success: ({ text1, text2 }) => (
    <View style={styles.toastBase}>
      <Ionicons name="checkmark-circle" size={24} color={BRAND_COLORS.success} style={{marginRight: 10}}/>
      <View>
        <Text style={styles.toastText1}>{text1}</Text>
        {text2 && <Text style={styles.toastText2}>{text2}</Text>}
      </View>
    </View>
  ),
  error: ({ text1, text2 }) => (
    <View style={styles.toastBase}>
      <Ionicons name="alert-circle" size={24} color={BRAND_COLORS.error} style={{marginRight: 10}}/>
      <View>
        <Text style={styles.toastText1}>{text1}</Text>
        {text2 && <Text style={styles.toastText2}>{text2}</Text>}
      </View>
    </View>
  ),
  info: ({ text1, text2 }) => (
     <View style={styles.toastBase}>
      <Ionicons name="information-circle" size={24} color={BRAND_COLORS.secondary} style={{marginRight: 10}}/>
      <View>
        <Text style={styles.toastText1}>{text1}</Text>
        {text2 && <Text style={styles.toastText2}>{text2}</Text>}
      </View>
    </View>
  )
};

// Estilos (similares a CreateHabitScreen para consistencia)
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
    backgroundColor: BRAND_COLORS.secondary, // Usar color secundario para diferenciar de "Crear"
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    shadowColor: BRAND_COLORS.secondary,
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
    backgroundColor: BRAND_COLORS.secondary + 'E6', // Usar color secundario con opacidad
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
