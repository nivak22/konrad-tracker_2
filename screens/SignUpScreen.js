// screens/SignUpScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Image,
  ScrollView, // Import ScrollView for longer forms
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../src/contexts/AuthContext'; // Ajusta la ruta según tu estructura
import { Ionicons } from '@expo/vector-icons'; // For a placeholder icon

// Colores del Manual de Marca (los mismos que en LoginScreen)
const BRAND_COLORS = {
  primary: '#1ABC9C', // Verde Azulado Motivador
  secondary: '#00BFFF', // Azul Confianza
  accent: '#FFCC33', // Amarillo Energía
  neutralLight: '#D3D3D3', // Gris Neutro Claro
  background: '#FFFFFF', // Blanco Puro
  textDark: '#4A4A4A', // Gris Oscuro (para texto)
  textLight: '#FFFFFF', // Blanco (para texto sobre fondos oscuros)
  error: '#E74C3C', // Un rojo para errores
  placeholderText: '#A0A0A0', // Un gris más suave para placeholders
};

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  // Nuevos campos
  const [photoUri, setPhotoUri] = useState(null);
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [cedula, setCedula] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const { register, loading } = useAuth();

  // Función para seleccionar imagen
  const pickImage = async () => {
    // Solicitar permisos si es necesario (especialmente en web o si no se han concedido)
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Lo sentimos, necesitamos permisos de la galería para que esto funcione.');
        return;
      }
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Mantener el aspect ratio cuadrado
      quality: 0.5, // Reducir calidad para optimizar subida y almacenamiento
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
      if (error) setError(''); // Limpiar error si la selección es exitosa
    }
  };

  const handleSignUp = async () => {
    // Limpiar errores previos
    setError('');

    const fields = [
      { value: nombre, name: "Nombre" },
      { value: apellidos, name: "Apellidos" },
      { value: fechaNacimiento, name: "Fecha de nacimiento" },
      { value: cedula, name: "Cédula" },
      { value: email, name: "Email" },
      { value: password, name: "Contraseña" },
      { value: confirmPassword, name: "Confirmar contraseña" },
      // photoUri y descripción pueden ser opcionales, ajustar según necesidad
    ];

    for (const field of fields) {
      if (!field.value.trim()) {
        setError(`El campo "${field.name}" es obligatorio.`);
        return;
      }
    }
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    // Validación simple de formato de fecha (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(fechaNacimiento)) {
        setError('El formato de la fecha de nacimiento debe ser YYYY-MM-DD.');
        return;
    }

    try {
      await register(email, password, {
        nombre: nombre.trim(),
        apellidos: apellidos.trim(),
        fechaNacimiento: fechaNacimiento.trim(),
        cedula: cedula.trim(),
        descripcion: descripcion.trim(),
        photoUri, // La lógica para subir la imagen a Firebase Storage y guardar la URL
                  // debe estar dentro de tu función `register` en AuthContext.
      });
      // La navegación se maneja automáticamente en AppNavigator basado en currentUser
    } catch (err) {
      if (err.code) {
        switch (err.code) {
          case 'auth/email-already-in-use':
            setError('Este correo electrónico ya está en uso.');
            break;
          case 'auth/invalid-email':
            setError('El formato del correo electrónico no es válido.');
            break;
          case 'auth/weak-password':
            setError('La contraseña es demasiado débil.');
            break;
          default:
            setError('Ocurrió un error al registrar la cuenta.');
        }
      } else {
        setError(err.message || 'Error al registrar usuario.');
      }
      console.error("Error en SignUp: ", err);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled" // Permite tocar elementos fuera del input para cerrar teclado
        >
          <View style={styles.innerContainer}>
            <Text style={styles.title}>Crear Cuenta</Text>
            
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity style={styles.photoPicker} onPress={pickImage}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.photo} />
              ) : (
                <View style={styles.photoPlaceholderContainer}>
                  <Ionicons name="camera-outline" size={30} color={BRAND_COLORS.placeholderText} />
                  <Text style={styles.photoPlaceholderText}>Subir foto</Text>
                </View>
              )}
            </TouchableOpacity>
            
            <TextInput
              style={styles.input}
              placeholder="Nombre"
              placeholderTextColor={BRAND_COLORS.placeholderText}
              value={nombre}
              onChangeText={setNombre}
              autoCapitalize="words"
            />
            <TextInput
              style={styles.input}
              placeholder="Apellidos"
              placeholderTextColor={BRAND_COLORS.placeholderText}
              value={apellidos}
              onChangeText={setApellidos}
              autoCapitalize="words"
            />
            <TextInput
              style={styles.input}
              placeholder="Fecha de nacimiento (YYYY-MM-DD)"
              placeholderTextColor={BRAND_COLORS.placeholderText}
              value={fechaNacimiento}
              onChangeText={setFechaNacimiento}
            />
            <TextInput
              style={styles.input}
              placeholder="Cédula"
              placeholderTextColor={BRAND_COLORS.placeholderText}
              value={cedula}
              onChangeText={setCedula}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descripción breve (opcional)"
              placeholderTextColor={BRAND_COLORS.placeholderText}
              value={descripcion}
              onChangeText={setDescripcion}
              multiline
              numberOfLines={3}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={BRAND_COLORS.placeholderText}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              textContentType="emailAddress"
            />
            <TextInput
              style={styles.input}
              placeholder="Contraseña (mín. 6 caracteres)"
              placeholderTextColor={BRAND_COLORS.placeholderText}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType="newPassword" // Ayuda al autocompletado
            />
            <TextInput
              style={styles.input}
              placeholder="Confirmar Contraseña"
              placeholderTextColor={BRAND_COLORS.placeholderText}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              textContentType="newPassword"
            />
            
            <TouchableOpacity 
              style={styles.button}
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={BRAND_COLORS.textLight} />
              ) : (
                <Text style={styles.buttonText}>Registrarse</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.linkText}>
                ¿Ya tienes cuenta? <Text style={styles.linkTextHighlight}>Inicia sesión</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BRAND_COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: { // Para permitir scroll si el contenido excede la pantalla
    flexGrow: 1,
    justifyContent: 'center',
  },
  innerContainer: {
    paddingHorizontal: 25,
    paddingVertical: 20, // Espacio arriba y abajo
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: BRAND_COLORS.textDark,
    marginBottom: 20, // Reducido un poco
    textAlign: 'center',
  },
  photoPicker: {
    height: 110,
    width: 110,
    borderRadius: 55, // Para hacerlo circular
    backgroundColor: BRAND_COLORS.neutralLight + '50', // Gris claro con opacidad
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center', // Centrar el picker
    marginBottom: 25,
    borderWidth: 1.5,
    borderColor: BRAND_COLORS.neutralLight,
    overflow: 'hidden', // Para que la imagen no se salga del círculo
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderText: {
    color: BRAND_COLORS.placeholderText,
    fontSize: 13,
    marginTop: 5,
  },
  input: {
    backgroundColor: BRAND_COLORS.background,
    height: 50,
    borderRadius: 10, // Bordes más redondeados
    borderWidth: 1,
    borderColor: BRAND_COLORS.neutralLight,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: BRAND_COLORS.textDark,
  },
  textArea: {
    height: 80, // Altura para el campo de descripción
    textAlignVertical: 'top', // Para que el texto empiece arriba en Android
    paddingTop: 15, // Padding superior para multiline
  },
  button: {
    backgroundColor: BRAND_COLORS.primary,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10, // Espacio antes del botón
    shadowColor: BRAND_COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: BRAND_COLORS.textLight,
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: BRAND_COLORS.error,
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 14,
  },
  linkButton: {
    marginTop: 20,
    paddingVertical: 10,
  },
  linkText: {
    color: BRAND_COLORS.textDark,
    textAlign: 'center',
    fontSize: 15,
  },
  linkTextHighlight: {
    color: BRAND_COLORS.secondary, // Azul Confianza para el enlace
    fontWeight: 'bold',
  },
});

export default SignUpScreen;
