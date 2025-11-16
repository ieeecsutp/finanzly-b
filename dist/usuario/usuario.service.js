"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuarioService = void 0;
const usuario_repository_1 = require("./usuario.repository");
const error_types_1 = require("../utils/error-types");
const usuario_mapper_1 = require("./mapper/usuario.mapper");
const auth_1 = require("../utils/auth");
class UsuarioService {
    usuarioRepository = new usuario_repository_1.UsuarioRepository();
    async createUsuario(data) {
        const existingUsuario = await this.usuarioRepository.getByEmail(data.correo);
        if (existingUsuario) {
            throw new error_types_1.DuplicateResourceError("El correo ya está registrado.");
        }
        // Hashear la contraseña antes de guardar
        const hashed = (0, auth_1.getPasswordHash)(data.contraseña);
        data.contraseña = hashed;
        const usuario = await this.usuarioRepository.create(data);
        return (0, usuario_mapper_1.toUserDetailRs)(usuario);
    }
    async getAllUsuarios() {
        return await this.usuarioRepository.getAll();
    }
    async getUsuarioById(id) {
        const usuario = await this.usuarioRepository.getById(id);
        if (!usuario) {
            throw new error_types_1.ResourceNotFoundError("Usuario no encontrado.");
        }
        return (0, usuario_mapper_1.toUserDetailRs)(usuario);
    }
    async updateUsuario(id, data) {
        // Verificar que el usuario existe antes de actualizar
        const existingUsuario = await this.usuarioRepository.getById(id);
        if (!existingUsuario) {
            throw new error_types_1.ResourceNotFoundError("Usuario no encontrado.");
        }
        const updatedUsuario = await this.usuarioRepository.update(id, data);
        return (0, usuario_mapper_1.toUserDetailRs)(updatedUsuario);
    }
    async deleteUsuario(id) {
        // Verificar que el usuario existe antes de eliminar
        const existingUsuario = await this.usuarioRepository.getById(id);
        if (!existingUsuario) {
            throw new error_types_1.ResourceNotFoundError("Usuario no encontrado.");
        }
        await this.usuarioRepository.delete(id);
    }
}
exports.UsuarioService = UsuarioService;
