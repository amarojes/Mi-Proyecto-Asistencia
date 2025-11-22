
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
// CSV export requires a library like react-native-fs to save files.

const MonthlyScreen = () => {
    const { user } = useAuth();
    const { estudiantes, fetchEstudiantes } = useData();
    const [monthDays, setMonthDays] = useState([]);

    useEffect(() => {
        fetchEstudiantes();
        const getWeekdaysInMonth = () => {
            const days = [];
            const date = new Date();
            const year = date.getFullYear();
            const month = date.getMonth();
            let d = new Date(year, month, 1);
            while (d.getMonth() === month) {
                const dayOfWeek = d.getDay();
                if (dayOfWeek > 0 && dayOfWeek < 6) { // Monday to Friday
                    days.push(new Date(d));
                }
                d.setDate(d.getDate() + 1);
            }
            setMonthDays(days);
        };

        getWeekdaysInMonth();
    }, []);

    const getAttendanceStatus = (studentId, day) => {
        const statuses = ['A', 'I', 'IJ'];
        return statuses[Math.floor(Math.random() * statuses.length)];
    };

    const exportToCSV = () => {
        // UTF-8 with BOM for Excel compatibility with special characters
        let csvContent = '\uFEFF';
        
        // Header row - all left-aligned
        csvContent += monthDays.map(d => d.getDate()).join(',') + '\n';
        
        // Data rows - all left-aligned
        estudiantes.forEach(student => {
            let row = `"${student.nombre}","${student.grado}","${student.seccion}"`;
            monthDays.forEach(day => {
                row += ',' + getAttendanceStatus(student.id, day);
            });
            csvContent += row + '\n';
        });

        // Placeholder for file saving logic, which requires a native module
        console.log("CSV Content:\n", csvContent);
        Alert.alert('Exportación a CSV', 'El contenido del CSV ha sido generado y está listo para ser guardado. La funcionalidad de guardado no está implementada en este entorno.');
    };

    const isAdmin = user?.rol === 'Administrador';

    return (
        <View style={styles.container}>
            {isAdmin && (
                <View style={styles.filterContainer}>
                    <Text style={{color: 'white'}}>Filtros (Admin): Grado / Sección</Text>
                </View>
            )}
            <TouchableOpacity style={styles.button} onPress={exportToCSV}>
                <Text style={styles.buttonText}>Exportar a CSV</Text>
            </TouchableOpacity>
            <ScrollView horizontal>
                <View>
                    <View style={styles.headerRow}>
                        <Text style={[styles.cell, styles.headerCell, styles.studentNameCell]}>Estudiante</Text>
                        {monthDays.map(day => (
                            <Text key={day.toString()} style={[styles.cell, styles.headerCell]}>{day.getDate()}</Text>
                        ))}
                    </View>
                    <ScrollView>
                        {estudiantes.map(student => (
                            <View key={student.id} style={styles.bodyRow}>
                                <Text style={[styles.cell, styles.studentNameCell]}>{student.nombre}</Text>
                                {monthDays.map(day => {
                                    const status = getAttendanceStatus(student.id, day);
                                    const statusColor = status === 'A' ? 'green' : status === 'I' ? 'red' : 'orange';
                                    return (
                                        <View key={day.toString()} style={[styles.cell, styles.statusCell]}>
                                            <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
                                        </View>
                                    );
                                })}
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#3b5998' },
    filterContainer: { padding: 10, backgroundColor: '#4c669f' },
    headerRow: { flexDirection: 'row', backgroundColor: '#f0f0f0' },
    bodyRow: { flexDirection: 'row' },
    // All text content within cells is left-aligned by default
    cell: { padding: 10, borderWidth: 1, borderColor: '#ccc', width: 50, textAlign: 'left' },
    headerCell: { fontWeight: 'bold', textAlign: 'left' },
    studentNameCell: { width: 150, textAlign: 'left', color: '#fff' },
    statusCell: { justifyContent: 'center', alignItems: 'flex-start' }, // Align indicator to the left
    statusIndicator: { width: 10, height: 10, borderRadius: 5 },
    button: { backgroundColor: '#fff', padding: 10, margin: 10, borderRadius: 5, alignItems: 'center' },
    buttonText: { color: '#3b5998' }
});

export default MonthlyScreen;
