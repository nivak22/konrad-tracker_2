// screens/ChatScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Button,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ⛔ API KEY directa — solo para pruebas ⚠️
// Asegúrate de que esta KEY sea válida y tenga los permisos necesarios.
// Considera moverla a un backend para producción.
const OPENAI_API_KEY = '';

// Colores del Manual de Marca adaptados para un look futurista
const BRAND_COLORS = {
  primary: "#1ABC9C",
  secondary: "#00BFFF",
  accent: "#FFCC33",
  neutralLight: "#E0E6ED",
  background: "#F4F7F9",
  cardBackground: "#FFFFFF",
  textDark: "#2C3E50",
  textLight: "#FFFFFF",
  error: "#E74C3C",
  placeholderText: "#AAB8C2",
  chatScreenBackground: "#E8EFF5",
  userBubble: "#1ABC9C",
  userBubbleText: "#FFFFFF",
  assistantBubble: "#FFFFFF",
  assistantBubbleText: "#34495E",
  assistantAvatarBg: "transparent",
  assistantAvatarIconColor: "#00BFFF",
  inputAreaBackground: "#FFFFFF",
  inputBorder: "#DDE3E9",
  sendButton: "#00BFFF",
  sendButtonDisabled: "#B3E5FC",
  sendButtonIcon: "#FFFFFF",
  timestampText: "#90A4AE",
  headerTitleColor: "#2C3E50",
};

// Componente para cada burbuja de mensaje
const MessageBubble = React.memo(({ message }) => {
  const isUser = message.role === 'user';

  const formatTimestamp = (date) => {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View
      style={[
        styles.messageRow,
        isUser ? styles.userMessageRow : styles.assistantMessageRow,
      ]}
    >
      {!isUser && (
        <View style={styles.avatarContainer}>
          <Ionicons name="planet-outline" size={24} color={BRAND_COLORS.assistantAvatarIconColor} />
        </View>
      )}
      <View style={isUser ? styles.userBubbleWrapper : styles.assistantBubbleWrapper}>
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.assistantBubble,
          ]}
        >
          <Text style={isUser ? styles.userMessageText : styles.assistantMessageText}>
            {message.content}
          </Text>
          {/* {message.timestamp && (
            <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.assistantTimestamp]}>
              {formatTimestamp(message.timestamp)}
            </Text>
          )} */}
        </View>
      </View>
    </View>
  );
});


const ChatScreen = () => {
  const [userMessage, setUserMessage] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '¡Hola! Soy tu Asistente de Hábitos. ¿En qué puedo ayudarte hoy?', id: 'initial-assistant-msg' }
  ]);
  const scrollViewRef = useRef();
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!userMessage.trim()) return;

    const newMessages = [...messages, { role: 'user', content: userMessage, id: Math.random().toString() }];
    setMessages(newMessages);
    // const currentInput = userMessage; // No es necesario si usas newMessages directamente
    setUserMessage('');
    setIsLoading(true);

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`, // ✅ LÍNEA DESCOMENTADA
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "Responde únicamente dudas relacionadas con hábitos saludables y desarrollo personal. Si te preguntan algo fuera de ese tema, indica amablemente que solo respondes sobre hábitos." },
            // Mapear newMessages para la API
            ...newMessages.filter(m => m.role && m.content).map(m => ({ role: m.role, content: m.content })),
          ]
        })
      });

      const data = await response.json();
      console.log('Respuesta completa:', data);

      if (data.error) { // Manejo de errores devueltos por la API de OpenAI
        console.error('Error de la API de OpenAI:', data.error.message);
        setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: `Error de la API: ${data.error.message || 'Error desconocido'}`, id: Math.random().toString() }]);
      } else {
        const assistantMessageContent = data.choices?.[0]?.message?.content || 'No se pudo obtener respuesta de la IA.';
        setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: assistantMessageContent, id: Math.random().toString() }]);
      }
      Keyboard.dismiss();

    } catch (error) {
      console.error('Error consultando OpenAI (catch):', error); // Más específico para el bloque catch
      setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: 'Hubo un error al contactar al asistente. Intenta de nuevo.', id: Math.random().toString() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Asistente IA de Hábitos</Text>
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <View style={styles.mainContainer}>
          <ScrollView
            style={styles.chatMessages}
            contentContainerStyle={styles.chatMessagesContent}
            ref={scrollViewRef}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((msg, i) => (
              <MessageBubble key={msg.id || i} message={msg} />
            ))}
            {isLoading && (
              <View style={styles.typingIndicatorContainer}>
                <ActivityIndicator size="small" color={BRAND_COLORS.placeholderText} />
                <Text style={styles.typingIndicatorText}>Asistente está pensando...</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.inputArea}>
            <TextInput
              style={styles.inputField}
              placeholder="Escribe tu duda aquí..."
              placeholderTextColor={BRAND_COLORS.placeholderText}
              value={userMessage}
              onChangeText={setUserMessage}
              multiline
              maxHeight={100}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[styles.sendIconContainer, (!userMessage.trim() || isLoading) && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!userMessage.trim() || isLoading}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-up-circle-outline" size={30} color={BRAND_COLORS.sendButtonIcon} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ESTILOS CON EL DISEÑO FUTURISTA
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BRAND_COLORS.cardBackground,
  },
  header: {
    paddingVertical: Platform.OS === 'ios' ? 15 : 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: BRAND_COLORS.inputBorder,
    backgroundColor: BRAND_COLORS.cardBackground,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: BRAND_COLORS.headerTitleColor,
    textAlign: 'center',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: BRAND_COLORS.chatScreenBackground,
  },
  chatMessages: {
    flex: 1,
  },
  chatMessagesContent: {
    paddingHorizontal: 12,
    paddingVertical: 15,
  },
  messageRow: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  userMessageRow: {
    alignSelf: 'flex-end',
  },
  assistantMessageRow: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    // backgroundColor: BRAND_COLORS.assistantAvatarBg, // Si quieres un fondo para el avatar
  },
  userBubbleWrapper: {},
  assistantBubbleWrapper: {
    flexDirection: 'column',
  },
  messageBubble: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 18,
    elevation: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userBubble: {
    backgroundColor: BRAND_COLORS.userBubble,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: BRAND_COLORS.assistantBubble,
    borderBottomLeftRadius: 4,
  },
  userMessageText: {
    fontSize: 15,
    color: BRAND_COLORS.userBubbleText,
    lineHeight: 21,
  },
  assistantMessageText: {
    fontSize: 15,
    color: BRAND_COLORS.assistantBubbleText,
    lineHeight: 21,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
  },
  userTimestamp: {
    color: BRAND_COLORS.userBubbleText + 'B3', // Un poco más opaco
    textAlign: 'right',
  },
  assistantTimestamp: {
    color: BRAND_COLORS.timestampText,
    textAlign: 'left',
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: BRAND_COLORS.inputBorder,
    backgroundColor: BRAND_COLORS.inputAreaBackground,
  },
  inputField: {
    flex: 1,
    backgroundColor: BRAND_COLORS.chatScreenBackground, // Ligeramente diferente para contraste
    minHeight: 44, // Buena altura para touch
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8, // Ajuste para padding vertical en Android
    borderRadius: 22, // Circular
    fontSize: 16,
    color: BRAND_COLORS.textDark,
    marginRight: 10,
  },
  sendIconContainer: {
    backgroundColor: BRAND_COLORS.sendButton,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: BRAND_COLORS.sendButtonDisabled,
  },
  typingIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginLeft: 40, // Para alinear con burbuja del asistente (avatar width + margin)
  },
  typingIndicatorText: {
    marginLeft: 8,
    fontSize: 13,
    color: BRAND_COLORS.placeholderText,
    fontStyle: 'italic',
  },
});

export default ChatScreen;