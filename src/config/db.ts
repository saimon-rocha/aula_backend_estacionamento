import { knex as setupKnex, Knex } from 'knex';
import 'dotenv/config';


// Configuração da conexão com PostgreSQL
const databaseConfig: Knex.Config = {
    client: 'pg', // ❌ mudou de 'oracledb' para 'pg'
    connection: {
        host: process.env.DB_HOST,       // exemplo: 'localhost'
        port: Number(process.env.DB_PORT),       // exemplo: 5432
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    },
    pool: {
        min: 1,
        max: 10, // geralmente menor que Oracle
    },
    migrations: {
        directory: './migrations', // 🔑 pasta de migrations
        extension: "ts",
    },
};

// Cria instância do Knex
const knex = setupKnex(databaseConfig);

export default knex;
