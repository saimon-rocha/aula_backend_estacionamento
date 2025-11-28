import { FastifyInstance } from "fastify";
import OperadorController from "./controller/OperadorController";
import ClienteController from "./controller/ClienteController";
import CarroController from "./controller/CarroController";
import LoginController from "./controller/LoginController";
import { verificarToken } from "./infra/jwt";

// Helper para aplicar middleware em várias rotas
function protegerRotas(handler: any) {
  return { preHandler: verificarToken, handler };
}

// Operador -> protegido
export async function operadorRoutes(app: FastifyInstance) {
  app.get("/", protegerRotas(OperadorController.index));
  app.get("/pesquisa/:id_operador", protegerRotas(OperadorController.pesquisa));
  app.post("/cad", protegerRotas(OperadorController.create));
  app.put("/edit/:id_operador", protegerRotas(OperadorController.edit));
  app.delete("/delete/:id_operador", protegerRotas(OperadorController.delet));
}

// Login -> livre
export async function loginRoutes(app: FastifyInstance) {
  app.post("/", LoginController.login);
}

// Cliente -> protegido
export async function clienteRoutes(app: FastifyInstance) {
  app.get("/", { preHandler: verificarToken }, ClienteController.index);
  app.get("/pesquisa/:id_cliente", { preHandler: verificarToken }, ClienteController.pesquisa);
  app.post("/cad", { preHandler: verificarToken }, ClienteController.create);
  app.put("/edit/:id_cliente", { preHandler: verificarToken }, ClienteController.edit);
  app.delete("/delete/:id_cliente", { preHandler: verificarToken }, ClienteController.delet);
}

// Carro -> protegido
export async function carroRoutes(app: FastifyInstance) {
  app.get("/", protegerRotas(CarroController.index));
  app.get("/pesquisa/:id_carro", protegerRotas(CarroController.pesquisa));
  app.post("/cad", protegerRotas(CarroController.create));
  app.put("/edit/:id_carro", protegerRotas(CarroController.edit));
  app.delete("/delete/:id_carro", protegerRotas(CarroController.delet));
}
