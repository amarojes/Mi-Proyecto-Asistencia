
import { openDatabaseSync, SQLiteDatabase } from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

// =====================================================================================
//  MANEJO DE LA BASE DE DATOS SEGÚN LA PLATAFORMA
// =====================================================================================

// Declaramos una variable para la base de datos
// En la nueva versión de expo-sqlite, openDatabaseSync devuelve un objeto SQLiteDatabase directamente.
let db: SQLiteDatabase | null = null;

// Si no estamos en web, abrimos la base de datos real.
if (Platform.OS !== 'web') {
  try {
    db = openDatabaseSync('asistencias.db');
  } catch (e) {
    console.error("Error al abrir la base de datos:", e);
  }
}

// =====================================================================================
//  FUNCIÓN DE INICIALIZACIÓN PRINCIPAL
// =====================================================================================
export const initializeDatabase = async (): Promise<void> => {
  // Si estamos en la web o no hay DB, no hacemos nada y terminamos.
  if (Platform.OS === 'web' || !db) {
    console.log("Plataforma web o error de DB. Se omitirá la inicialización de la base de datos.");
    return;
  }

  // Si no es web, procedemos con la inicialización normal usando la API moderna (Async).
  try {
    console.log("Iniciando la base de datos...");

    // Crear tablas
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS Usuarios (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          usuario TEXT UNIQUE,
          password TEXT,
          rol TEXT
      );
      CREATE TABLE IF NOT EXISTS Estudiantes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre TEXT,
          grado TEXT,
          seccion TEXT,
          cedula TEXT UNIQUE
      );
      CREATE TABLE IF NOT EXISTS Registros_Asistencia (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          estudiante_id INTEGER,
          fecha TEXT,
          presente INTEGER,
          FOREIGN KEY(estudiante_id) REFERENCES Estudiantes(id)
      );
      CREATE TABLE IF NOT EXISTS Colas_Sincronizacion (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          tabla TEXT,
          registro_id INTEGER,
          accion TEXT
      );
    `);

    // Insertar administrador por defecto
    const hashedPassword = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        'admin123'
    );

    // Verificar si existe el admin
    const existingAdmin = await db.getFirstAsync('SELECT * FROM Usuarios WHERE usuario = ?', ['admin']);

    if (!existingAdmin) {
        await db.runAsync(
            'INSERT INTO Usuarios (usuario, password, rol) VALUES (?, ?, ?)',
            ['admin', hashedPassword, 'Administrador']
        );
        console.log("Usuario administrador por defecto insertado.");
    } else {
        console.log("Usuario administrador ya existe.");
    }

    console.log("Base de datos inicializada con éxito.");
  } catch (error) {
    console.error("Fallo durante la inicialización de la base de datos:", error);
    // Lanzamos el error para que la aplicación pueda manejarlo
    throw error;
  }
};

// Exportamos la instancia de la base de datos
export { db };
