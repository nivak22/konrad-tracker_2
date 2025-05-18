import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut, 
  createUserWithEmailAndPassword 
} from "firebase/auth";
import { auth, db } from '../firebaseConfig'; // <-- importa db desde tu config
import { doc, setDoc } from "firebase/firestore"; // <-- firestore
import Toast from "react-native-toast-message";

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Escucha cambios de sesión
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Login
  const login = async (email, password) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Toast.show({ type: 'success', text1: 'Inicio de sesión exitoso' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error de inicio de sesión', text2: error.message });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Registro con datos adicionales
  const register = async (email, password, additionalData) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Crear documento en la colección "users"
      await setDoc(doc(db, "users", user.uid), {
        nombre: additionalData.nombre,
        apellidos: additionalData.apellidos,
        fechaNacimiento: additionalData.fechaNacimiento,
        cedula: additionalData.cedula,
        descripcion: additionalData.descripcion,
        email: email,
        createdAt: new Date()
      });

      Toast.show({ type: 'success', text1: 'Usuario registrado' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error de registro', text2: error.message });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      Toast.show({ type: 'success', text1: 'Sesión cerrada' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error al cerrar sesión', text2: error.message });
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = !!currentUser;

  const value = {
    currentUser,
    login,
    logout,
    register,
    isAuthenticated,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
