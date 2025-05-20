// screens/HabitsScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert, // Para la confirmación de eliminación
  LayoutAnimation, // Para animaciones sutiles en la lista
  UIManager, // Necesario para LayoutAnimation en Android
  Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { collection, query, onSnapshot, deleteDoc, doc, orderBy } from 'firebase/firestore'; // orderBy para ordenar hábitos
import { db } from '../src/firebaseConfig'; // Asegúrate que la ruta es correcta
import { useAuth } from '../src/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

// Habilitar LayoutAnimation para Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Colores del Manual de Marca
const BRAND_COLORS = {
  primary: "#1ABC9C",
  secondary: "#00BFFF",
  accent: "#FFCC33",
  neutralLight: "#D3D3D3",
  background: "#F4F6F8", // Un fondo ligeramente diferente para pantallas con listas
  cardBackground: "#FFFFFF",
  textDark: "#4A4A4A",
  textLight: "#FFFFFF",
  error: "#E74C3C",
  success: "#2ECC71",
  placeholderText: "#A0A0A0",
  disabled: "#B0BEC5",
};

const HabitItem = React.memo(({ item, onEdit, onDelete }) => {
  // Formatear la fecha de finalización si existe y no es indefinido
  const getEndDateString = () => {
    if (item.isIndefinite) {
      return "Sin fecha límite";
    }
    if (item.endDate) {
      const date = item.endDate.seconds ? new Date(item.endDate.seconds * 1000) : new Date(item.endDate);
      return `Finaliza: ${date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}`;
    }
    return "Fecha no definida";
  };

  return (
    <View style={styles.habitCard}>
      <View style={styles.habitInfo}>
        <Text style={styles.habitTitle}>{item.name}</Text>
        {item.description ? <Text style={styles.habitDescription}>{item.description}</Text> : null}
        <Text style={styles.habitEndDate}>{getEndDateString()}</Text>
      </View>
      <View style={styles.habitActions}>
        <TouchableOpacity onPress={onEdit} style={[styles.actionButton, styles.editButton]}>
          <Ionicons name="pencil-outline" size={20} color={BRAND_COLORS.secondary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={[styles.actionButton, styles.deleteButton]}>
          <Ionicons name="trash-outline" size={20} color={BRAND_COLORS.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
});

const HabitsScreen = () => {
  const navigation = useNavigation();
  const { currentUser } = useAuth();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect( // Se ejecuta cada vez que la pantalla entra en foco
    useCallback(() => {
      if (!currentUser) {
        setLoading(false);
        setHabits([]); // Limpiar hábitos si no hay usuario
        return;
      }

      setLoading(true);
      const habitsQuery = query(
        collection(db, 'users', currentUser.uid, 'habits'),
        orderBy('createdAt', 'desc') // Ordenar por fecha de creación, los más nuevos primero
      );

      const unsubscribe = onSnapshot(habitsQuery, (querySnapshot) => {
        const habitsData = [];
        querySnapshot.forEach((doc) => {
          habitsData.push({ id: doc.id, ...doc.data() });
        });
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); // Animación al actualizar la lista
        setHabits(habitsData);
        setLoading(false);
      }, (error) => {
        console.error("Error al obtener hábitos: ", error);
        setLoading(false);
        // Aquí podrías mostrar un Toast de error
      });

      return () => unsubscribe(); // Limpiar el listener al salir de la pantalla o perder el foco
    }, [currentUser])
  );

  const handleDelete = (id, name) => {
    Alert.alert(
      "Eliminar Hábito",
      `¿Estás seguro de que quieres eliminar "${name}"? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'users', currentUser.uid, 'habits', id));
              // La lista se actualizará automáticamente gracias a onSnapshot
              // Toast.show({ type: 'success', text1: 'Hábito eliminado' }); // Opcional
            } catch (error) {
              console.error('Error eliminando hábito: ', error);
              // Toast.show({ type: 'error', text1: 'Error al eliminar' }); // Opcional
            }
          },
        },
      ]
    );
  };

  const renderHabitItem = ({ item }) => (
    <HabitItem
      item={item}
      onEdit={() => navigation.navigate('EditHabit', { habit: { ...item, userId: currentUser.uid } })}
      onDelete={() => handleDelete(item.id, item.name)}
    />
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={BRAND_COLORS.primary} />
        <Text style={styles.loadingText}>Cargando tus hábitos...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
            <Text style={styles.mainTitle}>Mis Hábitos</Text>
            <Text style={styles.subtitle}>Construye la mejor versión de ti, un día a la vez.</Text>
        </View>

        <FlatList
          data={habits}
          keyExtractor={(item) => item.id}
          renderItem={renderHabitItem}
          contentContainerStyle={styles.listContentContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="leaf-outline" size={60} color={BRAND_COLORS.placeholderText} />
              <Text style={styles.emptyTitle}>Aún no hay hábitos aquí</Text>
              <Text style={styles.emptySubtitle}>
                ¡Es un gran día para empezar algo nuevo! Presiona el botón '+' para crear tu primer hábito.
              </Text>
            </View>
          }
        />

        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('CreateHabit')}
        >
          <Ionicons name="add-outline" size={32} color={BRAND_COLORS.textLight} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BRAND_COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: BRAND_COLORS.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: BRAND_COLORS.textDark,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 25 : 15,
    paddingBottom: 15,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: BRAND_COLORS.textDark,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: BRAND_COLORS.textDark,
    textAlign: 'center',
    marginTop: 5,
    opacity: 0.7,
  },
  listContentContainer: {
    paddingHorizontal: 15,
    paddingBottom: 80, // Espacio para el FAB
  },
  habitCard: {
    backgroundColor: BRAND_COLORS.cardBackground,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  habitInfo: {
    flex: 1,
    marginRight: 10,
  },
  habitTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: BRAND_COLORS.textDark,
    marginBottom: 4,
  },
  habitDescription: {
    fontSize: 14,
    color: BRAND_COLORS.textDark,
    opacity: 0.7,
    marginBottom: 6,
  },
  habitEndDate: {
    fontSize: 12,
    color: BRAND_COLORS.primary,
    fontStyle: 'italic',
  },
  habitActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 20, // Hacerlos circulares
  },
  editButton: {
    // backgroundColor: BRAND_COLORS.secondary + '20', // Fondo sutil opcional
  },
  deleteButton: {
    // backgroundColor: BRAND_COLORS.error + '20', // Fondo sutil opcional
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    marginTop: 50,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: BRAND_COLORS.textDark,
    marginTop: 15,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: BRAND_COLORS.placeholderText,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    right: 25,
    bottom: 25,
    backgroundColor: BRAND_COLORS.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
});

export default HabitsScreen;
