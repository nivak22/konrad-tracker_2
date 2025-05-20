// screens/HomeScreen.js
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Linking,
  Animated, // Para animaciones
  RefreshControl, // Para pull-to-refresh
  Platform,
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

// Colores del Manual de Marca (Asegúrate que sean los mismos de tus otros archivos)
const BRAND_COLORS = {
  primary: "#1ABC9C",
  secondary: "#00BFFF",
  accent: "#FFCC33",
  neutralLight: "#D3D3D3",
  background: "#F4F6F8",
  cardBackground: "#FFFFFF",
  textDark: "#4A4A4A",
  textLight: "#FFFFFF",
  error: "#E74C3C",
  success: "#2ECC71",
  placeholderText: "#A0A0A0",
  quoteBackground: "#E8F8F5", // Un fondo suave para la cita
};

// Frases inspiradoras (puedes expandir esta lista)
const motivationalQuotes = [
  { quote: "El conocimiento es poder, especialmente en la era digital.", author: "Tech Insider" },
  { quote: "La mejor manera de predecir el futuro es inventándolo.", author: "Alan Kay" },
  { quote: "Mantente curioso. Sigue aprendiendo. La tecnología no espera.", author: "Anónimo" },
  { quote: "Adapta tus hábitos, domina la tecnología.", author: "Tu App" },
  { quote: "Pequeños cambios hoy, grandes avances mañana.", author: "Filosofía de Hábitos" }
];

const NewsCard = React.memo(({ item, index, onPress }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      delay: index * 150, // Staggered animation
      useNativeDriver: true,
    }).start();
    Animated.timing(translateYAnim, {
      toValue: 0,
      duration: 500,
      delay: index * 150,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, translateYAnim, index]);

  const imageUrl = item.enclosure?.link || item.thumbnail; // Intentar con enclosure.link primero, luego thumbnail
  const placeholderImage = 'https://placehold.co/600x400/E0E0E0/B0B0B0?text=Noticia&font=roboto';

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch (e) {
      return dateString; // Devuelve la fecha original si hay error
    }
  };

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: translateYAnim }] }}>
      <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
        <Image
          source={{ uri: imageUrl || placeholderImage }}
          style={styles.image}
          onError={(e) => console.log("Error cargando imagen:", item.title, e.nativeEvent.error)} // Para depurar errores de imagen
        />
        <View style={styles.cardContent}>
          <Text style={styles.articleTitle} numberOfLines={3}>{item.title}</Text>
          <Text style={styles.articleDate}>{formatDate(item.pubDate)}</Text>
          <View style={styles.readMoreContainer}>
            <Text style={styles.readMoreText}>Leer más</Text>
            <Ionicons name="arrow-forward-circle-outline" size={20} color={BRAND_COLORS.primary} />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

const HomeScreen = () => {
  const [noticias, setNoticias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);

  const fetchNews = async () => {
    // Simulación de una API Key si fuera necesaria en el futuro.
    // Por ahora, rss2json.com no la requiere para este endpoint.
    // const API_KEY = 'TU_API_KEY_SI_ES_NECESARIA'; 
    const RSS_URL = 'https://www.eltiempo.com/rss/tecnosfera.xml'; // RSS de Tecnosfera El Tiempo
    // const RSS_URL_ALTERNATIVO = 'https://feeds.elpais.com/mrss-s/seccion.html?i=tecnologia'; // RSS El País Tecnología (ejemplo)
    
    try {
      const response = await axios.get(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}`);
      if (response.data && response.data.items) {
        setNoticias(response.data.items);
      } else {
        console.error('Formato de respuesta inesperado:', response.data);
        setNoticias([]); // Establecer a vacío si no hay items
      }
    } catch (error) {
      console.error('Error al obtener noticias:', error);
      // Aquí podrías mostrar un Toast de error al usuario
      setNoticias([]); // Asegurarse que noticias sea un array en caso de error
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };
  
  useEffect(() => {
    // Seleccionar una frase al azar al montar el componente
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    setSelectedQuote(motivationalQuotes[randomIndex]);
    fetchNews();
  }, []);

  const onRefresh = useCallback(() => {
    setRefrescando(true);
    // Seleccionar una nueva frase al refrescar
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    setSelectedQuote(motivationalQuotes[randomIndex]);
    fetchNews();
  }, []);

  const handleLinkPress = (url) => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log("No se puede abrir la URL: " + url);
        // Alert.alert("Error", "No se puede abrir este enlace.");
      }
    });
  };

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <Text style={styles.greetingText}>¡Hola de Nuevo!</Text>
      {selectedQuote && (
        <View style={styles.quoteCard}>
          <Ionicons name="bulb-outline" size={24} color={BRAND_COLORS.primary} style={styles.quoteIcon} />
          <View style={styles.quoteTextContainer}>
            <Text style={styles.quoteText}>"{selectedQuote.quote}"</Text>
            <Text style={styles.quoteAuthor}>- {selectedQuote.author}</Text>
          </View>
        </View>
      )}
      <Text style={styles.newsSectionTitle}>Explora lo Último en Tecnología</Text>
    </View>
  );

  if (cargando && noticias.length === 0) { // Mostrar carga inicial solo si no hay noticias
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.primary} />
          <Text style={styles.loadingText}>Descubriendo novedades...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={noticias}
        keyExtractor={(item, index) => item.guid || item.link || `news-${index}`} // Usar guid o link como key si están disponibles
        renderItem={({ item, index }) => (
          <NewsCard item={item} index={index} onPress={() => handleLinkPress(item.link)} />
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={onRefresh}
            colors={[BRAND_COLORS.primary]} // Color del spinner de refresco en Android
            tintColor={BRAND_COLORS.primary} // Color del spinner de refresco en iOS
          />
        }
        ListEmptyComponent={
          !cargando && ( // Mostrar solo si no está cargando y la lista está vacía
            <View style={styles.emptyNewsContainer}>
              <Ionicons name="cloud-offline-outline" size={60} color={BRAND_COLORS.placeholderText} />
              <Text style={styles.emptyNewsTitle}>¡Vaya! No hay noticias.</Text>
              <Text style={styles.emptyNewsSubtitle}>Parece que no pudimos cargar las novedades. Intenta refrescar la pantalla.</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BRAND_COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BRAND_COLORS.background,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: BRAND_COLORS.textDark,
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 25 : 15,
    paddingBottom: 20,
  },
  greetingText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: BRAND_COLORS.textDark,
    marginBottom: 15,
  },
  quoteCard: {
    backgroundColor: BRAND_COLORS.quoteBackground,
    borderRadius: 12,
    padding: 15,
    marginBottom: 25,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: BRAND_COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quoteIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  quoteTextContainer: {
    flex: 1,
  },
  quoteText: {
    fontSize: 15,
    color: BRAND_COLORS.textDark,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  quoteAuthor: {
    fontSize: 13,
    color: BRAND_COLORS.primary,
    textAlign: 'right',
    marginTop: 8,
    fontWeight: '500',
  },
  newsSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BRAND_COLORS.textDark,
    // marginBottom: 10, // Ajustado por padding de listContentContainer
  },
  listContentContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: BRAND_COLORS.cardBackground,
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden', // Para que la imagen no se salga de los bordes redondeados
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.09,
    shadowRadius: 6,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: 180, // Altura de imagen aumentada
    backgroundColor: BRAND_COLORS.neutralLight + '50', // Color de fondo mientras carga la imagen
  },
  cardContent: {
    padding: 15,
  },
  articleTitle: {
    fontSize: 17, // Ligeramente más pequeño para acomodar más texto
    fontWeight: '600', // Un poco menos bold que el título principal
    color: BRAND_COLORS.textDark,
    marginBottom: 8,
    lineHeight: 23,
  },
  articleDate: {
    fontSize: 12,
    color: BRAND_COLORS.placeholderText,
    marginBottom: 10,
  },
  readMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end', // Alinear a la derecha
    marginTop: 5,
  },
  readMoreText: {
    color: BRAND_COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
    marginRight: 5,
  },
  emptyNewsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    marginTop: 60, // Para que no quede pegado al header
  },
  emptyNewsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: BRAND_COLORS.textDark,
    marginTop: 15,
    textAlign: 'center',
  },
  emptyNewsSubtitle: {
    fontSize: 14,
    color: BRAND_COLORS.placeholderText,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  },
});

export default HomeScreen;
