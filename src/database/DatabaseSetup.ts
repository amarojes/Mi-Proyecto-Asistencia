
import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

// =====================================================================================
//  MANEJO DE LA BASE DE DATOS SEGÚN LA PLATAFORMA
// =====================================================================================

// Declaramos una variable para la base de datos
let db: SQLite.WebSQLDatabase;

// Si no estamos en web, abrimos la base de datos real.
if (Platform.OS !== 'web') {
  db = SQLite.openDatabase('asistencias.db');
} else {
  // En la web, creamos un objeto 'mock' que simula la API de la base de datos.
  // Esto evita que la aplicación se rompa al intentar usar una base de datos que no existe.
  db = {
    transaction: (callback, errorCallback, successCallback) => {
      // Simulamos una transacción exitosa para que la app no se bloquee.
      if (successCallback) {
        console.log("DB_MOCK: Transacción simulada con éxito.");
        successCallback();
      }
    },
    // Añadimos las demás propiedades de la interfaz para que coincida con el tipo.
    version: 'mock-1.0',
    _db: { close: () => {} },
    closeAsync: async () => {},
    deleteAsync: async () => {},
    exec: (queries, readOnly, callback) => {},
  } as unknown as SQLite.WebSQLDatabase;
}


// =====================================================================================
//  FUNCIÓN PARA CREAR TABLAS (MODIFICADA PARA SER ASÍNCRONA)
// =====================================================================================
const createTables = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Función de callback para errores de SQL
      const onError = (_: any, error: SQLite.SQLError): boolean => {
        console.error("Error en SQL:", error.message);
        reject(error);
        return false; // Indica que el error no se ha manejado y debe propagarse
      };

      // Creamos la tabla de Usuarios
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS Usuarios (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          usuario TEXT UNIQUE,
          password TEXT,
          rol TEXT
        );`,
        [],
        undefined,
        onError
      );

      // Creamos la tabla de Estudiantes
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS Estudiantes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre TEXT,
          grado TEXT,
          seccion TEXT,
          cedula TEXT UNIQUE
        );`,
        [],
        undefined,
        onError
      );

      // Creamos la tabla de Registros de Asistencia
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS Registros_Asistencia (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          estudiante_id INTEGER,
          fecha TEXT,
          presente INTEGER,
          FOREIGN KEY(estudiante_id) REFERENCES Estudiantes(id)
        );`,
        [],
        undefined,
        onError
      );

      // Creamos la tabla de Colas de Sincronización
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS Colas_Sincronizacion (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          tabla TEXT,
          registro_id INTEGER,
          accion TEXT
        );`,
        [],
        undefined,
        onError
      );
    },
    // Callback de error de la transacción
    (error) => {
      console.error("Error en la transacción de creación de tablas:", error.message);
      reject(error);
    },
    // Callback de éxito de la transacción
    () => {
      console.log("Tablas creadas o ya existentes.");
      resolve();
    });
  });
};

// =====================================================================================
//  FUNCIÓN PARA INSERTAR EL ADMINISTRADOR POR DEFECTO (MODIFICADA)
// =====================================================================================
const insertDefaultAdmin = (): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      const hashedPassword = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        'admin123'
      );

      db.transaction(tx => {
          tx.executeSql(
            'INSERT OR IGNORE INTO Usuarios (usuario, password, rol) VALUES (?, ?, ?);',
            ['admin', hashedPassword, 'Administrador'],
            (_, { rowsAffected }) => {
              if (rowsAffected > 0) {
                console.log("Usuario administrador por defecto insertado.");
              } else {
                console.log("Usuario administrador ya existe, no se ha insertado.");
              }
            },
            (_, error) => {
              console.error("Error al insertar el administrador:", error.message);
              reject(error);
              return false;
            }
          );
        },
        (error) => {
          console.error("Error en la transacción de inserción:", error.message);
          reject(error);
        },
        () => {
          resolve();
        }
      );
    } catch (error) {
      console.error("Error al generar el hash de la contraseña:", error);
      reject(error);
    }
  });
};

// =====================================================================================
//  FUNCIÓN DE INICIALIZACIÓN PRINCIPAL (AHORA ASÍNCRONA Y CONSCIENTE DE LA PLATAFORMA)
// =====================================================================================
export const initializeDatabase = async (): Promise<void> => {
  // Si estamos en la web, no hacemos nada y terminamos.
  if (Platform.OS === 'web') {
    console.log("Plataforma web detectada. Se omitirá la inicialización de la base de datos.");
    return;
  }

  // Si no es web, procedemos con la inicialización normal.
  try {
    console.log("Iniciando la base de datos...");
    await createTables();
    await insertDefaultAdmin();
    console.log("Base de datos inicializada con éxito.");
  } catch (error) {
    console.error("Fallo durante la inicialización de la base de datos:", error);
    // Lanzamos el error para que la aplicación pueda manejarlo
    throw error;
  }
};

// Exportamos la instancia de la base de datos para que el resto de la app la use
export { db };
