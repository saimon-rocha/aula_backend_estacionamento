import knex from "../config/db";
import logger from "../config/logger";
import { Clientes } from "../models/clientes";
import moment from 'moment';

// --- TIPOS AUXILIARES ---
// O tipo Clientes deve ser definido no seu arquivo models/clientes,
// mas vamos criar o tipo para o objeto de carro, se não estiver definido.
type Carro = {
    id_carro: number;
    modelo: string;
    placa: string;
    cor: string;
}

// Novo tipo que reflete exatamente o que buscaClienteCod retorna
type ClienteComCarros = Clientes & {
    carros: Carro[];
}
// ------------------------

export async function buscaClienteComCarro() {
    // Faz o join entre clientes e carro
    const resultado = await knex('clientes as c')
        .leftJoin('carro as car', 'c.id_cliente', 'car.id_cliente')
        .select(
            'c.id_cliente',
            'c.nome',
            'c.dt_nascimento',
            'car.id_carro',
            'car.modelo',
            'car.placa',
            'car.cor'
        );

    // Agora precisamos agrupar os carros por cliente
    const clientesMap: Record<number, any> = {};

    resultado.forEach(row => {
        if (!clientesMap[row.id_cliente]) {
            clientesMap[row.id_cliente] = {
                id_cliente: row.id_cliente,
                nome: row.nome,
                dt_nascimento: moment(row.dt_nascimento).format("DD/MM/YYYY"),
                carros: []
            };
        }

        if (row.id_carro) {
            clientesMap[row.id_cliente].carros.push({
                id_carro: row.id_carro,
                modelo: row.modelo,
                placa: row.placa,
                cor: row.cor,
            });
        }
    });

    return { clientes: Object.values(clientesMap) };
}

export async function criarCliente(dados: Omit<Clientes, "id_cliente">): Promise<Clientes> {
    const [novoCliente] = await knex<Clientes>('clientes')
        .insert(dados)
        .returning('*');
    return novoCliente;
}

// 🛑 AJUSTE DE TIPAGEM: Retorno agora é ClienteComCarros
export async function buscaClienteCod(id_cliente: number): Promise<ClienteComCarros | null> {
    const clienteResult = await knex<Clientes>('clientes')
        .where({ id_cliente })
        .first();

    if (!clienteResult) {
        return null; // Cliente não encontrado
    }

    const carrosResult = await knex('carro')
        .where({ id_cliente })
        .select('id_carro', 'modelo', 'placa', 'cor');

    const clienteFormatado = {
        id_cliente: clienteResult.id_cliente,
        nome: clienteResult.nome,
        // Converte a data do banco para DD/MM/YYYY
        dt_nascimento: moment(clienteResult.dt_nascimento).format("DD/MM/YYYY"),

        // Inclui os carros com todos os campos (id, modelo, placa, cor)
        carros: carrosResult.map(carro => ({
            id_carro: carro.id_carro,
            modelo: carro.modelo,
            placa: carro.placa,
            cor: carro.cor,
        })),
    };

    return clienteFormatado as ClienteComCarros;
}

export async function deletarCliente(id_cliente: number): Promise<Boolean> {
    // Nota: O método de busca do cliente agora retorna ClienteComCarros | null
    const cliente = await buscaClienteCod(id_cliente);

    if (!cliente) {
        logger.info("Cliente Não Encontrado");
        return false;
    }

    logger.info("Cliente Encontrado, deletando....");

    // NOTA: Para uma exclusão completa, idealmente você também deletaria os
    // carros associados antes de deletar o cliente (usando uma transação).
    // Vou manter apenas a exclusão do cliente como está no seu código original.

    await knex<Clientes>('clientes')
        .where({ id_cliente })
        .delete();

    return true;
}