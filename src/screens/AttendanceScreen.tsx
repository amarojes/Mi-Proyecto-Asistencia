
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

const AttendanceScreen = () => {
    const { estudiantes, registrarAsistencia, fetchEstudiantes } = useData();
    const { user } = useAuth();
    const [filteredEstudiantes, setFilteredEstudiantes] = useState([]);

    useEffect(() => {
        if (user && user.rol === 'Docente') {
            const filtered = estudiantes.filter(e => e.grado === user.grado && e.seccion === user.seccion);
            setFilteredEstudiantes(filtered);
        } else {
            setFilteredEstudiantes(estudiantes);
        }
    }, [estudiantes, user]);

    const handleAttendance = (estudiante_id, estado) => {
        const today = new Date().toISOString().split('T')[0];
        registrarAsistencia({ estudiante_id, fecha: today, estado });
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={filteredEstudiantes}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.listItem}>
                        <Text style={styles.listItemText}>{item.nombre}</Text>
                        <View style={styles.buttonsContainer}>
                            <TouchableOpacity style={styles.button} onPress={() => handleAttendance(item.id, 'A')}><Text>A</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.button} onPress={() => handleAttendance(item.id, 'I')}><Text>I</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.button} onPress={() => handleAttendance(item.id, 'IJ')}><Text>IJ</Text></TouchableOpacity>
                        </View>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#3b5998' },
    listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
    listItemText: { color: '#fff', flex: 1 },
    buttonsContainer: { flexDirection: 'row' },
    button: { backgroundColor: '#fff', padding: 10, marginHorizontal: 5, borderRadius: 5 }
});

export default AttendanceScreen;
