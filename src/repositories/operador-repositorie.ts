import knex from "../config/db";
import logger from "../config/logger";
import { Operador } from "../models/operador";

export async function buscaOperador(): Promise<{ operador: Operador[] }> {
    const operadorResultado = await knex<Operador>('operador').select('*');

    const operadorDb: Operador[] = operadorResultado.map(row => ({
        id_operador: row.id_operador,
        nome: row.nome,
        email: row.email,
        senha: row.senha,
        admin: row.admin
    }));

    return { operador: operadorDb };
}

export async function criaOperador(dados: Omit<Operador, "id_operador">): Promise<Operador> {
    // Insere no banco e retorna a linha criada
    const [novoOperador] = await knex<Operador>('operador')
        .insert(dados)
        .returning('*'); // PostgreSQL retorna a linha criada

    return novoOperador;
}

export async function buscaOperadorCod(id_operador: number): Promise<Operador | null> {
    const operador = await knex<Operador>('operador')
        .where({ id_operador })  // filtra pelo id
        .first();                // pega apenas o primeiro resultado

    return operador || null;     // retorna null se não encontrou
}

export async function deletarOperador(id_operador: number): Promise<Boolean> {
    const operador = await buscaOperadorCod(id_operador);

    if (!operador) {
        logger.info("Operador Não Encontrado");
        return false;
    }

    logger.info("Operador Encontrado, deletando....");

    await knex<Operador>('operador')
        .where({ id_operador })
        .delete();

    return true;
}
