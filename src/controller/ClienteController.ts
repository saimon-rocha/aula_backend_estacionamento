import { FastifyRequest, FastifyReply } from "fastify";
import logger from "../config/logger";
import { buscaCliente, buscaClienteCod, criarCliente, deletarCliente } from "../repositories/cliente-repositories";
import { Clientes } from '../models/clientes';
import knex from '../config/db';
import moment from "moment";

class ClienteController {

    async index(request: FastifyRequest, reply: FastifyReply) {
        try {
            logger.info("Listando clientes");

            const clientes = await buscaCliente();

            logger.info(clientes);

            reply.send({ message: "Listagem de clientes", data: clientes })
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

            // Dados enviados pelo cliente no body (JSON)
            const dados = request.body as { nome: string; dt_nascimento: string };


            criarCliente(dados);

            logger.info("Cliente Cadastrado Com Sucesso !.");

            reply.send({ message: "Cliente cadastrado!", data: dados });
        } catch (error) {
            logger.error(error, "Ocorreu um erro no cadastro doo cliente.");
            reply
                .code(500)
                .send({
                    statusCode: 500,
                    error: "Internal Server Error",
                    message: "Ocorreu um erro ao cadastrar o cliente."
                });
        }
    }

    async edit(request: FastifyRequest, reply: FastifyReply) {
        try {
            logger.info("Editando cliente");

            // Recebe id + campos para atualizar
            const dados = request.body as Partial<Clientes> & { id_cliente: number };

            // Verifica existente
            const clienteExistente = await buscaClienteCod(dados.id_cliente);
            if (!clienteExistente) {
                return reply.code(404).send({ message: "Operador não encontrado" });
            }

            // Atualiza apenas os campos enviados
            const [clienteAtualizado] = await knex<Clientes>('clientes')
                .where({ id_cliente: dados.id_cliente })
                .update({
                    nome: dados.nome ?? clienteExistente.nome,
                    dt_nascimento: dados.dt_nascimento ?? clienteExistente.dt_nascimento
                })
                .returning('*');

            reply.send({ message: "Cliente editado!", data: clienteAtualizado });
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
            logger.info("Deletando cliente");

            const { id_cliente } = request.params as { id_cliente: number };

            if (!id_cliente) {
                return reply.code(400).send({ message: "ID é obrigatório" });
            }

            const sucesso = await deletarCliente(Number(id_cliente));

            if (!sucesso) {
                return reply.code(404).send({ message: "Cliente não encontrado" });
            }

            reply.send({ message: "Cliente deletado!" });

        } catch (error) {
            logger.error(error, "Erro ao deletar cliente");
            reply.code(500).send({ message: "Erro ao deletar cliente" });
        }
    }



    async pesquisa(request: FastifyRequest, reply: FastifyReply) {
        try {
            logger.info("Iniciando a Pesquisa do Cliente pelo Cód");

            const { id_cliente } = request.params as { id_cliente: number };

            const clienteExistente = await buscaClienteCod(Number(id_cliente));

            if (!clienteExistente) {
                return reply.code(404).send({ message: "Cliente não encontrado" });
            }

            // Formata a data
            const clienteFormatado = {
                id_cliente: clienteExistente.id_cliente,
                nome: clienteExistente.nome,
                dt_nascimento: moment(clienteExistente.dt_nascimento).format("DD/MM/YYYY")
            };

            logger.info("Cliente encontrado com Sucesso !");
            reply.send({
                message: "Cliente encontrado",
                data: clienteFormatado
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