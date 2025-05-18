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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../src/contexts/AuthContext'; // Ajusta la ruta según tu estructura

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
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.cancelled) {
      setPhotoUri(result.uri);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword || !nombre || !apellidos || !fechaNacimiento || !cedula || !descripcion) {
      setError('Por favor completa todos los campos');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setError('');

      // Aquí debes adaptar el registro para que también guarde los datos adicionales
      // Por ejemplo, puedes modificar la función register para que acepte un objeto con estos datos
      await register(email, password, {
        nombre,
        apellidos,
        fechaNacimiento,
        cedula,
        descripcion,
        photoUri, // Podrías subir esta imagen a Firebase Storage y guardar la URL aquí
      });

      // La navegación se manejará automáticamente en App.js

    } catch (err) {
      setError(err.message || 'Error al registrar usuario');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.innerContainer}>
          <Text style={styles.title}>Crear Cuenta</Text>
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Foto */}
          <TouchableOpacity style={styles.photoPicker} onPress={pickImage}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photo} />
            ) : (
              <Text style={styles.photoPlaceholder}>Selecciona una foto</Text>
            )}
          </TouchableOpacity>
          
          {/* Campos nuevos */}
          <TextInput
            style={styles.input}
            placeholder="Nombre"
            value={nombre}
            onChangeText={setNombre}
          />
          <TextInput
            style={styles.input}
            placeholder="Apellidos"
            value={apellidos}
            onChangeText={setApellidos}
          />
          <TextInput
            style={styles.input}
            placeholder="Fecha de nacimiento (YYYY-MM-DD)"
            value={fechaNacimiento}
            onChangeText={setFechaNacimiento}
          />
          <TextInput
            style={styles.input}
            placeholder="Cédula"
            value={cedula}
            onChangeText={setCedula}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, {height: 80}]}
            placeholder="Descripción general"
            value={descripcion}
            onChangeText={setDescripcion}
            multiline
          />

          {/* Campos anteriores */}
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TextInput
            style={styles.input}
            placeholder="Confirmar Contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          
          <TouchableOpacity 
            style={styles.button}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Registrarse</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.linkText}>
              ¿Ya tienes cuenta? Inicia sesión aquí
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardView: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'white',
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#007bff',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
  linkText: {
    color: '#007bff',
    textAlign: 'center',
    marginTop: 20,
  },
  photoPicker: {
    backgroundColor: '#e1e1e1',
    height: 100,
    width: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    alignSelf: 'center',
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  photoPlaceholder: {
    color: '#777',
    textAlign: 'center',
  },
});

export default SignUpScreen;
