
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';

const LoginScreen = () => {
  // Estado para el email y la contraseña
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Estado para la carga

  // Hook de autenticación de Firebase
  const { login } = useAuth();

  // Función para manejar el inicio de sesión
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor, introduce tu email y contraseña.');
      return;
    }

    setLoading(true);
    try {
      // Llama a la función de login del AuthContext
      await login(email, password);
      // La navegación ocurrirá automáticamente gracias al onAuthStateChanged
    } catch (error: any) {
      // Muestra un error más descriptivo
      let errorMessage = 'Hubo un error al iniciar sesión.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Email o contraseña incorrectos.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'El formato del email no es válido.';
      }
      Alert.alert('Error de autenticación', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#4c669f', '#3b5998', '#192f6a']}
      style={styles.container}
    >
      <Text style={styles.title}>Control de Asistencia</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#ccc"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#ccc"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
        />
      </View>
      <TouchableOpacity 
        style={styles.loginButton} 
        onPress={handleLogin}
        disabled={loading} // Deshabilita el botón durante la carga
      >
        <Text style={styles.loginButtonText}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    color: '#fff',
    marginBottom: 40,
  },
  inputContainer: {
    width: '80%',
    marginBottom: 30, // Aumentado para dar más espacio
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 12, // Ligeramente más alto
    borderRadius: 5,
    color: '#fff',
    marginBottom: 15, // Espacio entre inputs
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 5,
    elevation: 2, // Sombra para Android
    shadowOpacity: 0.2, // Sombra para iOS
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  loginButtonText: {
    color: '#3b5998',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
