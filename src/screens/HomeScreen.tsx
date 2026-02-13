
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { estudiantes } = useData();
  const isStudentDbEmpty = estudiantes.length === 0;

  const isAdmin = user?.rol === 'Administrador';

  const renderAdminView = () => (
    <View style={styles.container}>
      {isStudentDbEmpty ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>¡Bienvenido!</Text>
          <Text style={styles.cardText}>No hay estudiantes registrados. Importa una lista para comenzar.</Text>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Import')}>
            <Text style={styles.buttonText}>Importar Estudiantes</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.grid}>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Import')}>
            <Text style={styles.buttonText}>Importar Estudiantes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Attendance')}>
            <Text style={styles.buttonText}>Registro Diario</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Monthly')}>
            <Text style={styles.buttonText}>Vista Mensual</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('WeeklyReport')}>
            <Text style={styles.buttonText}>Reporte Semanal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('UserManagement')}>
            <Text style={styles.buttonText}>Gestión de Usuarios</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderDocenteView = () => (
    <View style={styles.container}>
      {isStudentDbEmpty ? (
        <Text style={styles.cardText}>No hay estudiantes asignados.</Text>
      ) : (
          <View style={styles.grid}>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Attendance')}>
              <Text style={styles.buttonText}>Registro Diario</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Monthly')}>
              <Text style={styles.buttonText}>Vista Mensual</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('WeeklyReport')}>
              <Text style={styles.buttonText}>Reporte Semanal</Text>
            </TouchableOpacity>
            <FlatList
              data={estudiantes}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                  <TouchableOpacity style={styles.studentButton} onPress={() => navigation.navigate('StudentProfile', { studentId: item.id })}>
                      <Text style={styles.studentButtonText}>{item.nombre}</Text>
                  </TouchableOpacity>
              )}
            />
          </View>
      )}
    </View>
  );

  return (
    <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.container}>
      {isAdmin ? renderAdminView() : renderDocenteView()}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    width: '90%',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 10,
  },
  cardText: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#3b5998',
    fontWeight: 'bold',
  },
  studentButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 20,
    borderRadius: 5,
    marginBottom: 10,
  },
  studentButtonText: {
    color: '#fff',
  },
});

export default HomeScreen;
