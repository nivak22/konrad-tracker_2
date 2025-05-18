// screens/LoginScreen.js
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
  SafeAreaView
} from 'react-native';
import { useAuth } from '../src/contexts/AuthContext';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login, loading } = useAuth();

  const handleEmailChange = (text) => {
    setEmail(text);
    if (error) setError('');
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (error) setError('');
  };

  const handleLogin = async () => {
  if (!email || !password) {
    setError('Por favor ingresa email y contraseña');
    return;
  }

  try {
    setError('');
    await login(email, password);
    //navigation.replace('Home');
  } catch (err) {
    if (__DEV__) {
  console.log('Error en login:', err);
}


    // Manejo personalizado según el código de error de Firebase
    switch (err.code) {
      case 'auth/invalid-email':
        setError('El correo ingresado no es válido.');
        break;
      case 'auth/user-not-found':
        setError('No existe ninguna cuenta con este correo.');
        break;
      case 'auth/wrong-password':
        setError('La contraseña es incorrecta.');
        break;
      case 'auth/too-many-requests':
        setError('Demasiados intentos fallidos. Inténtalo más tarde.');
        break;
      default:
        setError('Ocurrió un error al iniciar sesión.');
    }
  }
};



  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.innerContainer}>
          <Text style={styles.title}>Iniciar Sesión</Text>
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={handleEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            value={password}
            onChangeText={handlePasswordChange}
            secureTextEntry
          />
          
          <TouchableOpacity 
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => navigation.navigate('SignUp')}
          >
            <Text style={styles.linkText}>
              ¿No tienes cuenta? Regístrate aquí
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
});

export default LoginScreen;
