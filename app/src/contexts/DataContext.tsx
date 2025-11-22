
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { View, Text } from 'react-native';
import { generateCompositePasswordHash } from '../utils/authUtils';

// =====================================================================================
//  INTERFACES Y TIPOS
// =====================================================================================
interface DocenteData {
  usuario: string;
  nombre: string;
  grado: string;
  seccion: string;
}

interface RegistroData {
  estudiante_id: number;
  fecha: string; // Formato: YYYY-MM-DD
  estado: 'A' | 'I' | 'IJ';
}

interface DataContextType {
  docentes: any[];
  estudiantes: any[];
  addDocente: (data: DocenteData) => Promise<void>;
  updateDocente: (id: number, data: Partial<DocenteData>) => Promise<void>;
  deleteDocente: (id: number) => Promise<void>;
  registrarAsistencia: (registro: RegistroData) => Promise<void>;
  refreshData: () => Promise<void>; // Función para refrescar los datos manualmente
}

// =====================================================================================
//  CONTEXTO Y HOOK
// =====================================================================================
const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData debe ser utilizado dentro de un DataProvider');
  }
  return context;
};

// =====================================================================================
//  PROVEEDOR DE DATOS (VERSIÓN FINAL Y ROBUSTA)
// =====================================================================================
interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [docentes, setDocentes] = useState<any[]>([]);
  const [estudiantes, setEstudiantes] = useState<any[]>([]);

  // --- LÓGICA DE CARGA DE DATOS --

  // MODIFICADO: La función original fue eliminada porque dependía de un archivo de base de datos inexistente.
  // Ahora, simplemente establece los datos como vacíos y finaliza la carga.
  const loadData = async () => {
    console.warn("DataContext: loadData ha sido neutralizado porque 'DatabaseSetup.ts' no existe.");
    setDocentes([]);
    setEstudiantes([]);
    return Promise.resolve();
  };

  // Carga inicial al montar el componente
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    setLoading(true);
    try {
      await loadData();
    } catch (error) {
      console.error("Fallo crítico al cargar datos.", error);
    } finally {
      setLoading(false);
    }
  };

  // --- FUNCIONES CRUD (NEUTRALIZADAS) ---

  // MODIFICADO: La función original fue eliminada.
  const addDocente = (data: DocenteData): Promise<void> => {
    console.warn("DataContext: addDocente ha sido neutralizado.");
    alert("Funcionalidad deshabilitada: La base de datos no está conectada.");
    return Promise.resolve();
  };

  // MODIFICADO: La función original fue eliminada.
  const updateDocente = (id: number, data: Partial<DocenteData>): Promise<void> => {
    console.warn("DataContext: updateDocente ha sido neutralizado.");
    alert("Funcionalidad deshabilitada: La base de datos no está conectada.");
    return Promise.resolve();
  };

  // MODIFICADO: La función original fue eliminada.
  const deleteDocente = (id: number): Promise<void> => {
    console.warn("DataContext: deleteDocente ha sido neutralizado.");
    alert("Funcionalidad deshabilitada: La base de datos no está conectada.");
    return Promise.resolve();
  };

  // MODIFICADO: La función original fue eliminada.
  const registrarAsistencia = (registro: RegistroData): Promise<void> => {
    console.warn("DataContext: registrarAsistencia ha sido neutralizado.");
    alert("Funcionalidad deshabilitada: La base de datos no está conectada.");
    return Promise.resolve();
  };


  // --- RENDERIZADO ---

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Cargando datos...</Text>
      </View>
    );
  }

  const value = {
    docentes,
    estudiantes,
    addDocente,
    updateDocente,
    deleteDocente,
    registrarAsistencia,
    refreshData
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
