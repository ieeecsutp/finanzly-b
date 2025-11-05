import { UsuarioService } from "../../src/usuario/usuario.service";
import { UsuarioRepository } from "../../src/usuario/usuario.repository";
import { getPasswordHash } from "../../src/utils/auth";
import { toUserDetailRs } from "../../src/usuario/mapper/usuario.mapper";
import { UsuarioDetailRs } from "../../src/usuario/response/usuario-detail-rs";
import { DuplicateResourceError, ResourceNotFoundError } from "../../src/utils/error-types";
import { Prisma, Usuario } from "@prisma/client";

jest.mock("../../src/usuario/usuario.repository");
jest.mock("../../src/utils/auth");
jest.mock("../../src/usuario/mapper/usuario.mapper");

describe("UsuarioService", () => {
    let usuarioService: UsuarioService;
    let mockUsuarioRepository: jest.Mocked<UsuarioRepository>;
    let mockGetPasswordHash: jest.MockedFunction<typeof getPasswordHash>;
    let mockToUserDetailRs: jest.MockedFunction<typeof toUserDetailRs>;

    const mockDate = new Date("2025-11-04T18:52:00Z");
    const mockDateIso = mockDate.toISOString(); // "2025-11-04T18:52:00.000Z"

    beforeEach(() => {
        jest.clearAllMocks();
        usuarioService = new UsuarioService();

        mockUsuarioRepository = new UsuarioRepository() as jest.Mocked<UsuarioRepository>;
        mockGetPasswordHash = getPasswordHash as jest.MockedFunction<typeof getPasswordHash>;
        mockToUserDetailRs = toUserDetailRs as jest.MockedFunction<typeof toUserDetailRs>;

        (usuarioService as any).usuarioRepository = mockUsuarioRepository;
    });

    describe("createUsuario", () => {
        const mockCreateData: Prisma.UsuarioCreateInput = {
            correo: "test@example.com",
            contraseña: "password123",
            nombre: "Juan Pérez"
        };

        it("debe crear un usuario exitosamente cuando el correo no existe", async () => {
            // Arrange
            const mockHashedPassword = "hashed_password_123";
            const mockCreatedUsuario: Usuario = {
                idUsuario: 1,
                correo: "test@example.com",
                contraseña: mockHashedPassword,
                nombre: "Juan Pérez",
                fechaCreado: mockDate
            };
            const mockUsuarioDetailRs: UsuarioDetailRs = {
                id_usuario: 1,
                correo: "test@example.com",
                nombre: "Juan Pérez",
                fechaCreado: mockDateIso
            };

            mockUsuarioRepository.getByEmail.mockResolvedValue(null);
            mockGetPasswordHash.mockReturnValue(mockHashedPassword);
            mockUsuarioRepository.create.mockResolvedValue(mockCreatedUsuario);
            mockToUserDetailRs.mockReturnValue(mockUsuarioDetailRs);

            // Act
            const result = await usuarioService.createUsuario(mockCreateData);

            // Assert
            expect(mockUsuarioRepository.getByEmail).toHaveBeenCalledWith("test@example.com");
            expect(mockGetPasswordHash).toHaveBeenCalledWith("password123");
            expect(mockUsuarioRepository.create).toHaveBeenCalled();
            expect(mockToUserDetailRs).toHaveBeenCalledWith(mockCreatedUsuario);
            expect(result).toEqual(mockUsuarioDetailRs);
        });

        it("debe lanzar DuplicateResourceError cuando el correo ya existe", async () => {
            // Arrange
            const mockExistingUsuario: Usuario = {
                idUsuario: 1,
                correo: "test@example.com",
                contraseña: "existing_hash",
                nombre: "Usuario Existente",
                fechaCreado: mockDate
            };

            mockUsuarioRepository.getByEmail.mockResolvedValue(mockExistingUsuario);

            // Act & Assert
            await expect(usuarioService.createUsuario(mockCreateData))
                .rejects
                .toThrow(DuplicateResourceError);

            expect(mockUsuarioRepository.getByEmail).toHaveBeenCalledWith("test@example.com");
            expect(mockGetPasswordHash).not.toHaveBeenCalled();
            expect(mockUsuarioRepository.create).not.toHaveBeenCalled();
        });
    });

    describe("getAllUsuarios", () => {
        it("debe retornar todos los usuarios", async () => {
            // Arrange
            const mockUsuarios: Usuario[] = [
                {
                    idUsuario: 1,
                    correo: "user1@example.com",
                    nombre: "Usuario 1",
                    contraseña: "hash1",
                    fechaCreado: mockDate
                },
                {
                    idUsuario: 2,
                    correo: "user2@example.com",
                    nombre: "Usuario 2",
                    contraseña: "hash2",
                    fechaCreado: mockDate
                }
            ];

            mockUsuarioRepository.getAll.mockResolvedValue(mockUsuarios);

            // Act
            const result = await usuarioService.getAllUsuarios();

            // Assert
            expect(mockUsuarioRepository.getAll).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockUsuarios);
        });

        it("debe retornar un array vacío cuando no hay usuarios", async () => {
            // Arrange
            mockUsuarioRepository.getAll.mockResolvedValue([]);

            // Act
            const result = await usuarioService.getAllUsuarios();

            // Assert
            expect(mockUsuarioRepository.getAll).toHaveBeenCalledTimes(1);
            expect(result).toEqual([]);
        });
    });

    describe("getUsuarioById", () => {
        it("debe retornar un usuario cuando existe", async () => {
            // Arrange
            const mockUsuario: Usuario = {
                idUsuario: 1,
                correo: "test@example.com",
                nombre: "Juan Pérez",
                contraseña: "hash",
                fechaCreado: mockDate
            };
            const mockUsuarioDetailRs: UsuarioDetailRs = {
                id_usuario: 1,
                correo: "test@example.com",
                nombre: "Juan Pérez",
                fechaCreado: mockDateIso
            };

            mockUsuarioRepository.getById.mockResolvedValue(mockUsuario);
            mockToUserDetailRs.mockReturnValue(mockUsuarioDetailRs);

            // Act
            const result = await usuarioService.getUsuarioById(1);

            // Assert
            expect(mockUsuarioRepository.getById).toHaveBeenCalledWith(1);
            expect(mockToUserDetailRs).toHaveBeenCalledWith(mockUsuario);
            expect(result).toEqual(mockUsuarioDetailRs);
        });

        it("debe lanzar ResourceNotFoundError cuando el usuario no existe", async () => {
            // Arrange
            mockUsuarioRepository.getById.mockResolvedValue(null);

            // Act & Assert
            await expect(usuarioService.getUsuarioById(999))
                .rejects
                .toThrow(ResourceNotFoundError);

            expect(mockUsuarioRepository.getById).toHaveBeenCalledWith(999);
            expect(mockToUserDetailRs).not.toHaveBeenCalled();
        });
    });

    describe("updateUsuario", () => {
        const mockUpdateData: Prisma.UsuarioUpdateInput = {
            nombre: "Juan Actualizado"
        };

        it("debe actualizar un usuario exitosamente cuando existe", async () => {
            // Arrange
            const mockExistingUsuario: Usuario = {
                idUsuario: 1,
                correo: "test@example.com",
                nombre: "Juan Pérez",
                contraseña: "hash",
                fechaCreado: mockDate
            };
            const mockUpdatedUsuario: Usuario = {
                idUsuario: 1,
                correo: "test@example.com",
                nombre: "Juan Actualizado",
                contraseña: "hash",
                fechaCreado: mockDate
            };
            const mockUsuarioDetailRs: UsuarioDetailRs = {
                id_usuario: 1,
                correo: "test@example.com",
                nombre: "Juan Actualizado",
                fechaCreado: mockDateIso
            };

            mockUsuarioRepository.getById.mockResolvedValue(mockExistingUsuario);
            mockUsuarioRepository.update.mockResolvedValue(mockUpdatedUsuario);
            mockToUserDetailRs.mockReturnValue(mockUsuarioDetailRs);

            // Act
            const result = await usuarioService.updateUsuario(1, mockUpdateData);

            // Assert
            expect(mockUsuarioRepository.getById).toHaveBeenCalledWith(1);
            expect(mockUsuarioRepository.update).toHaveBeenCalledWith(1, mockUpdateData);
            expect(mockToUserDetailRs).toHaveBeenCalledWith(mockUpdatedUsuario);
            expect(result).toEqual(mockUsuarioDetailRs);
        });

        it("debe lanzar ResourceNotFoundError cuando el usuario no existe", async () => {
            // Arrange
            mockUsuarioRepository.getById.mockResolvedValue(null);

            // Act & Assert
            await expect(usuarioService.updateUsuario(999, mockUpdateData))
                .rejects
                .toThrow(ResourceNotFoundError);

            expect(mockUsuarioRepository.getById).toHaveBeenCalledWith(999);
            expect(mockUsuarioRepository.update).not.toHaveBeenCalled();
        });
    });

    describe("deleteUsuario", () => {
        it("debe eliminar un usuario exitosamente cuando existe", async () => {
            // Arrange
            const mockExistingUsuario: Usuario = {
                idUsuario: 1,
                correo: "test@example.com",
                nombre: "Juan Pérez",
                contraseña: "hash",
                fechaCreado: mockDate
            };

            mockUsuarioRepository.getById.mockResolvedValue(mockExistingUsuario);
            // Retornar el usuario eliminado (es lo que retorna delete de Prisma)
            mockUsuarioRepository.delete.mockResolvedValue(mockExistingUsuario);

            // Act
            await usuarioService.deleteUsuario(1);

            // Assert
            expect(mockUsuarioRepository.getById).toHaveBeenCalledWith(1);
            expect(mockUsuarioRepository.delete).toHaveBeenCalledWith(1);
        });

        it("debe lanzar ResourceNotFoundError cuando el usuario no existe", async () => {
            // Arrange
            mockUsuarioRepository.getById.mockResolvedValue(null);

            // Act & Assert
            await expect(usuarioService.deleteUsuario(999))
                .rejects
                .toThrow(ResourceNotFoundError);

            expect(mockUsuarioRepository.getById).toHaveBeenCalledWith(999);
            expect(mockUsuarioRepository.delete).not.toHaveBeenCalled();
        });
    });

});