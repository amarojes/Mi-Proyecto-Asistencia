
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Button, Alert } from 'react-native';
import { useData } from '../contexts/DataContext';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';

const StudentProfileScreen = ({ route, navigation }) => {
    const { studentId } = route.params;
    const { estudiantes, updateEstudiante, deleteEstudiante } = useData();
    const student = estudiantes.find(e => e.id === studentId);

    const [modalVisible, setModalVisible] = useState(false);

    // Form state
    const [nombre, setNombre] = useState(student?.nombre || '');
    const [grado, setGrado] = useState(student?.grado || '');
    const [seccion, setSeccion] = useState(student?.seccion || '');

    const handleUpdate = () => {
        updateEstudiante(studentId, { nombre, grado, seccion });
        setModalVisible(false);
    };

    const handleDelete = () => {
        Alert.alert(
            "Confirmar Eliminación",
            "¿Estás seguro de que quieres eliminar a este estudiante?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    onPress: () => {
                        deleteEstudiante(studentId);
                        navigation.goBack();
                    },
                    style: "destructive",
                },
            ]
        );
    };

    const exportToPDF = async () => {
        if (!student) return;

        // Professional HTML content for the PDF report
        const htmlContent = `
            <html>
            <head>
                <style>
                body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
                h1 { color: #3b5998; text-align: center; }
                h2 { color: #4c669f; border-bottom: 2px solid #4c669f; padding-bottom: 5px; margin-top: 30px; }
                .profile-info { margin-bottom: 30px; }
                .profile-info p { font-size: 16px; line-height: 1.5; }
                .chart-container { text-align: center; margin-top: 20px; border: 1px solid #ccc; padding: 20px; border-radius: 10px; background-color: #f9f9f9; }
                .chart-placeholder { font-size: 18px; color: #888; padding: 40px 0; }
                .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #aaa; }
                </style>
            </head>
            <body>
                <h1>Reporte de Asistencia del Estudiante</h1>
                <div class="profile-info">
                <h2>${student.nombre}</h2>
                <p><strong>Grado:</strong> ${student.grado}</p>
                <p><strong>Sección:</strong> ${student.seccion}</p>
                </div>
                
                <div class="chart-container">
                <h2>Asistencia Mensual</h2>
                <p class="chart-placeholder">[Gráfico Circular de Asistencia - Simulado]</p>
                <p><strong>Asistencias:</strong> 85%</p>
                <p><strong>Inasistencias:</strong> 10%</p>
                <p><strong>Justificadas:</strong> 5%</p>
                </div>
                
                <div class="chart-container">
                <h2>Tendencia de Asistencia (Últimos 6 Meses)</h2>
                <p class="chart-placeholder">[Gráfico de Líneas de Tendencia - Simulado]</p>
                </div>

                <p class="footer">Reporte generado el ${new Date().toLocaleDateString()}</p>
            </body>
            </html>
        `;

        try {
            const { uri } = await Print.printToFileAsync({ html: htmlContent });
            await shareAsync(uri, { dialogTitle: `Reporte de ${student.nombre}`, UTI: '.pdf' });
        } catch (error) {
            Alert.alert("Error", "No se pudo generar el archivo PDF.");
            console.error(error);
        }
    };

    if (!student) {
        return <View style={styles.container}><Text style={styles.text}>Estudiante no encontrado</Text></View>;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{student.nombre}</Text>
            <View style={styles.chartPlaceholder}>
                <Text style={styles.text}>Gráfico Circular de Asistencia Mensual</Text>
            </View>
            <View style={styles.chartPlaceholder}>
                <Text style={styles.text}>Gráfico de Tendencia (Últimos 6 meses)</Text>
            </View>

            <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}><Text style={styles.buttonText}>Editar Datos</Text></TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleDelete}><Text style={styles.buttonText}>Eliminar Estudiante</Text></TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={exportToPDF}><Text style={styles.buttonText}>Exportar a PDF</Text></TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide">
                <View style={styles.modalView}>
                    <TextInput placeholder="Nombre" value={nombre} onChangeText={setNombre} style={styles.input} />
                    <TextInput placeholder="Grado" value={grado} onChangeText={setGrado} style={styles.input} />
                    <TextInput placeholder="Sección" value={seccion} onChangeText={setSeccion} style={styles.input} />
                    <Button title="Guardar" onPress={handleUpdate} />
                    <Button title="Cancelar" onPress={() => setModalVisible(false)} />
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#3b5998' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
    text: { color: '#fff' },
    chartPlaceholder: { height: 150, width: '90%', backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderRadius: 10 },
    button: { backgroundColor: '#fff', padding: 15, borderRadius: 5, marginBottom: 10, width: '80%', alignItems: 'center' },
    buttonText: { color: '#3b5998', fontWeight: 'bold' },
    modalView: { flex: 1, justifyContent: 'center', alignItems: 'center', margin: 20 },
    input: { width: '80%', padding: 10, margin: 5, backgroundColor: '#f0f0f0' }
});

export default StudentProfileScreen;
