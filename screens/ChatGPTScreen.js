// screens/ChatScreen.js
import React, { useState, useRef, useEffect } from 'react'; // Asegúrate de tener useEffect si lo necesitas para algo más
import {
  View,
  TextInput,
  Button, // Mantendremos tu Button por ahora, pero lo estilizaremos
  Text,
  ScrollView, // Mantendremos ScrollView como en tu original
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableOpacity, // Para el botón de enviar personalizado
  SafeAreaView, // Para un mejor layout en iOS
  ActivityIndicator, // Si quieres añadir un indicador de carga mientras responde la IA
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Para el ícono del botón de enviar

// ⛔ API KEY directa — solo para pruebas ⚠️ (Tu lógica original)
const OPENAI_API_KEY = 'TU_API_KEY_AQUI';

// Colores del Manual de Marca adaptados para un look futurista
// (Los mismos que en la versión anterior que te gustó, para consistencia)
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

// Componente para cada burbuja de mensaje (solo estilos, sin lógica de animación de entrada por ahora para mantenerlo simple)
const MessageBubble = React.memo(({ message }) => {
  const isUser = message.role === 'user';

  const formatTimestamp = (date) => { // Asumimos que podrías añadir timestamps luego
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
          {/* Podrías añadir un timestamp aquí si lo incluyes en tus objetos de mensaje */}
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
    // Mensaje de bienvenida inicial si lo deseas (opcional, puedes quitarlo)
    { role: 'assistant', content: '¡Hola! Soy tu Asistente de Hábitos. ¿En qué puedo ayudarte hoy?', id: 'initial-assistant-msg' }
  ]);
  const scrollViewRef = useRef();
  const [isLoading, setIsLoading] = useState(false); // Para el indicador de carga

  // TU LÓGICA ORIGINAL DE handleSend (SIN CAMBIOS)
  const handleSend = async () => {
    if (!userMessage.trim()) return;

    const newMessages = [...messages, { role: 'user', content: userMessage, id: Math.random().toString() }]; // Añadido id para key en map
    setMessages(newMessages);
    const currentInput = userMessage; // Guardar el mensaje actual antes de limpiar
    setUserMessage(''); // Limpiar input inmediatamente
    setIsLoading(true); // Activar indicador de carga

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: 'POST',
        headers: {
          // 'Authorization': `Bearer ${OPENAI_API_KEY}`, // Tu API Key
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "Responde únicamente dudas relacionadas con hábitos saludables y desarrollo personal. Si te preguntan algo fuera de ese tema, indica amablemente que solo respondes sobre hábitos." },
            // Mapear newMessages para la API, pero solo los que tienen role y content
            ...newMessages.filter(m => m.role && m.content).map(m => ({ role: m.role, content: m.content })),
            // El mensaje del usuario actual ya está en newMessages, pero la API lo espera explícitamente a veces.
            // Si tu estructura de newMessages ya es correcta para la API, puedes simplificar.
            // Esta línea es redundante si currentInput ya está en newMessages como el último elemento.
            // { role: "user", content: currentInput } 
          ]
        })
      });

      const data = await response.json();
      console.log('Respuesta completa:', data);

      const assistantMessageContent = data.choices?.[0]?.message?.content || 'No se pudo obtener respuesta de la IA.';
      
      // Usar un callback en setMessages para asegurar que se usa el estado más reciente
      setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: assistantMessageContent, id: Math.random().toString() }]);
      Keyboard.dismiss();

    } catch (error) {
      console.error('Error consultando OpenAI:', error);
      setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: 'Hubo un error al contactar al asistente. Intenta de nuevo.', id: Math.random().toString() }]);
    } finally {
      setIsLoading(false); // Desactivar indicador de carga
    }
  };
  // FIN DE TU LÓGICA ORIGINAL

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Asistente IA de Hábitos</Text>
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0} // Ajustar según altura del header
      >
        <View style={styles.mainContainer}>
          <ScrollView
            style={styles.chatMessages}
            contentContainerStyle={styles.chatMessagesContent}
            ref={scrollViewRef}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => scrollViewRef.current?.scrollToEnd({ animated: true })} // Para asegurar scroll al inicio
            showsVerticalScrollIndicator={false}
          >
            {messages.map((msg, i) => (
              // Usando el componente MessageBubble para el estilo
              // Necesitas un 'key'. Si tus mensajes no tienen id, puedes usar el índice, pero un id único es mejor.
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
              editable={!isLoading} // No permitir editar mientras carga
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
  mainContainer: { // Reemplaza tu 'container' original
    flex: 1,
    backgroundColor: BRAND_COLORS.chatScreenBackground,
  },
  chatMessages: { // Reemplaza tu 'chatBox'
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
  userBubble: { // Tu estilo original para userText, adaptado
    backgroundColor: BRAND_COLORS.userBubble, // Usando color de marca
    borderBottomRightRadius: 4,
  },
  assistantBubble: { // Tu estilo original para assistantText, adaptado
    backgroundColor: BRAND_COLORS.assistantBubble, // Usando color de marca
    borderBottomLeftRadius: 4,
  },
  userMessageText: { // Tu estilo original para userText, adaptado
    fontSize: 15,
    color: BRAND_COLORS.userBubbleText, // Usando color de marca
    lineHeight: 21,
  },
  assistantMessageText: { // Tu estilo original para assistantText, adaptado
    fontSize: 15,
    color: BRAND_COLORS.assistantBubbleText, // Usando color de marca
    lineHeight: 21,
  },
  timestamp: { // Estilo para timestamps (si los añades)
    fontSize: 10,
    marginTop: 4,
  },
  userTimestamp: {
    color: BRAND_COLORS.userBubbleText + 'B3',
    textAlign: 'right',
  },
  assistantTimestamp: {
    color: BRAND_COLORS.timestampText,
    textAlign: 'left',
  },
  inputArea: { // Reemplaza tu 'inputContainer'
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: BRAND_COLORS.inputBorder,
    backgroundColor: BRAND_COLORS.inputAreaBackground,
  },
  inputField: { // Reemplaza tu 'input'
    flex: 1,
    backgroundColor: BRAND_COLORS.chatScreenBackground,
    minHeight: 44,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 22,
    fontSize: 16,
    color: BRAND_COLORS.textDark,
    marginRight: 10,
  },
  sendIconContainer: { // Para el nuevo botón de enviar con ícono
    backgroundColor: BRAND_COLORS.sendButton,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: { // Estilo para cuando el botón está deshabilitado
    backgroundColor: BRAND_COLORS.sendButtonDisabled,
  },
  typingIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginLeft: 40, // Para alinear con burbuja del asistente
  },
  typingIndicatorText: {
    marginLeft: 8,
    fontSize: 13,
    color: BRAND_COLORS.placeholderText, // Usar un color de placeholder
    fontStyle: 'italic',
  },
});

export default ChatScreen;
