
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { View, Text, Alert, Platform } from 'react-native';
import { db, initializeDatabase } from '../database/DatabaseSetup';

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
  estado: 'A' | 'I' | 'IJ'; // A: Asistió, I: Inasistencia, IJ: Inasistencia Justificada (se puede mapear)
}

// Interfaz para actualizar/borrar
interface EstudianteData {
  id: number;
  nombre: string;
  grado: string;
  seccion: string;
  cedula: string;
}

interface DataContextType {
  docentes: any[];
  estudiantes: any[];
  addDocente: (data: DocenteData) => Promise<void>;
  updateDocente: (id: number, data: Partial<DocenteData>) => Promise<void>;
  deleteDocente: (id: number) => Promise<void>;
  registrarAsistencia: (registro: RegistroData) => Promise<void>;
  refreshData: () => Promise<void>;

  // Nuevos métodos requeridos por las pantallas
  fetchEstudiantes: (grado?: string, seccion?: string) => Promise<any[]>;
  updateEstudiante: (id: number, data: Partial<EstudianteData>) => Promise<void>;
  deleteEstudiante: (id: number) => Promise<void>;
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
//  PROVEEDOR DE DATOS
// =====================================================================================
interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [docentes, setDocentes] = useState<any[]>([]);
  const [estudiantes, setEstudiantes] = useState<any[]>([]);

  // Inicializar DB y cargar datos
  useEffect(() => {
    const init = async () => {
        try {
            await initializeDatabase();
            await refreshData();
        } catch (e) {
            console.error("Error inicializando DataProvider:", e);
        } finally {
            setLoading(false);
        }
    };
    init();
  }, []);

  const refreshData = async () => {
    if (!db) return;
    try {
      // Cargar estudiantes (ejemplo básico)
      const result = await db.getAllAsync('SELECT * FROM Estudiantes');
      setEstudiantes(result);

      // Cargar docentes (Usuarios que no son admin, ejemplo)
      const docentesRes = await db.getAllAsync('SELECT * FROM Usuarios WHERE rol != ?', ['Administrador']);
      setDocentes(docentesRes);

    } catch (error) {
      console.error("Fallo al refrescar datos:", error);
    }
  };

  // --- FUNCIONES CRUD ---

  const addDocente = async (data: DocenteData): Promise<void> => {
      if (!db) return;
      try {
          // Asumimos que Docente es un Usuario con rol Docente
          // Nota: La tabla Usuarios tiene (usuario, password, rol).
          // Si queremos guardar nombre/grado/seccion, necesitamos ampliar la tabla o usar otra logica.
          // Por simplicidad, guardaremos en Usuarios. (Ajustar según esquema real si cambia)
          // El esquema actual de Usuarios solo tiene: id, usuario, password, rol.
          // NO TIENE nombre, grado, seccion.
          // ADVERTENCIA: Se necesita ajustar el esquema si se quiere guardar estos datos.
          // Por ahora, solo insertamos lo que cabe.

          await db.runAsync(
              'INSERT INTO Usuarios (usuario, password, rol) VALUES (?, ?, ?)',
              [data.usuario, '123456', 'Docente'] // Password por defecto
          );
          await refreshData();
      } catch (e) {
          console.error("Error addDocente:", e);
          Alert.alert("Error", "No se pudo agregar el docente.");
      }
  };

  const updateDocente = async (id: number, data: Partial<DocenteData>): Promise<void> => {
      // Implementación pendiente según esquema real
      console.warn("updateDocente no implementado completamente por limitaciones de esquema.");
  };

  const deleteDocente = async (id: number): Promise<void> => {
       if (!db) return;
       try {
           await db.runAsync('DELETE FROM Usuarios WHERE id = ?', [id]);
           await refreshData();
       } catch (e) {
           console.error(e);
       }
  };

  const registrarAsistencia = async (registro: RegistroData): Promise<void> => {
      if (!db) return;
      try {
          // presente: 1 si estado='A', 0 si 'I' o 'IJ'.
          const presente = registro.estado === 'A' ? 1 : 0;
          await db.runAsync(
              'INSERT INTO Registros_Asistencia (estudiante_id, fecha, presente) VALUES (?, ?, ?)',
              [registro.estudiante_id, registro.fecha, presente]
          );
          // Opcional: Podríamos guardar el tipo exacto en otra columna si la tabla lo permite.
      } catch (e) {
          console.error("Error registrarAsistencia:", e);
          throw e;
      }
  };

  const fetchEstudiantes = async (grado?: string, seccion?: string): Promise<any[]> => {
      if (!db) return [];
      try {
          let query = 'SELECT * FROM Estudiantes';
          const params = [];
          const conditions = [];

          if (grado) {
              conditions.push('grado = ?');
              params.push(grado);
          }
          if (seccion) {
              conditions.push('seccion = ?');
              params.push(seccion);
          }

          if (conditions.length > 0) {
              query += ' WHERE ' + conditions.join(' AND ');
          }

          const result = await db.getAllAsync(query, params);
          return result;
      } catch (e) {
          console.error("Error fetchEstudiantes:", e);
          return [];
      }
  };

  const updateEstudiante = async (id: number, data: Partial<EstudianteData>): Promise<void> => {
      if (!db) return;
      try {
          // Construir query dinámico
          const updates = [];
          const params = [];
          if (data.nombre) { updates.push('nombre = ?'); params.push(data.nombre); }
          if (data.grado) { updates.push('grado = ?'); params.push(data.grado); }
          if (data.seccion) { updates.push('seccion = ?'); params.push(data.seccion); }
          if (data.cedula) { updates.push('cedula = ?'); params.push(data.cedula); }

          if (updates.length === 0) return;

          params.push(id);
          await db.runAsync(
              `UPDATE Estudiantes SET ${updates.join(', ')} WHERE id = ?`,
              params
          );
          await refreshData();
      } catch (e) {
          console.error("Error updateEstudiante:", e);
          throw e;
      }
  };

  const deleteEstudiante = async (id: number): Promise<void> => {
       if (!db) return;
       try {
           await db.runAsync('DELETE FROM Estudiantes WHERE id = ?', [id]);
           await refreshData();
       } catch (e) {
           console.error("Error deleteEstudiante:", e);
           throw e;
       }
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
    refreshData,
    fetchEstudiantes,
    updateEstudiante,
    deleteEstudiante
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
