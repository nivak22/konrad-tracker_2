import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text, Switch, Platform } from "react-native";
import { db, auth } from "../src/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import Toast from "react-native-toast-message";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Notifications from "expo-notifications";

export default function CreateHabitScreen({ navigation }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [endDate, setEndDate] = useState(new Date());
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [isIndefinite, setIsIndefinite] = useState(false);
  const [notificationTime, setNotificationTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleSaveHabit = async () => {
    if (!name) {
      Toast.show({ type: "error", text1: "El nombre del hábito es obligatorio." });
      return;
    }
    if (!isIndefinite && !endDate) {
      Toast.show({ type: "error", text1: "Selecciona una fecha de finalización." });
      return;
    }
    if (!notificationTime) {
      Toast.show({ type: "error", text1: "Selecciona una hora de notificación." });
      return;
    }

    try {
      const userId = auth.currentUser.uid;

      await addDoc(collection(db, "users", userId, "habits"), {
        name,
        description,
        endDate: isIndefinite ? null : endDate,
        isIndefinite,
        notificationTime,
        createdAt: new Date(),
      });

      Toast.show({ type: "success", text1: "Hábito guardado correctamente." });

      // Programar notificación (solo en dispositivo físico)
      if (Platform.OS !== "web") {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `Recordatorio: ${name}`,
            body: description || "¡No olvides este hábito!",
          },
          trigger: {
            hour: notificationTime.getHours(),
            minute: notificationTime.getMinutes(),
            repeats: true,
          },
        });
      }

      navigation.goBack();
    } catch (error) {
      console.log(error);
      Toast.show({ type: "error", text1: "Error al guardar el hábito." });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nuevo Hábito</Text>

      <TextInput
        placeholder="Nombre del hábito"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        placeholder="Descripción (opcional)"
        style={styles.input}
        value={description}
        onChangeText={setDescription}
      />

      <View style={styles.row}>
        <Text>Indefinido:</Text>
        <Switch value={isIndefinite} onValueChange={setIsIndefinite} />
      </View>

      {!isIndefinite && (
        <View style={styles.pickerRow}>
          <Button title="Seleccionar Fecha de Finalización" onPress={() => setShowEndDatePicker(true)} />
          {showEndDatePicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowEndDatePicker(false);
                if (date) setEndDate(date);
              }}
            />
          )}
        </View>
      )}

      <View style={styles.pickerRow}>
        <Button title="Seleccionar Hora de Notificación" onPress={() => setShowTimePicker(true)} />
        {showTimePicker && (
          <DateTimePicker
            value={notificationTime}
            mode="time"
            display="default"
            onChange={(event, time) => {
              setShowTimePicker(false);
              if (time) setNotificationTime(time);
            }}
          />
        )}
      </View>

      <Button title="Guardar Hábito" onPress={handleSaveHabit} />
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 10, justifyContent: "space-between" },
  pickerRow: { marginBottom: 10 },
});
