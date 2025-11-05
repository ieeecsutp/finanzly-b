// tests/integration/auth.test.ts
import request from "supertest";
import app from "../../src/index";
import { PrismaClient } from "@prisma/client";
import { getPasswordHash } from "../../src/utils/auth";

const prisma = new PrismaClient();

describe("Auth API - Integration Tests", () => {
    beforeEach(async () => {
        await prisma.refreshToken.deleteMany({});
        await prisma.usuario.deleteMany({});
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe("POST /api/v1/auth/register", () => {
        it("debe registrar un usuario correctamente con datos válidos", async () => {
            const newUser = {
                correo: "nuevo@example.com",
                contraseña: "password123",
                nombre: "Juan Pérez"
            };

            const res = await request(app)
                .post("/api/v1/auth/register")
                .send(newUser);

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty("data");
            expect(res.body.data).toHaveProperty("id");
            expect(res.body.data.correo).toBe(newUser.correo);
        });

        it("debe rechazar el registro si el email ya existe", async () => {
            const usuarioExistente = {
                correo: "existente@example.com",
                contraseña: getPasswordHash("password123"),
                nombre: "Usuario Existente"
            };
            await prisma.usuario.create({ data: usuarioExistente });

            const res = await request(app)
                .post("/api/v1/auth/register")
                .send({
                    correo: "existente@example.com",
                    contraseña: "newpassword",
                    nombre: "Otro Nombre"
                });

            expect(res.status).toBe(409);
            expect(res.body).toHaveProperty("message");
        });

        it("debe rechazar el registro si falta el email", async () => {
            const res = await request(app)
                .post("/api/v1/auth/register")
                .send({
                    contraseña: "password123",
                    nombre: "Juan Pérez"
                });

            expect(res.status).toBe(400);
        });

        it("debe rechazar el registro si falta la contraseña", async () => {
            const res = await request(app)
                .post("/api/v1/auth/register")
                .send({
                    correo: "nuevo@example.com",
                    nombre: "Juan Pérez"
                });

            expect(res.status).toBe(400);
        });

        it("debe rechazar el registro si falta el nombre", async () => {
            const res = await request(app)
                .post("/api/v1/auth/register")
                .send({
                    correo: "nuevo@example.com",
                    contraseña: "password123"
                });

            expect(res.status).toBe(400);
        });

        it("debe rechazar el registro si el email no es válido", async () => {
            const res = await request(app)
                .post("/api/v1/auth/register")
                .send({
                    correo: "emailinvalido",
                    contraseña: "password123",
                    nombre: "Juan Pérez"
                });

            expect(res.status).toBe(400);
        });
    });

    describe("POST /api/v1/auth/login", () => {
        it("debe hacer login exitosamente con credenciales válidas", async () => {
            const password = "password123";
            await prisma.usuario.create({
                data: {
                    correo: "login@example.com",
                    contraseña: getPasswordHash(password),
                    nombre: "Usuario Login"
                }
            });

            const res = await request(app)
                .post("/api/v1/auth/login")
                .send({
                    correo: "login@example.com",
                    contraseña: password
                });

            expect([200, 201]).toContain(res.status);
            expect(res.body).toHaveProperty("data");
            expect(res.body.data).toHaveProperty("access_token");
            expect(res.body.data).toHaveProperty("refresh_token");
            expect(res.body.data).toHaveProperty("usuario");
            expect(res.body.data.usuario).not.toHaveProperty("contraseña");
        });

        it("debe rechazar login con contraseña incorrecta", async () => {
            await prisma.usuario.create({
                data: {
                    correo: "login@example.com",
                    contraseña: getPasswordHash("contraseña_correcta"),
                    nombre: "Usuario Login"
                }
            });

            const res = await request(app)
                .post("/api/v1/auth/login")
                .send({
                    correo: "login@example.com",
                    contraseña: "contraseña_incorrecta"
                });

            expect([400, 401]).toContain(res.status);
            expect(res.body.status).not.toBe("success");
        });

        it("debe rechazar login si el usuario no existe", async () => {
            const res = await request(app)
                .post("/api/v1/auth/login")
                .send({
                    correo: "noexiste@example.com",
                    contraseña: "password123"
                });

            expect([400, 401]).toContain(res.status);
            expect(res.body.status).not.toBe("success");
        });

        it("debe rechazar login si falta el correo", async () => {
            const res = await request(app)
                .post("/api/v1/auth/login")
                .send({
                    contraseña: "password123"
                });

            expect(res.status).toBe(400);
        });

        it("debe rechazar login si falta la contraseña", async () => {
            const res = await request(app)
                .post("/api/v1/auth/login")
                .send({
                    correo: "login@example.com"
                });

            expect(res.status).toBe(400);
        });

        it("debe rechazar login con credenciales vacías", async () => {
            const res = await request(app)
                .post("/api/v1/auth/login")
                .send({});

            expect(res.status).toBe(400);
        });
    });

    describe("Flujos de Integración Completos", () => {
        it("debe registrar, luego hacer login correctamente", async () => {
            const nuevoUsuario = {
                correo: "flujo@example.com",
                contraseña: "password123",
                nombre: "Flujo Test"
            };

            const registerRes = await request(app)
                .post("/api/v1/auth/register")
                .send(nuevoUsuario);

            expect(registerRes.status).toBe(201);
            expect(registerRes.body).toHaveProperty("data");

            const loginRes = await request(app)
                .post("/api/v1/auth/login")
                .send({
                    correo: nuevoUsuario.correo,
                    contraseña: nuevoUsuario.contraseña
                });

            expect([200, 201]).toContain(loginRes.status);
            expect(loginRes.body.data).toHaveProperty("access_token");
            expect(loginRes.body.data).toHaveProperty("usuario");
            expect(loginRes.body.data.usuario.correo).toBe(nuevoUsuario.correo);
        });

        it("no debe permitir acceso a rutas protegidas sin token", async () => {
            const res = await request(app)
                .get("/api/v1/usuarios");

            expect(res.status).toBe(401);
        });

        it("no debe permitir acceso con token inválido", async () => {
            const res = await request(app)
                .get("/api/v1/usuarios")
                .set("Authorization", "Bearer token_invalido");

            expect(res.status).toBe(401);
        });

        it("debe permitir acceso a recurso protegido con token válido", async () => {
            const password = "password123";
            const usuario = await prisma.usuario.create({
                data: {
                    correo: "protegido@example.com",
                    contraseña: getPasswordHash(password),
                    nombre: "Usuario Protegido"
                }
            });

            const loginRes = await request(app)
                .post("/api/v1/auth/login")
                .send({
                    correo: "protegido@example.com",
                    contraseña: password
                });

            expect([200, 201]).toContain(loginRes.status);
            expect(loginRes.body.data).toHaveProperty("access_token");
            const token = loginRes.body.data.access_token;

            const protectedRes = await request(app)
                .get(`/api/v1/usuarios/${usuario.idUsuario}`)
                .set("Authorization", `Bearer ${token}`);

            expect(protectedRes.status).toBe(200);
        });
    });
});
