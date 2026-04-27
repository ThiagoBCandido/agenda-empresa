# Notes

Sistema web de organização de tarefas, prazos e anotações, desenvolvido como projeto pessoal com foco em uso corporativo.

## Autor

**Thiago Barbosa Candido**

---

## Sobre o projeto

O **Notes** é uma aplicação criada para auxiliar empresas e equipes na organização de atividades, acompanhamento de prazos e gerenciamento visual de anotações em um ambiente centralizado e intuitivo.

A proposta do projeto surgiu da necessidade de criar uma solução prática para o dia a dia corporativo, permitindo registrar compromissos, controlar prioridades, visualizar tarefas em calendário e acompanhar o ciclo de vida de cada anotação, desde sua criação até sua conclusão ou exclusão.

Este projeto foi desenvolvido como uma iniciativa pessoal, com o objetivo de aplicar conhecimentos de desenvolvimento full stack em um sistema com utilidade real para ambientes empresariais.

---

## Objetivo

O principal objetivo da aplicação é oferecer uma ferramenta simples e funcional para:

- organizar tarefas e anotações;
- acompanhar prazos e horários;
- priorizar atividades;
- visualizar compromissos em calendário;
- separar tarefas concluídas e excluídas;
- melhorar o controle interno de demandas em empresas.

---

## O que foi desenvolvido

A aplicação foi construída com foco em experiência de uso, organização visual e integração completa entre front-end e back-end.

Entre os principais recursos implementados estão:

### Autenticação e sessão
- cadastro de usuário;
- login com autenticação;
- proteção de navegação;
- controle de sessão;
- logout seguro.

### Calendário e anotações
- criação de anotações diretamente pelo calendário;
- escolha de prioridade da tarefa;
- definição de data inicial, data final, hora inicial e hora final;
- edição de anotações;
- atualização e conclusão de tarefas;
- visualização das anotações do dia selecionado;
- sincronização entre calendário e lista de anotações.

### Organização das tarefas
- separação entre:
  - anotações ativas;
  - concluídos;
  - lixeira;
- marcação de tarefas como concluídas;
- exclusão de tarefas;
- persistência das informações via API e banco de dados.

### Perfil do usuário
- edição de informações do perfil;
- suporte a foto de perfil;
- preferências de tema;
- controle de notificações.

### Experiência visual
- tema escuro e claro;
- interface personalizada;
- destaques visuais por prioridade;
- interação entre abas e painéis;
- alertas e notificações de prazo.

### Notificações
- verificação periódica de prazos;
- alerta visual dentro da aplicação;
- notificação do navegador quando o prazo é atingido.

---

## Como o projeto foi desenvolvido

O sistema foi construído em arquitetura full stack, separando claramente front-end, back-end e persistência de dados.

### Front-end
O front-end foi desenvolvido com **Angular**, utilizando componentes standalone e uma estrutura modular para separar responsabilidades da interface.

A interface foi organizada em componentes como:
- calendário;
- anotações;
- concluídos;
- lixeira;
- perfil;
- login;
- cadastro;
- alertas e toasts.

Também foi utilizada uma biblioteca de calendário para exibição visual das tarefas por data, com personalizações visuais e integração com os dados vindos da API.

### Back-end
O back-end foi desenvolvido com **Java + Spring Boot**, seguindo uma estrutura baseada em:
- controllers;
- services;
- repositories;
- DTOs;
- autenticação com token;
- validações;
- tratamento de erros.

A API REST foi responsável por:
- autenticar usuários;
- registrar novos usuários;
- gerenciar perfil;
- criar, atualizar, concluir e excluir anotações;
- fornecer os dados necessários para o front-end.

### Banco de dados
A persistência foi feita com **PostgreSQL**, armazenando:
- usuários;
- dados de perfil;
- tarefas e anotações;
- estados das notas;
- preferências do sistema.

---

## Tecnologias utilizadas

### Front-end
- Angular
- TypeScript
- HTML
- CSS
- RxJS
- FullCalendar

### Back-end
- Java
- Spring Boot
- Spring Security
- JWT
- Spring Data JPA
- Hibernate
- Jakarta Validation

### Banco de dados
- PostgreSQL

### Ferramentas
- VS Code
- Maven
- Postman
- pgAdmin
- Git

---

## Estrutura funcional da aplicação

A aplicação foi dividida em áreas principais para facilitar o uso:

- **Login e Cadastro**  
  Controle de acesso do usuário.

- **Calendário**  
  Visualização das tarefas por data e criação de novas anotações.

- **Anotações**  
  Lista das tarefas ativas, com acesso rápido para edição.

- **Concluídos**  
  Área destinada às tarefas já finalizadas.

- **Lixeira**  
  Área com tarefas removidas da lista principal.

- **Perfil**  
  Configuração de dados do usuário, foto, tema e notificações.

---

## Por que este projeto foi criado

Este projeto foi criado como **projeto pessoal**, mas com uma finalidade prática: servir como apoio para empresas no controle interno de tarefas, prazos e anotações.

A ideia foi desenvolver uma aplicação que unisse:
- organização;
- produtividade;
- controle visual;
- experiência moderna;
- utilidade real no ambiente corporativo.

Além do valor funcional, o projeto também serviu como forma de consolidar conhecimentos em desenvolvimento full stack, autenticação, integração entre front-end e back-end, persistência de dados e construção de interfaces interativas.

---

## Aprendizados obtidos

Durante o desenvolvimento, foram trabalhados diversos conceitos importantes, como:

- construção de aplicações full stack;
- autenticação e autorização;
- comunicação entre Angular e Spring Boot;
- uso de APIs REST;
- modelagem de dados;
- manipulação de estado no front-end;
- organização de componentes;
- tratamento de erros;
- persistência em banco de dados;
- refinamento visual e experiência do usuário.

---

## Possíveis evoluções futuras

Como continuidade do projeto, ainda podem ser adicionados recursos como:

- filtros avançados;
- busca por anotações;
- notificações em tempo real;
- dashboard com métricas;
- suporte a múltiplos usuários por equipe;
- categorias e etiquetas;
- melhorias para uso mobile;
- deploy em ambiente de produção com proxy reverso e camada de borda.

---

# Otimizações aplicadas

Notei que a aplicação estava muito "redundante", e com arquivos que criei durante a primeira semana, que com o decorrer do projeto se tornaram inuteis. Com isso, resolvi otimizar o código. Estou anotando tudo o que venho alterando abaixo;

## Front-end Angular

- `AppComponent` foi simplificado para ser apenas a entrada da aplicação com `<router-outlet>`.
- As rotas existentes agora são usadas de fato: `/login`, `/register` e `/app`.
- A tela principal ficou concentrada no `AppShellComponent`, evitando duplicação entre `AppComponent` e `AppShellComponent`.
- A URL do backend foi centralizada em `src/app/core/config/api.config.ts`.
- `AuthService` foi simplificado para reaproveitar a mesma lógica de sincronização do usuário.
- A atualização de perfil agora preserva corretamente o token quando o e-mail é alterado.
- A alteração de senha agora também atualiza a sessão com o novo token retornado pelo backend.
- O interceptor duplicado de erro de autenticação foi removido do fluxo principal, deixando o controle de sessão no `auth.interceptor.ts`.
- O serviço local antigo de notas em memória foi removido, pois o projeto já usa `ApiNotesService` integrado ao backend.
- O alerta de deadline deixou de consultar o backend a cada 5 segundos e passou para 30 segundos, reduzindo chamadas repetidas sem remover a função.

## Back-end Spring Boot

- O log SQL (`spring.jpa.show-sql`) agora vem desativado por padrão, evitando excesso de logs em produção. Ainda pode ser ativado.

## Arquivos limpos

Foram removidos arquivos mortos/legados que não eram mais usados pela aplicação:

- `src/app/core/interceptors/auth-error.interceptor.ts`
- `src/app/core/services/notes.service.ts`
- arquivos `.spec.ts.bak` antigos

## Como testar

Front-end:

```bash
npm install
npm start
```

Build do front-end:

```bash
npm run build
```

Back-end:

```bash
cd backend
./mvnw spring-boot:run
```
