import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import logger from "./config/logger";
import { operadorRoutes, clienteRoutes, carroRoutes } from "./routes";
import { loginRoutes } from "./routes";
import knex from "./config/db";

async function startServer() {
    const app = Fastify();

    // CORS liberado pra tudo (pode restringir depois)
    await app.register(cors, {
        origin: process.env.FRONTEND_URL, // ou ["http://localhost:5173"] se quiser travar
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    });

    // Rotas
    app.register(operadorRoutes, { prefix: "/operador" });
    app.register(clienteRoutes, { prefix: "/cliente" });
    app.register(carroRoutes, { prefix: "/carro" });
    app.register(loginRoutes, { prefix: "/login" });


    const PORT = Number(process.env.PORT) || 3060;

    await app.listen({ port: PORT });
    logger.info(`Servidor Rodando em ${PORT}`);

    // Teste de conexão
    try {
        await knex.raw("SELECT 1");
        logger.info("Conexão com PostgreSQL OK!");
    } catch (err) {
        logger.error(err, "Erro na conexão com o banco");
        process.exit(1);
    }
}

startServer();
