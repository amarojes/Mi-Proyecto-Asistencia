// Este comentario fuerza la recarga
import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent llama a AppRegistry.registerComponent('main', () => App);
// debe ser la última llamada en el archivo para asegurar que el entorno de la app esté configurado
registerRootComponent(App);
