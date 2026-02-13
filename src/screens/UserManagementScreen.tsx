
import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Modal, Button } from 'react-native';
import { useData } from '../contexts/DataContext';

const UserManagementScreen = () => {
    const { docentes, addDocente, updateDocente, deleteDocente } = useData();
    const [modalVisible, setModalVisible] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [isEdit, setIsEdit] = useState(false);

    const [nombre, setNombre] = useState('');
    const [usuario, setUsuario] = useState('');
    const [grado, setGrado] = useState('');
    const [seccion, setSeccion] = useState('');

    const openModal = (user = null) => {
        if (user) {
            setCurrentUser(user);
            setIsEdit(true);
            setNombre(user.nombre);
            setUsuario(user.usuario);
            setGrado(user.grado);
            setSeccion(user.seccion);
        } else {
            setCurrentUser(null);
            setIsEdit(false);
            setNombre('');
            setUsuario('');
            setGrado('');
            setSeccion('');
        }
        setModalVisible(true);
    };

    const handleSave = () => {
        const userData = { nombre, usuario, grado, seccion };
        if (isEdit) {
            updateDocente(currentUser.id, userData);
        } else {
            addDocente(userData);
        }
        setModalVisible(false);
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={docentes}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.listItem}>
                        <Text style={styles.listItemText}>{item.nombre}</Text>
                        <TouchableOpacity onPress={() => openModal(item)}><Text>Edit</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => deleteDocente(item.id)}><Text>Delete</Text></TouchableOpacity>
                    </View>
                )}
            />
            <TouchableOpacity style={styles.fab} onPress={() => openModal()}>
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide">
                <View style={styles.modalView}>
                    <Text>{isEdit ? 'Edit' : 'Add'} Docente</Text>
                    <TextInput placeholder="Nombre" value={nombre} onChangeText={setNombre} style={styles.input} />
                    <TextInput placeholder="Usuario" value={usuario} onChangeText={setUsuario} style={styles.input} />
                    <TextInput placeholder="Grado" value={grado} onChangeText={setGrado} style={styles.input} />
                    <TextInput placeholder="Sección" value={seccion} onChangeText={setSeccion} style={styles.input} />
                    <Button title="Save" onPress={handleSave} />
                    <Button title="Cancel" onPress={() => setModalVisible(false)} />
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#3b5998' },
    listItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
    listItemText: { color: '#fff' },
    fab: { position: 'absolute', right: 30, bottom: 30, backgroundColor: '#fff', width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
    fabText: { fontSize: 24, color: '#3b5998' },
    modalView: { flex: 1, justifyContent: 'center', alignItems: 'center', margin: 20 },
    input: { width: '80%', padding: 10, margin: 5, backgroundColor: '#f0f0f0' }
});

export default UserManagementScreen;
