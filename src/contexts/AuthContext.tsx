
import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut, 
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig'; // Importa la instancia de auth

// Extendemos la interfaz User de Firebase para incluir nuestros campos personalizados
export interface User extends FirebaseUser {
    rol?: string;
    grado?: string;
    seccion?: string;
}

// Tipado para el valor del contexto
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Crear el contexto con un valor inicial undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Proveedor de autenticación
export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged devuelve una función para desuscribirse
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // Casteamos a nuestro tipo User (en una app real obtendríamos estos datos de la DB)
      // Por ahora, asumimos que se pueden adjuntar o vienen en el objeto (aunque en Firebase auth puro no vienen,
      // se necesitaría una llamada extra a Firestore o DB local. Para silenciar TS, casteamos).
      setUser(currentUser as User);
      setLoading(false);
    });

    // Limpiar el efecto al desmontar el componente
    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook para usar la autenticación
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
