import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../src/firebaseConfig';
import { useAuth } from '../src/contexts/AuthContext';

const HabitsScreen = () => {
    const navigation = useNavigation();
    const { currentUser } = useAuth();
    const [habits, setHabits] = useState([]);

    useEffect(() => {
        if (!currentUser) return;

        console.log("UID ACTUAL:", currentUser.uid);

        const q = query(
            collection(db, 'users', currentUser.uid, 'habits')
        );


        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            console.log("Snapshot ejecutado");
            const habitsData = [];
            querySnapshot.forEach((doc) => {
                habitsData.push({ id: doc.id, ...doc.data() });
            });
            setHabits(habitsData);
        });

        return unsubscribe;
    }, [currentUser]);

    const handleDelete = async (id) => {
        try {
            await deleteDoc(doc(db, 'users', currentUser.uid, 'habits', id));
        } catch (error) {
            console.error('Error eliminando hábito: ', error);
        }
    };

    const renderHabit = ({ item }) => (
        <View style={styles.habitItem}>
            <Text style={styles.habitTitle}>{item.name}</Text>
            <View style={styles.buttonsContainer}>
                <Button
                    title="Editar"
                    onPress={() =>
                        navigation.navigate('EditHabit', {
                            habit: { ...item, userId: currentUser.uid },
                        })
                    }
                />
                <Button
                    title="Eliminar"
                    color="red"
                    onPress={() => handleDelete(item.id)}
                />
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Mis Hábitos</Text>

            <FlatList
                data={habits}
                keyExtractor={(item) => item.id}
                renderItem={renderHabit}
                ListEmptyComponent={<Text>No tienes hábitos aún.</Text>}
            />

            <Button
                title="Crear nuevo hábito"
                onPress={() => navigation.navigate('CreateHabit')}
            />
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
    habitItem: {
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 10,
    },
    habitTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
});

export default HabitsScreen;
