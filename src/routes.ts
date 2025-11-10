import { FastifyInstance } from "fastify";
import OperadorController from "./controller/OperadorController";
import ClienteController from "./controller/ClienteController";
import CarroController from "./controller/CarroController";

export async function operadorRoutes(app: FastifyInstance) {
  app.get("/", OperadorController.index);
  app.get("/pesquisa/:id_operador", OperadorController.pesquisa);
  app.post("/cad", OperadorController.create);
  app.put("/edit/:id_operador", OperadorController.edit);
  app.delete("/delete/:id_operador", OperadorController.delet);
}


// Cliente
export async function clienteRoutes(app: FastifyInstance) {
  app.get("/", ClienteController.index);
  app.get("/pesquisa/:id_cliente", ClienteController.pesquisa);
  app.post("/cad", ClienteController.create);
  app.put("/edit/:id_cliente", ClienteController.edit);
  app.delete("/delete/:id_cliente", ClienteController.delet);
}

// Carro
export async function carroRoutes(app: FastifyInstance) {
  app.get("/", CarroController.index);
  app.get("/pesquisa/:id_carro", CarroController.pesquisa);
  app.post("/cad", CarroController.create);
  app.put("/edit/:id_carro", CarroController.edit);
  app.delete("/delete/:id_carro", CarroController.delet);
}