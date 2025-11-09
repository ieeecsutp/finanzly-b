<div align="center">

<strong><h1>
FINANZLY</h1></strong>

## ![IEEE Comité de Proyectos](https://img.shields.io/badge/IEEE-Comité%20de%20Proyectos-1E90FF?style=for-the-badge&logo=ieee&logoColor=white)




<a id="readme-top"></a>

<br>

  <img width="500px" height="250px" src="assets/Finanzly3.png" alt="Logo" width="800" />

</div>

## 🛠️ Tecnologías Principales
- ![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white) - Entorno de ejecución
- ![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white) - Framework web
- ![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white) - ORM
- ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white) - Base de datos
- ![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white) - Testing

## 🏗️ Estructura del Proyecto
```
finanzly-b/
├── 📁 src/
│   ├── auth/           # Autenticación
│   ├── categoria/      # Gestión de categorías
│   ├── registro/       # Registros financieros
│   ├── usuario/        # Gestión de usuarios
│   ├── lib/           # Configuraciones
│   ├── routes/        # Rutas API
│   └── utils/         # Utilidades
├── 📁 prisma/         # Modelos y migraciones
├── 📁 tests/          # Pruebas
│   ├── integration/   # Pruebas de integración
│   └── unit/         # Pruebas unitarias
└── 📁 docs/           # Documentación
```

## ⚙️ Requisitos Previos
- Node.js v20+
- PostgreSQL
- npm/yarn/pnpm

## 🚀 Instalación

1. Clonar el repositorio
```bash
git clone https://github.com/ieeecsutp/finanzly-b.git
cd finanzly-b
```

2. Instalar dependencias
```bash
npm install
```

3. Configurar variables de entorno
```bash
cp .env.example .env
```

4. Ejecutar migraciones
```bash
npx prisma migrate dev
```

5. Iniciar servidor
```bash
npm run dev
```

## 📝 Scripts Disponibles
```bash
# Desarrollo
npm run dev

# Pruebas
npm run test
npm run test:coverage

# Migraciones
npm run migrate:dev
npm run migrate:reset
```

## 🧪 Testing
El proyecto utiliza Jest para pruebas unitarias e integración:
```bash
# Ejecutar todas las pruebas
npm test

# Ver cobertura
npm run test:coverage
```

## 📚 API Endpoints

### 🔐 Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/refresh` - Refrescar token

### 👤 Usuarios
- `GET /api/usuarios` - Obtener usuarios
- `PUT /api/usuarios/:id` - Actualizar usuario

### 💰 Registros Financieros
- `GET /api/registros` - Obtener registros
- `POST /api/registros` - Crear registro
- `PUT /api/registros/:id` - Actualizar registro
- `DELETE /api/registros/:id` - Eliminar registro

## 👥 Equipo B
[![Diego Huaman](https://img.shields.io/badge/Diego%20Huaman-%2338B2AC?style=for-the-badge&logo=react&logoColor=white)](https://www.linkedin.com/in/diego-huaman1121/)
[![Ronal Trinidad](https://img.shields.io/badge/Ronal%20Trinidad-%23F59E0B?style=for-the-badge&logo=javascript&logoColor=white)](https://www.linkedin.com/in/ronal-tsilva-2583792a3/)
[![Marcio Zinanyuca](https://img.shields.io/badge/Marcio%20Zinanyuca-%2300629B?style=for-the-badge&logo=ieee&logoColor=white)](https://www.linkedin.com/in/marcio-zinanyuca)

<p align="right">
    (<strong><a href="#readme-top">regresar</a></strong>)

---

Pasos para implementar:
Backend:

1. Primero, necesitamos crear el sistema de autenticación en el backend
//Instalación de dependencias adicionales:
npm install bcryptjs jsonwebtoken
npm install --save-dev @types/bcryptjs @types/jsonwebtoken

//Variables de entorno (.env):
JWT_SECRET=tu_clave_secreta_muy_segura_aqui
JWT_EXPIRES_IN=7d