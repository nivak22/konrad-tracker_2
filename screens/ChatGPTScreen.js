import React, { useState, useRef } from 'react';
import { View, TextInput, Button, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';

// ⛔ API KEY directa — solo para pruebas ⚠️
//const OPENAI_API_KEY = '';

const ChatScreen = () => {
  const [userMessage, setUserMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const scrollViewRef = useRef();

  const handleSend = async () => {
    if (!userMessage.trim()) return;

    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "Responde únicamente dudas relacionadas con hábitos saludables y desarrollo personal. Si te preguntan algo fuera de ese tema, indica amablemente que solo respondes sobre hábitos." },
            ...newMessages.map(m => ({ role: m.role, content: m.content })),
            { role: "user", content: userMessage }
          ]
        })
      });

      const data = await response.json();
      console.log('Respuesta completa:', data);

      const assistantMessage = data.choices?.[0]?.message?.content || 'No se pudo obtener respuesta';

      setMessages([...newMessages, { role: 'assistant', content: assistantMessage }]);
      setUserMessage('');
      Keyboard.dismiss();

    } catch (error) {
      console.error('Error consultando OpenAI:', error);
      setMessages([...newMessages, { role: 'assistant', content: 'Error al consultar OpenAI.' }]);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <View style={styles.container}>
        <ScrollView
          style={styles.chatBox}
          ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
        >
          {messages.map((msg, i) => (
            <Text key={i} style={msg.role === 'user' ? styles.userText : styles.assistantText}>
              {msg.content}
            </Text>
          ))}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Escribe tu duda..."
            value={userMessage}
            onChangeText={setUserMessage}
          />
          <Button title="Enviar" onPress={handleSend} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  chatBox: { flex: 1, marginBottom: 10 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
  },
  userText: {
    textAlign: 'right',
    color: '#333',
    marginVertical: 5,
    backgroundColor: '#d1f7c4',
    padding: 10,
    borderRadius: 8,
  },
  assistantText: {
    textAlign: 'left',
    color: '#333',
    marginVertical: 5,
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
  },
});

export default ChatScreen;
