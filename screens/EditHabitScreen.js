import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Switch, Platform } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../src/firebaseConfig';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

const EditHabitScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { habit } = route.params;

  const [name, setName] = useState(habit.name);
  const [description, setDescription] = useState(habit.description);
  const [endDate, setEndDate] = useState(habit.endDate ? new Date(habit.endDate.seconds * 1000) : new Date());
  const [isIndefinite, setIsIndefinite] = useState(habit.isIndefinite);
  const [notificationTime, setNotificationTime] = useState(habit.notificationTime ? new Date(habit.notificationTime.seconds * 1000) : new Date());
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleUpdate = async () => {
    try {
      const habitRef = doc(db, 'users', habit.userId, 'habits', habit.id);
      await updateDoc(habitRef, {
        name,
        description,
        endDate: isIndefinite ? null : endDate,
        isIndefinite,
        notificationTime,
      });
      navigation.goBack();
    } catch (error) {
      console.error('Error actualizando hábito: ', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Hábito</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre del hábito"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Descripción"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <View style={styles.switchContainer}>
        <Text>¿Es indefinido?</Text>
        <Switch
          value={isIndefinite}
          onValueChange={setIsIndefinite}
        />
      </View>

      {!isIndefinite && (
        <View>
          <Button title="Seleccionar fecha de finalización" onPress={() => setShowDatePicker(true)} />
          <Text>Fecha: {endDate.toLocaleDateString()}</Text>
        </View>
      )}

      {showDatePicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(Platform.OS === 'ios');
            if (selectedDate) setEndDate(selectedDate);
          }}
        />
      )}

      <View style={{ marginVertical: 10 }}>
        <Button title="Seleccionar hora de notificación" onPress={() => setShowTimePicker(true)} />
        <Text>Hora: {notificationTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      </View>

      {showTimePicker && (
        <DateTimePicker
          value={notificationTime}
          mode="time"
          display="default"
          onChange={(event, selectedTime) => {
            setShowTimePicker(Platform.OS === 'ios');
            if (selectedTime) setNotificationTime(selectedTime);
          }}
        />
      )}

      <Button title="Actualizar Hábito" onPress={handleUpdate} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
});

export default EditHabitScreen;
