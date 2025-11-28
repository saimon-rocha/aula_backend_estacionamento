import { FastifyRequest, FastifyReply } from "fastify";
import logger from "../config/logger";
import { criarCarro, buscaCarros, buscaCarroCod, deletarCarro } from "../repositories/carro-repositories";
import knex from "../config/db";
import { Carro } from "../models/carro";

class CarroController {

    async index(request: FastifyRequest, reply: FastifyReply) {
        try {
            logger.info("Listando carros");

            const carros = await buscaCarros();

            // Retornar direto o array
            reply.send({
                message: "Listagem de carros",
                data: carros.carro // envia apenas o array
            });

        } catch (error) {
            logger.error(error, "Erro ao listar carros");
            reply.code(500).send({ message: "Erro ao listar carros" });
        }
    }


    async create(request: FastifyRequest, reply: FastifyReply) {
        try {
            logger.info("Criando carro");

            const dados = request.body as {
                cor: string;
                placa: string;
                modelo: string;
                id_carro: number;
            };

            const novoCarro = await criarCarro(dados);

            reply.send({
                message: "Carro criado!",
                data: novoCarro
            });

        } catch (error) {
            logger.error(error, "Erro ao criar carro");
            reply.code(500).send({ message: "Erro ao criar carro" });
        }
    }

    async edit(request: FastifyRequest, reply: FastifyReply) {
        try {
            logger.info("Editando carro");

            const { id_carro } = request.params as { id_carro: number };
            const dados = request.body as Partial<Carro>;

            const carroExistente = await buscaCarroCod(id_carro);

            if (!carroExistente) {
                return reply.code(404).send({ message: "Carro não encontrado" });
            }

            const [carroAtualizado] = await knex<Carro>("carro")
                .where({ id_carro })
                .update({
                    cor: dados.cor ?? carroExistente.cor,
                    placa: dados.placa ?? carroExistente.placa,
                    modelo: dados.modelo ?? carroExistente.modelo
                })
                .returning("*");

            reply.send({
                message: "Carro editado!",
                data: carroAtualizado
            });

        } catch (error) {
            logger.error(error, "Erro ao editar carro");
            reply.code(500).send({ message: "Erro ao editar carro" });
        }
    }


    async delet(request: FastifyRequest, reply: FastifyReply) {
        try {
            logger.info("Deletando carro");

            const { id_carro } = request.params as { id_carro: number };

            if (!id_carro) {
                return reply.code(400).send({ message: "ID é obrigatório" });
            }

            const sucesso = await deletarCarro(Number(id_carro));

            if (!sucesso) {
                return reply.code(404).send({ message: "Carro não encontrado" });
            }

            reply.send({ message: "Carro deletado!" });

        } catch (error) {
            logger.error(error, "Erro ao deletar carro");
            reply.code(500).send({ message: "Erro ao deletar carro" });
        }
    }

    async pesquisa(request: FastifyRequest, reply: FastifyReply) {
        try {
            logger.info("Iniciando a Pesquisa do Carro pelo Cód");

            const { id_carro } = request.params as { id_carro: number };

            const carroExistente = await buscaCarroCod(Number(id_carro));

            if (!carroExistente) {
                return reply.code(404).send({ message: "Carro não encontrado" });
            }

            logger.info("Carro encontrado com Sucesso !");
            reply.send({
                message: "Carro encontrado",
                data: carroExistente
            });

        } catch (error) {
            logger.error(error, "Ocorreu um Erro na Pesquisa por Cód");
            reply.code(500).send({
                statusCode: 500,
                error: "Internal Server Error",
                message: "Ocorreu um erro ao pesquisar carro."
            });
        }
    }
}

export default new CarroController();
