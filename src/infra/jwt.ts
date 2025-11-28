import { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.CHAVE

// Gera um token de acesso
export function gerarToken(payload: object, expiresIn: string | number = "20m") {
    return jwt.sign(payload, SECRET_KEY, { expiresIn });
}

// Middleware para proteger rotas - CORRIGIDO
export async function verificarToken(request: FastifyRequest, reply: FastifyReply) {
    try {
        const authHeader = request.headers['authorization'];

        // 1. Verificar se o cabeçalho existe
        if (!authHeader) {
            // Em vez de 'return reply.code(401).send()', lançamos um erro.
            // O Fastify irá interceptar e responder com 500 se não for um erro Fastify, 
            // mas é mais claro usar uma exceção aqui.
            throw new Error("Token não fornecido");
        }

        const token = authHeader.replace("Bearer ", "");

        // 2. Tentar verificar o token
        // Se a verificação for bem-sucedida, não faz nada e a função termina.
        // Como a função é async e termina sem throw/return, o Fastify continua.
        jwt.verify(token, SECRET_KEY);

    } catch (err: any) {
        // 3. Capturar qualquer erro (ausência, inválido, expirado)

        // Configura a resposta de erro para ser enviada e CANCELA o resto da rota.
        // O `return reply.code(401).send(...)` garante que a execução PARE AQUI.
        return reply.code(401).send({
            message: err.message === "Token não fornecido" ? err.message : "Token inválido ou expirado"
        });
    }
}