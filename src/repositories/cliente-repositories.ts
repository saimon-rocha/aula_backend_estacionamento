import knex from "../config/db";
import logger from "../config/logger";
import { Clientes } from "../models/clientes";
import moment from 'moment';

export async function buscaCliente() {
    const clienteResultado = await knex<Clientes>('clientes').select('*');

    const clienteDb: Clientes[] = clienteResultado.map(row => ({
        id_cliente: row.id_cliente,
        nome: row.nome,
        dt_nascimento: moment(row.dt_nascimento).format("DD/MM/YYYY"),
    }));

    return { cliente: clienteDb };
}

export async function criarCliente(dados: Omit<Clientes, "id_cliente">): Promise<Clientes> {
    const [novoCliente] = await knex<Clientes>('clientes')
        .insert(dados)
        .returning('*');
    return novoCliente;
}

export async function buscaClienteCod(id_cliente: number): Promise<Clientes | null> {
    const cliente = await knex<Clientes>('clientes')
        .where({ id_cliente })
        .first();
    return cliente || null;
}

export async function deletarCliente(id_cliente: number): Promise<Boolean> {
    const cliente = await buscaClienteCod(id_cliente);

    if (!cliente) {
        logger.info("Cliente Não Encontrado");
        return false;
    }

    logger.info("Cliente Encontrado, deletando....");

    await knex<Clientes>('clientes')
        .where({ id_cliente })
        .delete();

    return true;
}