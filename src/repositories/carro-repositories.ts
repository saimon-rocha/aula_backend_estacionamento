import knex from "../config/db";
import { Carro } from "../models/carro";
import logger from "../config/logger";

export async function buscaCarros(): Promise<{ carro: Carro[] }> {
    const resultado = await knex<Carro>("carro").select("*");
    return { carro: resultado };
}

export async function buscaCarroCod(id_carro: number): Promise<Carro | null> {
    const carro = await knex<Carro>("carro").where({ id_carro }).first();
    return carro || null;
}

export async function criarCarro(dados: Omit<Carro, "id_carro"> & { id_cliente: number }): Promise<Carro> {
    const [novo] = await knex<Carro>("carro")
        .insert(dados)
        .returning("*");
    return novo;
}

export async function deletarCarro(id_carro: number): Promise<boolean> {
    const existe = await buscaCarroCod(id_carro);
    if (!existe) {
        logger.info("Carro não encontrado");
        return false;
    }

    await knex<Carro>("carro").where({ id_carro }).delete();
    return true;
}

export async function buscarCarroPorPlaca(placa: string): Promise<Boolean> {
    const busca = await knex<Carro>("carro").where(placa).first();
    if (!busca) {
        return false;
    }
    return true;
}
