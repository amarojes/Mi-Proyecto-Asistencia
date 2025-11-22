# Guía de Solución para Fallos de "Preview" en IDX

Este documento resume las causas más comunes de los fallos de construcción en la vista previa ("Preview") de tu proyecto Expo en IDX y los pasos para solucionarlos.

---

## Causa 1: Puerto Ocupado (Error: `address already in use`)

Este es el error más frecuente que hemos encontrado. Ocurre cuando un proceso de servidor de desarrollo anterior no se cerró correctamente y sigue ocupando el puerto que el nuevo proceso necesita (generalmente el puerto `8081`).

### Solución:

La solución más efectiva ha sido forzar la detención de cualquier proceso que esté usando el puerto.

1.  **Encuentra el proceso:**
    ```bash
    lsof -i :8081
    ```

2.  **Detén el proceso:**
    Usa el ID de proceso (PID) que obtuviste del comando anterior.
    ```bash
    kill -9 <PID>
    ```

3.  **Recarga el entorno:**
    Después de detener el proceso, recarga el entorno de IDX para reiniciar el servidor de desarrollo en un estado limpio.

---

## Causa 2: Problemas de Configuración del Entorno

Una configuración incorrecta o incompleta es otra causa principal de fallos.

### Problemas Comunes:

1.  **Falta `babel.config.js`:** Este archivo es **crítico**. Traduce tu código (TypeScript/JSX) a JavaScript que los navegadores puedan entender. Si falta, la aplicación no se puede compilar para la web.
2.  **Configuración incorrecta en `.idx/dev.nix`:** Si los paquetes de Nix o los comandos de inicio (`onStart`) no están bien definidos, el entorno no se preparará correctamente.
3.  **Dependencias de Navegación Faltantes:** Para que `React Navigation` funcione en la web, se necesitan paquetes específicos como `react-native-screens` y `react-native-safe-area-context`.

### Solución:

Revisar y asegurarse de que todos los archivos de configuración necesarios existan y sean correctos, y que todas las dependencias estén instaladas mediante `npm install`.

---

## Estrategia de Migración (Solución Definitiva Anterior)

En una ocasión, el entorno de desarrollo parecía estar corrupto de forma irreparable. La solución fue:

1.  **Crear un nuevo proyecto Expo** (`sistemcontrasistestu-migrated`).
2.  **Copiar el código fuente** (`App.tsx`, el directorio `src/`, etc.) al nuevo proyecto.
3.  **Instalar las dependencias** de nuevo.

Esta medida drástica aseguró un entorno limpio y resolvió los problemas persistentes.

---
