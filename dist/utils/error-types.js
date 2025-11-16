"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DuplicateResourceError = exports.ResourceNotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.BadRequestError = exports.BaseError = void 0;
class BaseError extends Error {
    statusCode;
    constructor(message, statusCode) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.BaseError = BaseError;
class BadRequestError extends BaseError {
    constructor(message = "Solicitud incorrecta") {
        super(message, 400);
    }
}
exports.BadRequestError = BadRequestError;
class UnauthorizedError extends BaseError {
    constructor(message = "No autorizado") {
        super(message, 401);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends BaseError {
    constructor(message = "Acceso prohibido") {
        super(message, 403);
    }
}
exports.ForbiddenError = ForbiddenError;
class ResourceNotFoundError extends BaseError {
    constructor(message = "Recurso no encontrado") {
        super(message, 404);
    }
}
exports.ResourceNotFoundError = ResourceNotFoundError;
class DuplicateResourceError extends BaseError {
    constructor(message = "Recurso duplicado") {
        super(message, 409);
    }
}
exports.DuplicateResourceError = DuplicateResourceError;
