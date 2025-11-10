import knex from "../config/db";
import logger from "../config/logger";

export interface Operador {
    id_operador: number,
    nome: string,
    email: string,
    senha: string,
    admin: boolean
}