import { FastifyRequest, FastifyReply } from "fastify";
import logger from "../config/logger";
import { Operador } from "../models/operador";
import { buscaOperador, buscaOperadorCod, criaOperador, deletarOperador } from "../repositories/operador-repositorie";
import knex from "../config/db";

class OperadorController {
    async index(request: FastifyRequest, reply: FastifyReply) {
        try {
            logger.info("Listando operadores");

            const operadores = await buscaOperador();

            logger.info(operadores);

            reply.send({ message: "Listagem de operadores", data: operadores })
        } catch (error) {
            logger.error(error, "Ocorreu um erro na listagem dos Operadores.");
            reply
                .code(500)
                .send({
                    statusCode: 500,
                    error: "Internal Server Error",
                    message: "Ocorreu um erro ao listar operadores."
                });
        }

    }

    async create(request: FastifyRequest, reply: FastifyReply) {
        try {
            logger.info("Criando operador");

            // Dados enviados pelo Operador no body (JSON)
            const dados = request.body as { nome: string; email: string; senha: string, admin: boolean };

            criaOperador(dados);

            logger.info("Operador Criado Com Sucesso !.");

            reply.send({ message: "Operador criado!", data: dados });
        } catch (error) {
            logger.error(error, "Ocorreu um erro na criação do operador.");
            reply
                .code(500)
                .send({
                    statusCode: 500,
                    error: "Internal Server Error",
                    message: "Ocorreu um erro ao criar operador."
                });
        }
    }


    async edit(request: FastifyRequest, reply: FastifyReply) {
        try {
            logger.info("Editando operador");

            // Recebe id + campos para atualizar
            const dados = request.body as Partial<Operador> & { id_operador: number };

            // Verifica se o operador existe
            const operadorExistente = await buscaOperadorCod(dados.id_operador);
            if (!operadorExistente) {
                return reply.code(404).send({ message: "Operador não encontrado" });
            }

            // Atualiza apenas os campos enviados (nome, email, senha, etc)
            const [operadorAtualizado] = await knex<Operador>('operador')
                .where({ id_operador: dados.id_operador })
                .update({
                    nome: dados.nome ?? operadorExistente.nome,
                    email: dados.email ?? operadorExistente.email,
                    senha: dados.senha ?? operadorExistente.senha,
                })
                .returning('*'); // retorna o registro atualizado

            reply.send({ message: "Operador editado!", data: operadorAtualizado });

        } catch (error) {
            logger.error(error, "Erro ao editar operador");

            reply.code(500).send({
                statusCode: 500,
                error: "Internal Server Error",
                message: "Ocorreu um erro ao editar operador."
            });
        }
    }

    async delet(request: FastifyRequest, reply: FastifyReply) {
        try {
            logger.info("Deletando Operador");

            const { id_operador } = request.params as { id_operador: number };

            if (!id_operador) {
                return reply.code(400).send({ message: "ID é obrigatório" });
            }

            const sucesso = await deletarOperador(Number(id_operador));

            if (!sucesso) {
                return reply.code(404).send({ message: "Operador não encontrado" });
            }

            reply.send({ message: "Operador deletado!" });

        } catch (error) {
            logger.error(error, "Erro ao deletar Operador");
            reply.code(500).send({ message: "Erro ao deletar Operador" });
        }
    }

    async pesquisa(request: FastifyRequest, reply: FastifyReply) {
        try {
            logger.info("Iniciando a Pesquisa do Operador pelo Cód");

            const { id_operador } = request.params as { id_operador: number };

            const operadorExistente = await buscaOperadorCod(Number(id_operador));

            if (!operadorExistente) {
                return reply.code(404).send({ message: "Operador não encontrado" });
            }

            logger.info("Operador encontrado com Sucesso !");
            reply.send({
                message: "Operador encontrado",
                data: operadorExistente
            });

        } catch (error) {
            logger.error(error, "Ocorreu um Erro na Pesquisa por Cód");
            reply.code(500).send({
                statusCode: 500,
                error: "Internal Server Error",
                message: "Ocorreu um erro ao pesquisar operador."
            });
        }
    }
}

export default new OperadorController(); 
