import { FastifyRequest, FastifyReply } from "fastify";
import logger from "../config/logger";
import { buscaClienteCod, buscaClienteComCarro, criarCliente, deletarCliente } from "../repositories/cliente-repositories";
import { Clientes } from '../models/clientes';
import knex from '../config/db';
import moment from "moment";
import { Carro } from "../models/carro";
import { buscarCarroPorPlaca } from "../repositories/carro-repositories";

class ClienteController {

    async index(request: FastifyRequest, reply: FastifyReply) {
        try {
            logger.info("Listando clientes");

            const clientesObj = await buscaClienteComCarro();
            
            reply.send({ message: "Listagem de clientes", data: clientesObj })

        } catch (error) {
            logger.error(error, "Ocorreu um erro na listagem dos clientes.");
            reply
                .code(500)
                .send({
                    statusCode: 500,
                    error: "Internal Server Error",
                    message: "Ocorreu um erro ao listar clientes."
                });
        }
    }

    async create(request: FastifyRequest, reply: FastifyReply) {
        try {
            logger.info("Criando cliente");

            // Recebe dados do cliente
            const dados = request.body as { nome: string; dt_nascimento: string; carros?: { placa: string; modelo: string }[] };

            // Se houver carros, verifica se a placa já existe
            if (dados.carros && dados.carros.length > 0) {
                for (const carro of dados.carros) {
                    const carroExistente = await buscarCarroPorPlaca(carro.placa); // criar função que busca no banco
                    if (carroExistente) {
                        return reply.code(400).send({
                            statusCode: 400,
                            error: "Bad Request",
                            message: `Veículo já cadastrado: placa ${carro.placa}`
                        });
                    }
                }
            }

            // Chama criarCliente e espera o resultado para pegar o id_cliente
            const clienteCriado = await criarCliente(dados);

            logger.info("Cliente Cadastrado Com Sucesso !");

            reply.send({
                message: "Cliente cadastrado!",
                data: clienteCriado // retorna o id_cliente junto
            });

        } catch (error) {
            logger.error(error, "Ocorreu um erro no cadastro do cliente.");
            reply.code(500).send({
                statusCode: 500,
                error: "Internal Server Error",
                message: "Ocorreu um erro ao cadastrar o cliente."
            });
        }
    }

    async edit(request: FastifyRequest, reply: FastifyReply) {
        try {
            logger.info("Editando cliente");

            const { id_cliente } = request.params as { id_cliente: number };
            const dados = request.body as Partial<Clientes & Carro>;

            // Verifica se o cliente existe
            const clienteExistente = await buscaClienteCod(Number(id_cliente));
            if (!clienteExistente) {
                return reply.code(404).send({ message: "Cliente não encontrado" });
            }

            // Transação para garantir integridade
            await knex.transaction(async trx => {
                // Atualiza o cliente
                const [clienteAtualizado] = await trx<Clientes>('clientes')
                    .where({ id_cliente: Number(id_cliente) })
                    .update({
                        nome: dados.nome ?? clienteExistente.nome,
                        dt_nascimento: dados.dt_nascimento
                            ? moment(dados.dt_nascimento, "YYYY-MM-DD").format("YYYY-MM-DD")
                            : clienteExistente.dt_nascimento
                    })
                    .returning('*');

                let carroAtualizado;
                // Atualiza o carro apenas se houver dados
                if (dados.placa || dados.modelo || dados.cor) {
                    [carroAtualizado] = await trx<Carro>('carro')
                        .where({ id_cliente: Number(id_cliente) })
                        .update({
                            placa: dados.placa,
                            modelo: dados.modelo,
                            cor: dados.cor
                        })
                        .returning('*');
                }

                reply.send({
                    message: "Cliente e carro editados!",
                    data: {
                        cliente: clienteAtualizado,
                        carro: carroAtualizado || null
                    }
                });
            });

        } catch (error) {
            logger.error(error, "Erro ao editar cliente");

            reply.code(500).send({
                statusCode: 500,
                error: "Internal Server Error",
                message: "Ocorreu um erro ao editar cliente."
            });
        }
    }

    async delet(request: FastifyRequest, reply: FastifyReply) {
        try {
            logger.info("Deletando cliente e carros associados");

            const { id_cliente } = request.params as { id_cliente: number };

            if (!id_cliente) {
                return reply.code(400).send({ message: "ID é obrigatório" });
            }

            // 1️⃣ Deletar carros associados (é bom fazer antes do cliente para evitar problemas de FK)
            await knex("carro").where({ id_cliente }).delete();

            // 2️⃣ Deletar cliente
            const sucesso = await deletarCliente(Number(id_cliente));

            if (!sucesso) {
                return reply.code(404).send({ message: "Cliente não encontrado" });
            }

            reply.send({ message: "Cliente e carros deletados!" });
        } catch (error) {
            logger.error(error, "Erro ao deletar cliente e carros");
            reply.code(500).send({ message: "Erro ao deletar cliente e carros" });
        }
    }

    async pesquisa(request: FastifyRequest, reply: FastifyReply) {
        try {
            logger.info("Iniciando a Pesquisa do Cliente pelo Cód");

            const { id_cliente } = request.params as { id_cliente: number };

            // buscaClienteCod já traz o cliente com carros e a data formatada em DD/MM/YYYY
            const clienteExistente = await buscaClienteCod(Number(id_cliente));

            if (!clienteExistente) {
                return reply.code(404).send({ message: "Cliente não encontrado" });
            }

            // Retorna o objeto completo, que já inclui os carros e a data formatada pelo repository (buscaClienteCod)
            logger.info("Cliente encontrado com Sucesso !");
            reply.send({
                message: "Cliente encontrado",
                data: clienteExistente
            });

        } catch (error) {
            logger.error(error, "Ocorreu um Erro na Pesquisa por Cód");
            reply.code(500).send({
                statusCode: 500,
                error: "Internal Server Error",
                message: "Ocorreu um erro ao pesquisar cliente."
            });
        }
    }

}
export default new ClienteController