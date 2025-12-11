
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Button, Alert, Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { db } from '../database/DatabaseSetup';

// Casting para evitar error de TypeScript cuando la propiedad documentDirectory
// no aparece en el export principal de expo-file-system (aunque sí existe en runtime/legacy)
const fsAny = FileSystem as any;
const DOC_DIR = fsAny.documentDirectory || '';

const ENCODING_UTF8 = 'utf8';

const ImportScreen = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [importType, setImportType] = useState('Add'); // Add or Replace

    const downloadTemplate = async () => {
        if (Platform.OS === 'web') {
            Alert.alert("Web no soportado", "Esta función no está disponible en la web aún.");
            return;
        }

        const headers = ["Nombre Completo", "Cedula Escolar", "Cedula Identidad", "Sexo", "Edad", "Grado", "Seccion"];
        const csvContent = '\uFEFF' + headers.join(','); // UTF-8 with BOM

        const fileUri = DOC_DIR + 'plantilla_estudiantes.csv';
        try {
            await FileSystem.writeAsStringAsync(fileUri, csvContent, {
                encoding: ENCODING_UTF8,
            });
            await Sharing.shareAsync(fileUri, {
                mimeType: 'text/csv',
                dialogTitle: 'Descargar Plantilla de Estudiantes',
            });
        } catch (error) {
            Alert.alert("Error", "No se pudo generar la plantilla.");
            console.error(error);
        }
    };

    const handleImport = async () => {
        if (!db) return;
        try {
            const result = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM Estudiantes');
            if (result && result.count > 0) {
                setIsModalVisible(true);
            } else {
                pickDocument();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const pickDocument = async () => {
        setIsModalVisible(false);
        try {
            const result = await DocumentPicker.getDocumentAsync({ type: 'text/csv' });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                const fileContent = await FileSystem.readAsStringAsync(asset.uri, { encoding: ENCODING_UTF8 });
                await parseAndProcessCSV(fileContent);
            }
        } catch (error) {
            Alert.alert("Error", "No se pudo leer el archivo.");
            console.error(error);
        }
    };
    
    const parseAndProcessCSV = async (csvString: string) => {
        const lines = csvString.split('\n').slice(1); // Skip header row
        const students = lines.map(line => {
            const [nombre, cedulaEscolar, cedulaIdentidad, sexo, edad, grado, seccion] = line.split(',').map(item => item ? item.trim() : '');
            return { nombre, cedulaEscolar, cedulaIdentidad, sexo, edad, grado, seccion };
        }).filter(s => s.nombre && s.nombre.length > 0);

        if (students.length > 0) {
            await processImport(students);
        } else {
            Alert.alert("Archivo Vacío", "El archivo seleccionado no contiene datos de estudiantes válidos.");
        }
    };

    const processImport = async (students: any[]) => {
        if (!db) return;
        let errors: string[] = [];

        try {
             if (importType === 'Replace') {
                 await db.execAsync('DELETE FROM Estudiantes;');
                 await db.execAsync('DELETE FROM Registros_Asistencia;');
                 await db.runAsync("INSERT INTO Colas_Sincronizacion (tabla, registro_id, accion) VALUES (?, ?, ?)", ['Estudiantes', -1, 'REPLACE_ALL']);
             }

             for (const [index, student] of students.entries()) {
                 const { nombre, cedulaEscolar, cedulaIdentidad, sexo, edad, grado, seccion } = student;

                 let idUnico = null;
                 const cedulaIdentidadValida = cedulaIdentidad && cedulaIdentidad.length >= 8;
                 const cedulaEscolarValida = cedulaEscolar && cedulaEscolar.length >= 10;

                 if (cedulaIdentidadValida) {
                     idUnico = cedulaIdentidad;
                 } else if (cedulaEscolarValida) {
                     idUnico = cedulaEscolar;
                 }

                 if (idUnico) {
                     try {
                        await db.runAsync(
                             'INSERT INTO Estudiantes (cedula, nombre, grado, seccion) VALUES (?, ?, ?, ?);',
                             [idUnico, nombre, grado, seccion]
                        );
                         await db.runAsync(
                             'INSERT INTO Colas_Sincronizacion (tabla, registro_id, accion) VALUES (?, ?, ?);',
                             ['Estudiantes', idUnico, 'ADD']
                         );

                     } catch (error: any) {
                         errors.push(`Fila ${index + 2}: Error al insertar estudiante ${nombre} - ${error.message}`);
                     }
                 } else {
                     errors.push(`Fila ${index + 2}: Cédula inválida para ${nombre}. Se omitió el registro.`);
                 }
             }

             if (errors.length > 0) {
                 Alert.alert("Importación con Errores", `Se encontraron ${errors.length} errores:\n${errors.join('\n')}`);
             } else {
                 Alert.alert("Importación Exitosa", "Todos los estudiantes han sido importados correctamente.");
             }

        } catch (error: any) {
             Alert.alert("Error General", `Ocurrió un error durante la importación: ${error.message}`);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.button} onPress={handleImport}>
                <Text style={styles.buttonText}>Importar Estudiantes desde CSV</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.templateButton]} onPress={downloadTemplate}>
                <Text style={styles.buttonText}>Descargar Plantilla</Text>
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Ya existen estudiantes. ¿Qué desea hacer?</Text>
                        <View style={styles.modalButtonGroup}>
                            <Button title="Agregar" onPress={() => { setImportType('Add'); pickDocument(); }} />
                            <Button title="Reemplazar" onPress={() => { setImportType('Replace'); pickDocument(); }} />
                            <Button title="Cancelar" onPress={() => setIsModalVisible(false)} />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#3b5998', padding: 20 },
    button: { backgroundColor: '#fff', padding: 15, borderRadius: 5, width: '90%', alignItems: 'center', marginBottom: 15 },
    templateButton: { backgroundColor: '#4c669f' },
    buttonText: { color: '#3b5998', fontWeight: 'bold' },
    centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalView: { margin: 20, backgroundColor: 'white', borderRadius: 10, padding: 35, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, width: '80%' },
    modalText: { marginBottom: 15, textAlign: 'center', fontSize: 16 },
    modalButtonGroup: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' }
});

export default ImportScreen;
