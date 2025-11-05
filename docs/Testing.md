# 📋 Documentación de Testing - Finanzly Backend

**Fecha**: Noviembre 2025  
**Proyecto**: Finanzly Backend  
**Framework**: Jest + TypeScript  
**Base de Datos**: PostgreSQL  

---

## Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Estructura de Tests](#estructura-de-tests)
3. [Modelo AAA (Arrange-Act-Assert)](#modelo-aaa)
4. [Pruebas Unitarias](#pruebas-unitarias)
5. [Pruebas de Integración](#pruebas-de-integración)
6. [Reporte de Cobertura](#reporte-de-cobertura)
7. [Ejecución de Tests](#ejecución-de-tests)

---

## Visión General

Este documento describe la estrategia de testing implementada en el backend de Finanzly, incluyendo pruebas unitarias, pruebas de integración y métricas de cobertura de código.

### Objetivos de Testing

- ✅ Validar funcionamiento de servicios de forma aislada
- ✅ Verificar integración correcta entre capas (Controlador → Servicio → Repositorio → BD)
- ✅ Garantizar manejo correcto de errores y validaciones
- ✅ Mantener cobertura de código superior al 80%

### Tecnologías Utilizadas

| Herramienta | Versión | Propósito |
|-------------|---------|----------|
| **Jest** | 30.2.0 | Framework de testing |
| **ts-jest** | 29.4.5 | Soporte para TypeScript |
| **Supertest** | 7.1.4 | Testing de endpoints HTTP |
| **Prisma** | 6.14.0 | ORM y migraciones de BD |
| **PostgreSQL** | 17 | Base de datos de pruebas |

---

## Estructura de Tests

```
tests/
├── unit/
│ ├── usuario.service.test.ts ✅ Completado
│ ├── auth.service.test.ts ❌ Pendiente
│ ├── categoria.service.test.ts ❌ Pendiente
│ ├── registro.service.test.ts ❌ Pendiente
│ ├── auth.utils.test.ts ❌ Pendiente
│ └── error-handler.test.ts ❌ Pendiente
├── integration/
│ └── auth.test.ts ✅ Completado
├── globalSetup.ts ✅ Migraciones DB
├── globalTeardown.ts ✅ Limpieza DB
└── setup.ts ✅ Configuración

src/
├── usuario/
│ ├── usuario.service.ts
│ ├── usuario.repository.ts
│ ├── usuario.controller.ts
│ └── mapper/
├── auth/
│ ├── auth.service.ts
│ ├── auth.controller.ts
│ └── auth.routes.ts
└── utils/
├── auth.ts
└── error-handler.ts
```

---

## Modelo AAA

El modelo **Arrange-Act-Assert** es la base de todas nuestras pruebas. Cada test sigue esta estructura:

### 1️⃣ Arrange (Preparar)

Configurar los datos iniciales, mocks y el estado necesario para la prueba.

```
// Ejemplo: Preparar datos de prueba
const mockCreateData: Prisma.UsuarioCreateInput = {
correo: "test@example.com",
contraseña: "password123",
nombre: "Juan Pérez"
};

// Configurar mocks
mockUsuarioRepository.getByEmail.mockResolvedValue(null);
mockGetPasswordHash.mockReturnValue("hashed_password_123");
```

**En nuestro proyecto**:
- Creamos objetos mock con datos válidos
- Configuramos comportamientos esperados de dependencias
- Preparamos el estado de la base de datos

### 2️⃣ Act (Actuar)

Ejecutar la función o método que se está probando.

```
// Ejemplo: Ejecutar el método a probar
const result = await usuarioService.createUsuario(mockCreateData);
```

**En nuestro proyecto**:
- Llamamos métodos de servicios
- Enviamos requests HTTP (en tests de integración)
- Ejecutamos funciones de utilidad

### 3️⃣ Assert (Verificar)

Comprobar que los resultados son los esperados.

```
// Ejemplo: Verificar resultados
expect(result).toEqual(mockUsuarioDetailRs);
expect(mockUsuarioRepository.create).toHaveBeenCalledWith({
...mockCreateData,
contraseña: mockHashedPassword
});
expect(mockGetPasswordHash).toHaveBeenCalledTimes(1);
```

**En nuestro proyecto**:
- Verificamos valores retornados
- Validamos que se llamaron métodos correctos
- Comprobamos que las excepciones se lanzan apropiadamente

### Ejemplo Completo AAA

```
describe("UsuarioService.createUsuario", () => {
    it("debe crear un usuario exitosamente cuando el correo no existe", async () => {
        // ✅ ARRANGE
        const mockCreateData: Prisma.UsuarioCreateInput = {
        correo: "test@example.com",
        contraseña: "password123",
        nombre: "Juan Pérez"
        };
        mockUsuarioRepository.getByEmail.mockResolvedValue(null);
        mockGetPasswordHash.mockReturnValue("hashed_password");
        mockUsuarioRepository.create.mockResolvedValue(mockCreatedUsuario);
        
        // ✅ ACT
        const result = await usuarioService.createUsuario(mockCreateData);
        
        // ✅ ASSERT
        expect(mockUsuarioRepository.getByEmail).toHaveBeenCalledWith("test@example.com");
        expect(mockGetPasswordHash).toHaveBeenCalledWith("password123");
        expect(result).toEqual(mockUsuarioDetailRs);
    });
});

```

---

## Pruebas Unitarias

### Descripción

Las pruebas unitarias validan el funcionamiento de servicios, funciones o módulos individuales sin depender de componentes externos.

**Características**:
- 🚀 Rápidas de ejecutar
- 🔒 Independientes entre sí
- 🎭 Utilizan mocks para simular dependencias
- 📍 Enfocadas en una sola responsabilidad

### Pruebas Implementadas

#### `tests/unit/usuario.service.test.ts`

**Objetivo**: Validar todas las operaciones CRUD del servicio de usuarios.

**Casos de Prueba**:

| Función | Caso | Esperado |
|---------|------|----------|
| `createUsuario` | Email nuevo | Usuario creado exitosamente ✅ |
| `createUsuario` | Email duplicado | Lanza `DuplicateResourceError` ✅ |
| `getAllUsuarios` | Sin usuarios | Retorna array vacío ✅ |
| `getAllUsuarios` | Con usuarios | Retorna lista de usuarios ✅ |
| `getUsuarioById` | Usuario existe | Retorna usuario ✅ |
| `getUsuarioById` | Usuario no existe | Lanza `ResourceNotFoundError` ✅ |
| `updateUsuario` | Usuario existe | Usuario actualizado ✅ |
| `updateUsuario` | Usuario no existe | Lanza `ResourceNotFoundError` ✅ |
| `deleteUsuario` | Usuario existe | Usuario eliminado ✅ |
| `deleteUsuario` | Usuario no existe | Lanza `ResourceNotFoundError` ✅ |

**Cobertura**: 
- Statements: 22/79 (27.84%)
- Branches: 0%
- Functions: 0/8
- Lines: 0/16

**Ejemplo de Test Unitario**:

```
it("debe lanzar DuplicateResourceError cuando el correo ya existe", async () => {
    // ARRANGE
    const mockExistingUsuario: Usuario = {
    idUsuario: 1,
    correo: "test@example.com",
    contraseña: "existing_hash",
    nombre: "Usuario Existente",
    fechaCreado: mockDate
    };
    mockUsuarioRepository.getByEmail.mockResolvedValue(mockExistingUsuario);
    // ACT & ASSERT
    await expect(usuarioService.createUsuario(mockCreateData))
        .rejects
        .toThrow(DuplicateResourceError);

    expect(mockUsuarioRepository.getByEmail).toHaveBeenCalledWith("test@example.com");
    expect(getPasswordHash).not.toHaveBeenCalled();
});
```

---

## Pruebas de Integración

### Descripción

Las pruebas de integración validan la interacción correcta entre múltiples módulos del sistema, verificando que las distintas capas (Controlador → Servicio → Repositorio → Base de Datos) funcionen juntas.

**Características**:
- 🔄 Prueban flujos completos
- 💾 Utilizan base de datos real
- 🌐 Verifican endpoints HTTP
- ⏱️ Más lentas que unitarias

### Pruebas Implementadas

#### `tests/integration/auth.test.ts`

**Objetivo**: Validar flujos completos de autenticación (registro y login).

**Endpoints Probados**:

| Endpoint | Método | Casos Probados |
|----------|--------|----------------|
| `/api/v1/auth/register` | POST | 6 casos ✅ |
| `/api/v1/auth/login` | POST | 7 casos ✅ |
| Flujos completos | MIXED | 4 casos ✅ |

**Casos de Prueba - Register**:

```
✅ debe registrar un usuario correctamente con datos válidos
✅ debe rechazar el registro si el email ya existe (409)
✅ debe rechazar el registro si falta el email (400)
✅ debe rechazar el registro si falta la contraseña (400)
✅ debe rechazar el registro si falta el nombre (400)
✅ debe rechazar el registro si el email no es válido (400)
```

**Casos de Prueba - Login**:

```
✅ debe hacer login exitosamente con credenciales válidas (200/201)
✅ debe rechazar login con contraseña incorrecta (400/401)
✅ debe rechazar login si el usuario no existe (400/401)
✅ debe rechazar login si falta el correo (400)
✅ debe rechazar login si falta la contraseña (400)
✅ debe rechazar login con credenciales vacías (400)
```

**Casos de Prueba - Flujos Completos**:

```
✅ debe registrar, luego hacer login correctamente
✅ no debe permitir acceso a rutas protegidas sin token (401)
✅ no debe permitir acceso con token inválido (401)
✅ debe permitir acceso a recurso protegido con token válido (200)
```

**Ejemplo de Test de Integración**:

```
it("debe registrar un usuario correctamente con datos válidos", async () => {
    // ARRANGE
    const newUser = {
    correo: "nuevo@example.com",
    contraseña: "password123",
    nombre: "Juan Pérez"
    };
    // ACT
    const res = await request(app)
        .post("/api/v1/auth/register")
        .send(newUser);

    // ASSERT
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("data");
    expect(res.body.data).toHaveProperty("id");
    expect(res.body.data.correo).toBe(newUser.correo);

    // Verificar en BD
    const usuarioGuardado = await prisma.usuario.findUnique({
        where: { correo: newUser.correo }
    });
    expect(usuarioGuardado).not.toBeNull();
});
```
---

## Reporte de Cobertura

### Resumen General

```
Test Suites: 1 passed, 1 passed, 2 total
Tests: 26 passed (0 failed)
Snapshots: 0 total
Time: 3.785 s
```

### Métricas por Componente

![Reporte de Cobertura](../assets/cov-report.png)

#### Cobertura EXCELENTE (80%+)

| Componente | Statements | Branches | Functions | Lines |
|-----------|-----------|----------|-----------|-------|
| 🟢 lib | 87.5% | 100% | 100% | 87.5% |
| 🟢 routes | 100% | 100% | 100% | 100% |
| 🟢 auth/request | 100% | 100% | 100% | 100% |
| 🟢 categoria/request | 100% | 100% | 100% | 100% |
| 🟢 registro/request | 100% | 100% | 100% | 100% |

#### Cobertura MEDIA (50-79%)

| Componente | Statements | Branches | Functions | Lines |
|-----------|-----------|----------|-----------|-------|
| 🟡 auth/mapper | 50% | 100% | 0% | 50% |
| 🟡 categoria/mapper | 33.33% | 100% | 0% | 37.5% |
| 🟡 registro/mapper | 50% | 100% | 0% | 57.14% |

#### Cobertura BAJA (<50%)

| Componente | Statements | Branches | Functions | Lines |
|-----------|-----------|----------|-----------|-------|
| 🔴 auth | 23.91% | 23.91% | 0% | 0% |
| 🔴 categoria | 18.84% | 0% | 0% | 19.11% |
| 🔴 registro | 16.56% | 0% | 0% | 16.96% |
| 🔴 usuario | 27.84% | 0% | 0% | 27.84% |
| 🔴 utils | 33.33% | 10.81% | 5% | 30.95% |

### Análisis de Cobertura

#### Fortalezas ✅

1. **Tipos y Estructuras**: 100% de cobertura en tipos/requests
2. **Rutas**: Todas las rutas están definidas correctamente
3. **Funciones de Utilidad**: Librerías bien cubiertas

#### Áreas de Mejora ❌

1. **Servicios**: Necesitan tests unitarios adicionales
2. **Controladores**: Sin pruebas dedicadas
3. **Utilidades**: Funciones de autenticación sin cobertura

---

## Ejecución de Tests

### Instalación de Dependencias


```
npm install
npm install --save-dev jest ts-jest @types/jest supertest dotenv
```

### Configuración de Archivos

**`jest.config.js`**:

```
module.exports = {
preset: 'ts-jest',
testEnvironment: 'node',
roots: ['<rootDir>'],
testMatch: ['/tests//.test.ts'],
testTimeout: 15000,
globalSetup: '<rootDir>/tests/globalSetup.ts',
globalTeardown: '<rootDir>/tests/globalTeardown.ts',
collectCoverageFrom: [
'src/**/.ts',
'!src/**/*.d.ts',
'!src/index.ts',
],
};
```

**`.env.test`**:

```
NODE_ENV=test
DATABASE_URL="postgresql://user:password@localhost:5432/finanzly_test"
JWT_SECRET="test_secret_key"
PORT=3001
```

### Comandos de Ejecución

```
Ejecutar todos los tests con cobertura
npm test

Ejecutar solo tests unitarios
npm run test:unit

Ejecutar solo tests de integración
npm run test:integration

Ejecutar en modo watch
npm run test:watch
```

### Scripts en `package.json`

```
{
"scripts": {
"test": "jest --coverage",
"test:watch": "jest --watch",
"test:unit": "jest tests/unit --coverage",
"test:integration": "dotenv -e .env.test -- jest tests/integration --testTimeout=15000",
"test:report": "jest --coverage && start coverage/index.html"
}
}
```
---

**Última actualización**: Noviembre 04, 2025  
**Mantenedor**: Equipo de Desarrollo  
**Estado**: En Progreso 🚀