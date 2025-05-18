import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import * as Linking from 'expo-linking';

const HomeScreen = () => {
  const [noticias, setNoticias] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerNoticias();
  }, []);

  const obtenerNoticias = async () => {
    try {
      const response = await axios.get('https://api.rss2json.com/v1/api.json?rss_url=https://www.eltiempo.com/rss/tecnosfera.xml');
      setNoticias(response.data.items);
    } catch (error) {
      console.error('Error al obtener noticias:', error);
    } finally {
      setCargando(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {item.enclosures && item.enclosures[0] && item.enclosures[0].url ? (
        <Image source={{ uri: item.enclosures[0].url }} style={styles.image} />
      ) : null}

      <Text style={styles.articleTitle}>{item.title}</Text>
      <Text>{item.pubDate}</Text>

      <TouchableOpacity
        onPress={() => Linking.openURL(item.link)}  // 👉 Aquí se abre el navegador con el link de la noticia
      >
        <Text style={styles.readMore}>Ver más</Text>
      </TouchableOpacity>
    </View>
  );

  if (cargando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Cargando noticias...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={noticias}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  readMore: {
    color: '#007bff',
    marginTop: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;
