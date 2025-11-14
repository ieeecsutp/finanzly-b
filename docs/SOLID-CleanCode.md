# SOLID y Clean Code en el Backend

## 1. Principios SOLID

### 1.1 SRP - Single Responsibility Principle

**Concepto:** Una clase debe tener una única razón para cambiar.

**Ejemplo en el Código:**

```
// ✅ BIEN: AuthRepository solo gestiona datos
export class AuthRepository {
    async createRefreshToken(
        idUsuario: number,
        token: string,
        fechaExpiracion: Date
    ): Promise<RefreshToken> {
        return await prisma.refreshToken.create({
            data: {
                idUsuario,
                token,
                fechaExpiracion,
            },
        });
    }
}

// ✅ BIEN: AuthService solo gestiona lógica de negocio
export class AuthService {
    async loginAuth(correo: string, contra: string): Promise<AuthLoginRs> {
    const usuario = await this.userRepository.getByEmail(correo);
    const isPasswordValid = verifyPassword(contra, usuario.contraseña);
    if (!isPasswordValid) {
        throw new BadRequestError("Correo o contraseña incorrectos.");
    }
        // ... resto de lógica
    }
}

// ✅ BIEN: AuthController solo gestiona requests/responses
router.post("/login",
    authLoginRq(),
    validateRequest("Datos invalidos"),
    async (req: Request, res: Response, next: NextFunction) => {
        const loginData = await authService.loginAuth(data.correo, data.contraseña);
        res.cookie('refreshToken', loginData.refresh_token, REFRESH_TOKEN_COOKIE_OPTIONS);
        res.status(201).json(response);
    }
);
```

**Explicación:** Cada clase tiene una única responsabilidad: AuthRepository maneja datos, AuthService maneja lógica, AuthController maneja HTTP. Si necesitas cambiar cómo accedes a la BD, solo modificas AuthRepository.

---

### 1.2 OCP - Open/Closed Principle

**Concepto:** Abierto para extensión, cerrado para modificación.

**Ejemplo en el Código:**


```
// ✅ BIEN: Interfaz genérica que permite extender sin modificar
export interface CrudRepository<T> {
    create(data: T): Promise<T>;
    getAll(): Promise<T[]>;
    getById(id: number): Promise<T | null>;
    update(id: number, data: Partial<T>): Promise<T>;
    delete(id: number): Promise<T>;
}

// ✅ BIEN: Implementaciones específicas sin modificar la interfaz
export class UsuarioRepository implements CrudRepository<Usuario>, IUserRepository {
    async getAll(): Promise<Usuario[]> {
        return await prisma.usuario.findMany();
    }
}

export class CategoriaRepository implements CrudRepository<Categoria>, ICategoriaRepository {
    async getAll(): Promise<Categoria[]> {
        return await prisma.categoria.findMany({
            include: { registros: true },
        });
    }
}
```

**Explicación:** La interfaz `CrudRepository<T>` es estable. Puedes crear nuevos repositorios extendiendo esta interfaz sin modificar las clases existentes. El sistema está abierto para extensión pero cerrado para modificación.

---

### 1.3 LSP - Liskov Substitution Principle

**Concepto:** Los objetos derivados deben poder reemplazar a los objetos base sin romper la aplicación.

**Ejemplo en el Código:**

```
// ✅ BIEN: Múltiples implementaciones intercambiables
export class UsuarioRepository implements CrudRepository<Usuario>, IUserRepository {
    async getAll(): Promise<Usuario[]> {
        return await prisma.usuario.findMany();
    }

    async getById(id: number): Promise<Usuario | null> {
        return await prisma.usuario.findUnique({
            where: { idUsuario: id },
            include: { registros: false },
        });
    }
}

export class CategoriaRepository implements CrudRepository<Categoria>, ICategoriaRepository {
    async getAll(): Promise<Categoria[]> {
        return await prisma.categoria.findMany({
            include: {
                registros: true,
            },
        });
    }

    async getById(id: number): Promise<Categoria | null> {
        return await prisma.categoria.findUnique({
            where: { idCategoria: id },
            include: {
                registros: true,
            },
        });
    }
}
```

**Explicación:** Tanto `UsuarioRepository` como `CategoriaRepository` respetan el contrato de `CrudRepository<T>`. Se pueden usar de manera intercambiable sin que el código cliente note la diferencia.

---

### 1.4 ISP - Interface Segregation Principle

**Concepto:** Los clientes no deben depender de interfaces que no utilizan.

**Ejemplo en el Código:**

```
// ✅ BIEN: Interfaces segregadas según responsabilidades
export interface CrudRepository<T> {
    create(data: T): Promise<T>;
    getAll(): Promise<T[]>;
    getById(id: number): Promise<T | null>;
    update(id: number, data: Partial<T>): Promise<T>;
    delete(id: number): Promise<T>;
}

export interface IUserRepository {
    getByEmail(email: string): Promise<Usuario | null>;
}

export interface ICategoriaRepository {
    getByTipo(tipo: string): Promise<Categoria[]>;
    getByNombre(nombre: string): Promise<Categoria | null>;
    getByNombreAndTipo(nombre: string, tipo: string): Promise<Categoria | null>;
    hasRegistros(categoriaId: number): Promise<boolean>;
    getCategoriaStats(categoriaId: number): void;
}

// ✅ BIEN: Cada clase implementa solo lo que necesita
export class UsuarioRepository implements CrudRepository<Usuario>, IUserRepository {
    // Implementa métodos de CrudRepository y IUserRepository
    // No implementa métodos de ICategoriaRepository
}

export class CategoriaRepository implements CrudRepository<Categoria>, ICategoriaRepository {
    // Implementa métodos de CrudRepository y ICategoriaRepository
    // No implementa métodos de IUserRepository
}
```

**Explicación:** En lugar de una megainterface, dividimos en interfaces pequeñas y específicas. `UsuarioRepository` solo implementa las interfaces que necesita, no métodos innecesarios de categorías.

---

### 1.5 DIP - Dependency Inversion Principle

**Concepto:** Depender de abstracciones, no de implementaciones concretas.

**Ejemplo en el Código:**


```
// ❌ MALO: Depender de implementación concreta
export class AuthService {
    private userRepository = new UsuarioRepository(); // Acoplamiento fuerte
}

// ✅ BIEN: Depender de abstracción e inyectar dependencia
export class AuthService {
    private authRepository = new AuthRepository();
    constructor(private userRepository: IUserRepository) {} // Inyección de dependencia

    async createAuth(data: Prisma.UsuarioCreateInput): Promise<UsuarioRs> {
        const existingAuth = await this.userRepository.getByEmail(data.correo);
        // Usa la abstracción, no la implementación concreta
    }
}

// ✅ BIEN: Inyectar implementación desde fuera
const usuarioRepository = new UsuarioRepository();
const authService = new AuthService(usuarioRepository);

// En el futuro, puedes cambiar a una implementación diferente
// sin modificar AuthService
const mongoUsuarioRepository = new MongoUsuarioRepository();
const authService2 = new AuthService(mongoUsuarioRepository);
```

**Explicación:** `AuthService` depende de la interfaz `IUserRepository`, no de la clase concreta `UsuarioRepository`. Esto permite cambiar la implementación (pasar de Prisma a TypeORM) sin tocar `AuthService`.

---

## 2. Evidencias de Clean Code

### 2.1 Nombres Claros y Descriptivos

**Concepto:** Los nombres deben revelar la intención del código.

**Ejemplo en el Código:**

```
// ✅ BIEN: Nombres descriptivos y específicos
export class AuthService {
    async createAuth(data: Prisma.UsuarioCreateInput): Promise<UsuarioRs> {
        const existingAuth = await this.userRepository.getByEmail(data.correo);
        if (existingAuth) {
            throw new DuplicateResourceError("El correo ya está registrado.");
        }
    }
    async loginAuth(correo: string, contra: string): Promise<AuthLoginRs> {
        const usuario = await this.userRepository.getByEmail(correo);
        const isPasswordValid = verifyPassword(contra, usuario.contraseña);
    }

    async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; newRefreshToken: string }> {
        // Nombre claro: indica que renueva un access token
    }
}

// ✅ BIEN: Nombres de variables claros
router.post("/refresh",
    async (req: Request, res: Response, next: NextFunction) => {
        const refreshToken = req.cookies?.refreshToken;
        const { accessToken, newRefreshToken } = await authService.refreshAccessToken(refreshToken);
        res.cookie('refreshToken', newRefreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
    }
);
```

**Explicación:** Los nombres `createAuth`, `loginAuth`, `refreshAccessToken` son claros y describem exactamente qué hacen. Las variables `refreshToken`, `newRefreshToken`, `isPasswordValid` son autoexplicativas.

---

### 2.2 Funciones Pequeñas y Enfocadas

**Concepto:** Cada función debe hacer una cosa bien.

**Ejemplo en el Código:**

```
// ✅ BIEN: Funciones pequeñas con responsabilidad única
export class AuthService {
    // Función pequeña: solo crea autenticación
    async createAuth(data: Prisma.UsuarioCreateInput): Promise<UsuarioRs> {
        const existingAuth = await this.userRepository.getByEmail(data.correo);
        if (existingAuth) {
            throw new DuplicateResourceError("El correo ya está registrado.");
        }
        data.contraseña = getPasswordHash(data.contraseña);
        const usuario = await this.authRepository.create(data);
        return toUserRs(usuario);
    }
    // Función pequeña: solo valida login
    async loginAuth(correo: string, contra: string): Promise<AuthLoginRs> {
        const usuario = await this.userRepository.getByEmail(correo);
        if (!usuario) {
            throw new BadRequestError("Correo o contraseña incorrectos.");
        }
        const isPasswordValid = verifyPassword(contra, usuario.contraseña);
        if (!isPasswordValid) {
            throw new BadRequestError("Correo o contraseña incorrectos.");
        }
        // Delega la creación de tokens a métodos separados
        return this.createLoginResponse(usuario);
    }
}

// ✅ BIEN: Cada repositorio tiene métodos pequeños y específicos
export class CategoriaRepository {
    async getByNombre(nombre: string): Promise<Categoria | null> {
        return await prisma.categoria.findFirst({
            where: {
                nombre: { equals: nombre, mode: 'insensitive' }
            },
        });
    }
    async hasRegistros(categoriaId: number): Promise<boolean> {
        const count = await prisma.registro.count({
            where: { idCategoria: categoriaId },
        });
        return count > 0;
    }

    async getCategoriaStats(categoriaId: number) {
        const stats = await prisma.registro.aggregate({
            where: { idCategoria: categoriaId },
            _count: { idRegistro: true },
            _sum: { monto: true },
        });
        return {
            totalRegistros: stats._count.idRegistro,
            montoTotal: stats._sum.monto ? parseFloat(stats._sum.monto.toString()) : 0,
        };
    }
}
```
**Explicación:** Cada función hace una sola cosa: `createAuth` solo crea, `hasRegistros` solo verifica existencia, `getCategoriaStats` solo calcula estadísticas. Esto facilita testing y mantenimiento.