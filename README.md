# 📦 Vision ITAM — Auditoría Inteligente de Activos de TI

Sistema web full-stack impulsado por visión por computadora e Inteligencia Artificial (Google Gemini) para la identificación, catalogación y auditoría automatizada de equipamiento tecnológico en entornos corporativos.

---

## 🚀 Características Principales

- **Análisis de Imagen por IA**: Carga fotografías de equipos de cómputo, servidores o etiquetas de activos para extraer automáticamente:
  - Marca, modelo y número de serie
  - Categoría del equipo (Laptop, Servidor, Switch, Monitor, etc.)
  - Estado físico aparente y estimación de especificaciones técnicas
- **Gestión de Inventario ITAM**: Tabla interactiva con búsqueda, filtrado por estado, exportación a CSV/JSON e historial de escaneos.
- **Generación de Reportes Ejecutivos**: Resúmenes automáticos de cumplimiento, recomendaciones de actualización tecnológica e inventario consolidado.
- **Modo Demostración Seguro**:
  - Límite configurable de 5 escaneos para evitar consumo excesivo de cuotas de API.
  - Reinicio de cuota protegido mediante **Google OAuth 2.0** exclusivo para la cuenta administradora registrada.
- **Seguridad y Privacidad Integradas**:
  - Arquitectura Full-Stack (Express + React) que mantiene las API Keys de Google Gemini resguardadas exclusivamente en el servidor.
  - Sin exposición de secretos ni almacenamiento de datos personales en el código fuente.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons.
- **Backend**: Node.js, Express.js.
- **Inteligencia Artificial**: Google Gen AI SDK (`@google/genai`) con modelos Gemini Vision.
- **Autenticación**: Google OAuth 2.0 (`google-auth-library`).

---

## ⚙️ Configuración e Instalación Local

### 1. Requisitos Previos
- Node.js (v18 o superior)
- Clave de API de **Google Gemini** ([Obtener en Google AI Studio](https://aistudio.google.com/))
- Credenciales de **Google OAuth 2.0** (Client ID y Client Secret) para la función de administración.

### 2. Clonar el Repositorio e Instalar Dependencias
```bash
git clone https://github.com/TU_USUARIO/vision-itam-audit.git
cd vision-itam-audit
npm install
```

### 3. Configuración de Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto basándote en `.env.example`:

```env
# Clave API de Gemini (Uso exclusivo en servidor)
GEMINI_API_KEY="tu_gemini_api_key_aqui"

# Credenciales de Google OAuth 2.0 (Para autenticación de Administradora)
GOOGLE_CLIENT_ID="tu_google_client_id"
GOOGLE_CLIENT_SECRET="tu_google_client_secret"
```

### 4. Ejecutar en Modo Desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:3000`.

---

## ✒️ Autoría y Atribución

**Creadora Original**: Selene Jiménez  
**Fecha de Creación**: Agosto de 2026  
**Propósito**: Proyecto de Portafolio Profesional y Demostración Técnica.

---

## 📜 Licencia (Atribución Requerida)

Este proyecto se comparte públicamente con fines educativos, de demostración y consulta.

Se permite la libre exploración, copia, bifurcación (*fork*) y adaptación de este código fuente **bajo la condición obligatoria de conservar la constancia de autoría original**:

1. **Reconocimiento de Créditos**: Cualquier proyecto derivado, copia o reutilización parcial/total debe incluir de manera clara y visible la atribución a la creadora original (**Selene Jiménez - Agosto 2026**).
2. **Respeto a la Propiedad Intelectual**: La publicación en repositorios públicos deja registro histórico e inalterable de la autoría original de este trabajo.

---
*Desarrollado por Selene Jiménez — 2026.*
