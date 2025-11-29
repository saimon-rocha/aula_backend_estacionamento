import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import logger from "./config/logger";
import { operadorRoutes, clienteRoutes, carroRoutes, loginRoutes } from "./routes";
import knex from "./config/db";

async function startServer() {
    const app = Fastify();

    await app.register(cors, {
        origin: true,
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    });

    app.register(operadorRoutes, { prefix: "/operador" });
    app.register(clienteRoutes, { prefix: "/cliente" });
    app.register(carroRoutes, { prefix: "/carro" });
    app.register(loginRoutes, { prefix: "/login" });

    const PORT = Number(process.env.PORT) || 3060;

    // Teste de conexão ANTES de subir o servidor
    try {
        await knex.raw("SELECT 1");
        logger.info("Conexão com PostgreSQL OK!");
    } catch (err) {
        logger.error(err, "Erro na conexão com o banco");
        process.exit(1);
    }

    await app.listen({ port: PORT, host: "0.0.0.0" });
    logger.info(`Servidor Rodando em ${PORT}`);
}

startServer();
