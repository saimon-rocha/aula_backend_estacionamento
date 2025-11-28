import { FastifyRequest, FastifyReply } from "fastify";
import logger from "../config/logger";
import knex from "../config/db";
import { gerarToken } from "../infra/jwt";

class LoginController {
    async login(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { email, senha } = request.body as { email: string; senha: string };

            if (!email || !senha) {
                return reply.code(400).send({ message: "Email e senha são obrigatórios" });
            }

            const user = await knex("operador").where({ email }).first();

            if (!user || user.senha !== senha) {
                logger.warn(`Falha de login para ${email}`);
                return reply.code(401).send({ message: "Usuário ou senha inválidos" });
            }

            // gera token usando infra/jwt
            const token = gerarToken({ id_operador: user.id_operador, email: user.email, nome: user.nome, admin: user.admin });

            logger.info(`Usuário ${email} logado. Token gerado.`);
            return reply.send({
                token,
                expiresIn: 60,
                admin: user.admin,
                id_operador: user.id_operador,
                nome: user.nome,
                email: user.email
            });
        } catch (err) {
            logger.error(err, "Erro no login");
            return reply.code(500).send({ message: "Erro ao realizar login" });
        }
    }
}

export default new LoginController();
