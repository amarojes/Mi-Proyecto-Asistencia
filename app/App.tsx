
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text } from 'react-native';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { DataProvider } from './src/contexts/DataContext';

// Importación de todas las pantallas
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ImportScreen from './src/screens/ImportScreen';
import UserManagementScreen from './src/screens/UserManagementScreen';
import AttendanceScreen from './src/screens/AttendanceScreen';
import MonthlyScreen from './src/screens/MonthlyScreen';
import StudentProfileScreen from './src/screens/StudentProfileScreen';
import WeeklyReportScreen from './src/screens/WeeklyReportScreen';

const Stack = createStackNavigator();

// =====================================================================================
//  COMPONENTE DE NAVEGACIÓN PRINCIPAL
// =====================================================================================
const AppNavigator = () => {
  const { user, loading: authLoading } = useAuth();

  // Estado de carga de la autenticación
  if (authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Verificando sesión...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerTitleAlign: 'center' }}>
        {user ? (
          // --- Pantallas de usuario autenticado ---
          <>
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio' }} />
            <Stack.Screen name="Import" component={ImportScreen} options={{ title: 'Importar Estudiantes' }} />
            <Stack.Screen name="UserManagement" component={UserManagementScreen} options={{ title: 'Gestión de Docentes' }} />
            <Stack.Screen name="Attendance" component={AttendanceScreen} options={{ title: 'Registro de Asistencia' }} />
            <Stack.Screen name="Monthly" component={MonthlyScreen} options={{ title: 'Vista Mensual' }} />
            <Stack.Screen name="StudentProfile" component={StudentProfileScreen} options={{ title: 'Perfil del Estudiante' }} />
            <Stack.Screen name="WeeklyReport" component={WeeklyReportScreen} options={{ title: 'Reporte Semanal' }} />
          </>
        ) : (
          // --- Pantalla de Login ---
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// =====================================================================================
//  ENVOLTORIO DE PROVEEDORES
// =====================================================================================
const AppWrapper = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <AppNavigator />
      </DataProvider>
    </AuthProvider>
  );
};

// =====================================================================================
//  COMPONENTE RAÍZ DE LA APLICACIÓN (VERSIÓN CORREGIDA)
// =====================================================================================
export default function App() {
  // Se eliminó la lógica de inicialización de la base de datos que causaba el fallo.
  // Ahora, la aplicación renderiza directamente el AppWrapper.
  console.log("APP: Renderizando AppWrapper directamente.");
  return <AppWrapper />;
}
