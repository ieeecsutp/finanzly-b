import { Usuario, Categoria } from "@prisma/client";
export interface CrudRepository<T> {
  create(data: T): Promise<T>;
  getAll(): Promise<T[]>;
  getById(id: number): Promise<T | null>;
  update(id: number, data: Partial<T>): Promise<T>;
  delete(id: number): Promise<T>;
}

export interface IUserRepository {
  getByEmail(email: string): Promise<Usuario|null>;
}

export interface ICategoriaRepository {
  getByTipo(tipo: string): Promise<Categoria[]>;
  getByNombre(nombre: string): Promise<Categoria | null>;
  getByNombreAndTipo(nombre: string, tipo: string): Promise<Categoria | null>;
  getByNombreAndTipoExcludingId(nombre: string, tipo: string, excludeId: number): Promise<Categoria | null>;
  hasRegistros(categoriaId: number): Promise<boolean>;
  getRegistrosByCategoriaId(categoriaId: number): void;
  getCategoriaStats(categoriaId: number): void;
}