// Criação das tabelas no Banco

create table operador(
	id_operador INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	nome varchar(255) not null ,
	email varchar(255) not null,
	senha varchar(255) not null
);


CREATE TABLE clientes (
  id_cliente INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nome VARCHAR(255) NOT NULL,
  dt_nascimento DATE
);

CREATE TABLE carro (
  id_carro INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  cor VARCHAR(50) NOT NULL,
  placa VARCHAR(20) NOT NULL UNIQUE,
  modelo VARCHAR(100) NOT NULL,
  id_cliente INT NOT NULL,
  CONSTRAINT fk_cliente FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente)
);