import 'dotenv/config';
import Fastify from "fastify";
import logger from "./config/logger";
import { operadorRoutes, clienteRoutes, carroRoutes} from "./routes";
import knex from "./config/db";

async function startServer() {
    const app = Fastify();

    // Registra as rotas
    app.register(operadorRoutes, { prefix: "/operador" });
    app.register(clienteRoutes,  { prefix: "/cliente" });
    app.register(carroRoutes,    { prefix: "/carro" });



    // Inicia o servidor
    const PORT = Number(process.env.PORT) || 3060;

    await app.listen({ port: PORT });
    logger.info(`Servidor Rodando em ${PORT}`);

    // Testa a conexão só uma vez
    try {
        await knex.raw("SELECT 1");
        logger.info("✅ Conexão com PostgreSQL OK!");
    } catch (err) {
        logger.error(err, "❌ Erro na conexão com o banco:");
        process.exit(1); // sai do app se o banco não estiver acessível
    }
}

startServer();

