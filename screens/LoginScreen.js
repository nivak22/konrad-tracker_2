// screens/LoginScreen.js
import React, { useState, useRef, useEffect } from 'react';
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
  Image, // Import Image for the logo
  Animated, // Import Animated
  Easing, // Import Easing for more animation control
  Dimensions, // To help with positioning geometric shapes
} from 'react-native';
import { useAuth } from '../src/contexts/AuthContext';

// Logo - assuming it's in the assets folder at the root of your project
const logoImage = require('../assets/logo.png'); // Adjust path if necessary

// Colores del Manual de Marca
const BRAND_COLORS = {
  primary: '#1ABC9C', // Verde Azulado Motivador
  secondary: '#00BFFF', // Azul Confianza
  accent: '#FFCC33', // Amarillo Energía
  neutralLight: '#D3D3D3', // Gris Neutro Claro
  background: '#FFFFFF', // Blanco Puro
  textDark: '#4A4A4A', // Gris Oscuro (para texto)
  textLight: '#FFFFFF', // Blanco (para texto sobre fondos oscuros)
  error: '#E74C3C', // Un rojo para errores
  geometricShape1: 'rgba(26, 188, 156, 0.15)', // Primary with opacity
  geometricShape2: 'rgba(0, 191, 255, 0.1)', // Secondary with opacity
};

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { login, loading } = useAuth();

  // Animation values
  const formOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const titleTranslateY = useRef(new Animated.Value(30)).current;

  const emailFocusAnim = useRef(new Animated.Value(0)).current;
  const passwordFocusAnim = useRef(new Animated.Value(0)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Initial animations for logo, title, and form
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.timing(titleTranslateY, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 700,
        delay: 200, // Start after logo and title begin animating
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [logoScale, titleTranslateY, formOpacity]);

  const handleFocus = (animValue) => {
    Animated.timing(animValue, {
      toValue: 1,
      duration: 200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false, // borderColor and shadowOpacity not supported by native driver
    }).start();
  };

  const handleBlur = (animValue) => {
    Animated.timing(animValue, {
      toValue: 0,
      duration: 250,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  };

  const handlePressIn = () => {
    Animated.spring(buttonScaleAnim, {
      toValue: 0.96,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScaleAnim, {
      toValue: 1,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

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
    } catch (err) {
      if (__DEV__) {
        console.log('Error en login:', err);
      }
      switch (err.code) {
        case 'auth/invalid-email':
          setError('El correo ingresado no es válido.');
          break;
        case 'auth/user-not-found':
        case 'auth/invalid-credential':
          setError('Correo o contraseña incorrectos.');
          break;
        case 'auth/wrong-password':
          setError('La contraseña es incorrecta.');
          break;
        case 'auth/too-many-requests':
          setError('Demasiados intentos. Inténtalo más tarde.');
          break;
        default:
          setError('Ocurrió un error al iniciar sesión.');
      }
    }
  };

  // Interpolations for input styles
  const inputStyleInterpolation = (animValue) => ({
    borderColor: animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [BRAND_COLORS.neutralLight, BRAND_COLORS.primary],
    }),
    shadowOpacity: animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0.2],
    }),
    shadowRadius: animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 4],
      }),
    transform: [{
        scale: animValue.interpolate({
            inputRange: [0,1],
            outputRange: [1, 1.02]
        })
    }]
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Geometric Background Elements */}
        <View style={styles.geometricBackground}>
          <View style={[styles.shape, styles.shape1]} />
          <View style={[styles.shape, styles.shape2]} />
          <View style={[styles.shape, styles.shape3]} />
        </View>

        <View style={styles.scrollContainer}>
            <View style={styles.innerContainer}>
                <Animated.Image
                source={logoImage}
                style={[styles.logo, { transform: [{ scale: logoScale }] }]}
                resizeMode="contain"
                />

                <Animated.Text style={[styles.title, { transform: [{ translateY: titleTranslateY }] }]}>
                Iniciar Sesión
                </Animated.Text>

                <Animated.View style={{opacity: formOpacity, width: '100%', alignItems: 'center'}}>
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <Animated.View style={[styles.inputContainer, inputStyleInterpolation(emailFocusAnim)]}>
                        <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor={BRAND_COLORS.neutralLight}
                        value={email}
                        onChangeText={handleEmailChange}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        textContentType="emailAddress"
                        onFocus={() => handleFocus(emailFocusAnim)}
                        onBlur={() => handleBlur(emailFocusAnim)}
                        />
                    </Animated.View>

                    <Animated.View style={[styles.inputContainer, inputStyleInterpolation(passwordFocusAnim)]}>
                        <TextInput
                        style={styles.input}
                        placeholder="Contraseña"
                        placeholderTextColor={BRAND_COLORS.neutralLight}
                        value={password}
                        onChangeText={handlePasswordChange}
                        secureTextEntry
                        textContentType="password"
                        onFocus={() => handleFocus(passwordFocusAnim)}
                        onBlur={() => handleBlur(passwordFocusAnim)}
                        />
                    </Animated.View>

                    <TouchableOpacity
                        activeOpacity={0.8} // Control visual feedback
                        style={styles.buttonWrapper}
                        onPress={handleLogin}
                        disabled={loading}
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                    >
                        <Animated.View style={[styles.button, {transform: [{scale: buttonScaleAnim}]}]}>
                        {loading ? (
                            <ActivityIndicator size="small" color={BRAND_COLORS.textLight} />
                        ) : (
                            <Text style={styles.buttonText}>Iniciar Sesión</Text>
                        )}
                        </Animated.View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => navigation.navigate('SignUp')}
                        style={styles.linkButton}
                    >
                        <Text style={styles.linkText}>
                        ¿No tienes cuenta? <Text style={styles.linkTextHighlight}>Regístrate aquí</Text>
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </View>
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
  scrollContainer: { // Added for potential future scrolling if content grows
    flex: 1,
    justifyContent: 'center', // Center content vertically
  },
  innerContainer: {
    alignItems: 'center', // Center content horizontally
    paddingHorizontal: 30,
    paddingBottom: 20, // Padding at the bottom
  },
  logo: {
    width: width * 0.35, // Responsive logo size
    height: width * 0.35,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '600', // Slightly less bold for minimalist feel
    color: BRAND_COLORS.textDark,
    marginBottom: 25,
    textAlign: 'center',
  },
  inputContainer: { // Container for input to apply animated border/shadow
    width: '100%',
    backgroundColor: BRAND_COLORS.background,
    borderRadius: 12, // More rounded corners
    borderWidth: 1.5, // Base border width
    marginBottom: 18,
    shadowColor: BRAND_COLORS.primary, // Shadow color for focus effect
    shadowOffset: { width: 0, height: 0 },
    elevation: 2, // For Android shadow (subtle)
  },
  input: {
    height: 55, // Slightly taller inputs
    paddingHorizontal: 20,
    fontSize: 16,
    color: BRAND_COLORS.textDark,
    // Border is now handled by inputContainer
  },
  buttonWrapper: { // Wrapper for TouchableOpacity to easily apply scale transform
    width: '100%',
    marginTop: 15,
  },
  button: {
    backgroundColor: BRAND_COLORS.primary,
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: BRAND_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: BRAND_COLORS.textLight,
    fontSize: 17,
    fontWeight: '600',
  },
  errorText: {
    color: BRAND_COLORS.error,
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 14,
    paddingHorizontal: 10, // Ensure error text doesn't overflow on small screens
  },
  linkButton: {
    marginTop: 25,
    paddingVertical: 10,
  },
  linkText: {
    color: BRAND_COLORS.textDark,
    textAlign: 'center',
    fontSize: 15,
  },
  linkTextHighlight: { // For the "Regístrate aquí" part
    color: BRAND_COLORS.secondary,
    fontWeight: 'bold',
  },
  // Geometric Background Styles
  geometricBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    overflow: 'hidden', // Hide parts of shapes outside the screen
    zIndex: -1, // Ensure it's behind all other content
  },
  shape: {
    position: 'absolute',
    borderRadius: 30, // Rounded corners for softer geometric shapes
  },
  shape1: {
    width: width * 0.8,
    height: width * 0.8,
    backgroundColor: BRAND_COLORS.geometricShape1,
    top: -width * 0.2,
    left: -width * 0.3,
    transform: [{ rotate: '-30deg' }],
  },
  shape2: {
    width: width * 0.7,
    height: width * 0.7,
    backgroundColor: BRAND_COLORS.geometricShape2,
    bottom: -width * 0.25,
    right: -width * 0.35,
    transform: [{ rotate: '45deg' }],
  },
  shape3: { // A smaller accent shape
    width: width * 0.4,
    height: width * 0.4,
    backgroundColor: BRAND_COLORS.accent + '1A', // Accent color with low opacity (hex: #FFCC331A)
    top: height * 0.3,
    right: -width * 0.1,
    transform: [{ rotate: '15deg' }],
  },
});

export default LoginScreen;
