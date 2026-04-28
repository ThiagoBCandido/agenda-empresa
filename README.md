# Notes

Aplicação web full-stack para gerenciamento de anotações, tarefas e prazos, desenvolvida como projeto de estudo e portfólio.

O sistema permite criar notas, definir prioridades, visualizar tarefas em calendário, marcar atividades como concluídas, mover itens para lixeira e receber alertas de deadline.

> Projeto desenvolvido como uma demo funcional, com foco em aprendizado, organização de código, integração entre front-end, back-end e banco de dados.

---

## Autor
### Thiago Barbosa Candido

---
## Tecnologias utilizadas

### Front-end

- Angular
- TypeScript
- HTML
- CSS
- FullCalendar
- RxJS

### Back-end

- Java
- Spring Boot
- Spring Security
- JWT
- Spring Data JPA
- Maven

### Banco de dados

- PostgreSQL

### Outros recursos

- Git e GitHub
- Variáveis de ambiente com `.env`
- Proxy local do Angular para integração com o backend
- Autenticação com token JWT

---

## Funcionalidades

- Cadastro de usuários
- Login com autenticação JWT
- Criação de notas
- Edição de notas
- Exclusão lógica de notas
- Lixeira
- Restauração de notas excluídas
- Marcar tarefas como concluídas
- Listagem de tarefas concluídas
- Definição de prioridade:
  - Alta
  - Média
  - Baixa
- Integração com calendário
- Definição de data e horário
- Alerta de prazo/deadline
- Tema claro e escuro
- Interface responsiva
- Integração com backend e banco PostgreSQL

---

## Objetivo do projeto

O objetivo deste projeto foi desenvolver uma aplicação web completa, passando pelas principais etapas de uma aplicação real:

- construção de interface com Angular;
- criação de API REST com Spring Boot;
- autenticação com JWT;
- persistência de dados com PostgreSQL;
- organização em camadas;
- integração entre front-end e back-end;
- uso de variáveis de ambiente;
- controle de versão com Git.

Este é meu primeiro projeto mais robusto, criado com o propósito de praticar, aprender e evoluir como desenvolvedor full-stack.

---

## Estrutura do projeto

```text
agenda-empresa/
├── src/
│   └── app/
│       ├── core/
│       ├── features/
│       ├── layout/
│       └── shared/
│
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       └── resources/
│   ├── .env.example
│   ├── pom.xml
│   └── mvnw
│
├── proxy.conf.json
├── package.json
├── angular.json
└── README.md
```

---

## Pré-requisitos

Antes de rodar o projeto, é necessário ter instalado:

- Node.js
- npm
- Java JDK
- PostgreSQL
- Git

---

## Configuração do banco de dados

Crie um banco PostgreSQL local com o nome:

```sql
CREATE DATABASE agenda_empresa;
```

O usuário padrão utilizado no exemplo é:

```text
postgres
```

Caso utilize outro usuário, atualize o arquivo `.env` do backend.

---

## Configuração das variáveis de ambiente

Dentro da pasta `backend`, existe um arquivo de exemplo:

```text
backend/.env.example
```

Crie uma cópia dele com o nome:

```text
backend/.env
```

Exemplo de configuração:

```properties
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/agenda_empresa
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=sua_senha_do_postgres

JWT_SECRET=sua_chave_jwt_aqui
JWT_EXPIRATION_MS=86400000

SPRING_JPA_HIBERNATE_DDL_AUTO=update
SPRING_JPA_SHOW_SQL=false

APP_CORS_ALLOWED_ORIGINS=http://localhost:4200

PORT=8080
```

O arquivo `.env` contém informações sensíveis e não deve ser enviado para o GitHub.

O arquivo seguro para versionamento é:

```text
backend/.env.example
```

---

## Como acessar o projeto como se fosse um site:
  https://wcgz8sw3-4200.brs.devtunnels.ms/

## Como rodar o projeto localmente

### 1. Clone o repositório

```bash
git clone URL_DO_REPOSITORIO
```

Entre na pasta do projeto:

```bash
cd agenda-empresa
```

---

### 2. Instale as dependências do front-end

```bash
npm install
```

---

### 3. Rode o back-end

Entre na pasta do backend:

```bash
cd backend
```

Execute o Spring Boot:

```bash
./mvnw spring-boot:run
```

No Windows PowerShell, use:

```powershell
.\mvnw spring-boot:run
```

O backend será iniciado em:

```text
http://localhost:8080
```

---

### 4. Rode o front-end

Em outro terminal, volte para a raiz do projeto:

```bash
cd ..
```

Execute:

```bash
npm start
```

O frontend será iniciado em:

```text
http://localhost:4200
```

---

## Proxy local

O projeto utiliza um proxy local do Angular para facilitar a comunicação entre frontend e backend durante o desenvolvimento.

Arquivo:

```text
proxy.conf.json
```

Configuração:

```json
{
  "/auth": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true
  },
  "/notes": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true
  }
}
```

Com isso, o frontend pode chamar:

```text
/auth
/notes
```

E o Angular redireciona internamente para:

```text
http://localhost:8080
```

---

## Scripts disponíveis

Na raiz do projeto:

```bash
npm start
```

Inicia o Angular com proxy local.

```bash
npm run build
```

Gera a build de produção do frontend.

```bash
npm test
```

Executa os testes configurados do Angular.

No backend:

```bash
./mvnw spring-boot:run
```

Inicia a API Spring Boot.

---

## Observações sobre deploy

Atualmente, o projeto está configurado para execução local.

O frontend pode ser publicado como site estático, por exemplo, no GitHub Pages. Porém, para a aplicação funcionar completamente online, também é necessário publicar:

- o backend Spring Boot;
- o banco PostgreSQL;
- as variáveis de ambiente de produção.

Sem backend online, funcionalidades como login, cadastro e gerenciamento de notas não funcionarão fora do ambiente local.

---

## Demonstração

Sugestão para apresentação do projeto:

- gravar vídeo da aplicação rodando localmente;
- mostrar cadastro e login;
- criar uma nota;
- definir prioridade;
- visualizar no calendário;
- marcar como concluída;
- mover para lixeira;
- alternar tema claro/escuro.

---

## Status do projeto

Projeto funcional em ambiente local.

Melhorias futuras planejadas:

- melhorias de performance;
- ajustes finos de responsividade;
- criação de uma versão demo online;
- possível modo visitante;
- melhorias na organização visual;
- testes automatizados;
- documentação da API.

---

## Autor

Desenvolvido por **Thiago Barbosa Candido**.

Projeto criado para fins de estudo, prática e portfólio como desenvolvedor full-stack.

---
