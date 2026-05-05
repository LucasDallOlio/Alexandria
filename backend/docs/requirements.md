# Alexandria API — Documento de Requisitos

> **Versão:** 1.0.0  
> **Público-alvo:** Alunos que desenvolverão os testes de integração e unitários desta API.

---

## 1. Visão Geral

A **Alexandria** é uma API RESTful para gerenciamento de uma biblioteca. Ela permite cadastrar livros, autores e categorias, além de gerenciar usuários e empréstimos. O acesso é controlado por autenticação JWT com dois perfis de usuário.

---

## 2. Entidades do Sistema

### 2.1 User (Usuário)

| Campo        | Tipo                | Regras                                  |
|--------------|---------------------|-----------------------------------------|
| `id`         | integer (PK)        | Auto incremento                         |
| `name`       | string (100)        | Obrigatório                             |
| `email`      | string (150)        | Obrigatório, único                      |
| `password`   | string (255)        | Obrigatório, armazenado como hash bcrypt|
| `role`       | enum(admin, user)   | Padrão: `user`                          |
| `created_at` | timestamp           | Automático                              |

### 2.2 Author (Autor)

| Campo         | Tipo         | Regras       |
|---------------|--------------|--------------|
| `id`          | integer (PK) | Auto incremento |
| `name`        | string (150) | Obrigatório  |
| `nationality` | string (100) | Opcional     |
| `bio`         | text         | Opcional     |
| `created_at`  | timestamp    | Automático   |

### 2.3 Category (Categoria)

| Campo         | Tipo         | Regras              |
|---------------|--------------|---------------------|
| `id`          | integer (PK) | Auto incremento     |
| `name`        | string (100) | Obrigatório, único  |
| `description` | text         | Opcional            |
| `created_at`  | timestamp    | Automático          |

### 2.4 Book (Livro)

| Campo           | Tipo         | Regras                        |
|-----------------|--------------|-------------------------------|
| `id`            | integer (PK) | Auto incremento               |
| `title`         | string (255) | Obrigatório                   |
| `isbn`          | string (20)  | Opcional, único               |
| `author_id`     | FK → Author  | Obrigatório                   |
| `category_id`   | FK → Category| Opcional                      |
| `quantity`      | integer      | Total de exemplares (≥ 1)     |
| `available_qty` | integer      | Exemplares disponíveis        |
| `published_year`| year         | Opcional                      |
| `created_at`    | timestamp    | Automático                    |

### 2.5 Loan (Empréstimo)

| Campo         | Tipo                         | Regras                            |
|---------------|------------------------------|-----------------------------------|
| `id`          | integer (PK)                 | Auto incremento                   |
| `user_id`     | FK → User                    | Obrigatório                       |
| `book_id`     | FK → Book                    | Obrigatório                       |
| `loan_date`   | timestamp                    | Automático (momento do empréstimo)|
| `due_date`    | date                         | Obrigatório (data de devolução)   |
| `return_date` | timestamp (nullable)         | Preenchido ao devolver            |
| `status`      | enum(active, returned, overdue) | Padrão: `active`               |

---

## 3. Autenticação e Autorização

- A API usa **JWT (JSON Web Token)** com expiração configurável via `.env`.
- O token deve ser enviado no header: `Authorization: Bearer <token>`.
- Dois perfis: **admin** (acesso total) e **user** (acesso limitado).

| Operação                          | Acesso        |
|-----------------------------------|---------------|
| Registrar / Fazer login           | Público       |
| Ver perfil próprio                | Autenticado   |
| Gerenciar usuários (CRUD)         | Admin         |
| Listar / ver livros, autores, categorias | Autenticado |
| Criar / editar / remover livros, autores, categorias | Admin |
| Realizar empréstimo               | Autenticado   |
| Listar empréstimos                | Admin (todos) / User (próprios) |
| Ver empréstimo específico         | Admin ou dono |
| Registrar devolução / deletar empréstimo | Admin   |

---

## 4. Endpoints da API

Base URL: `http://localhost:3000/api`

### Auth

| Método | Rota              | Descrição                       | Acesso   |
|--------|-------------------|---------------------------------|----------|
| POST   | `/auth/register`  | Registrar novo usuário          | Público  |
| POST   | `/auth/login`     | Autenticar e obter token JWT    | Público  |
| GET    | `/auth/profile`   | Retornar dados do usuário logado| Auth     |

### Users

| Método | Rota          | Descrição                | Acesso |
|--------|---------------|--------------------------|--------|
| GET    | `/users`      | Listar usuários (paginado)| Admin |
| GET    | `/users/:id`  | Buscar usuário por ID    | Admin  |
| PUT    | `/users/:id`  | Atualizar usuário        | Admin  |
| DELETE | `/users/:id`  | Remover usuário          | Admin  |

### Authors

| Método | Rota            | Descrição                  | Acesso         |
|--------|-----------------|----------------------------|----------------|
| GET    | `/authors`      | Listar autores (paginado)  | Auth           |
| GET    | `/authors/:id`  | Buscar autor por ID        | Auth           |
| POST   | `/authors`      | Cadastrar autor            | Admin          |
| PUT    | `/authors/:id`  | Atualizar autor            | Admin          |
| DELETE | `/authors/:id`  | Remover autor              | Admin          |

### Categories

| Método | Rota               | Descrição                     | Acesso |
|--------|--------------------|-------------------------------|--------|
| GET    | `/categories`      | Listar categorias (paginado)  | Auth   |
| GET    | `/categories/:id`  | Buscar categoria por ID       | Auth   |
| POST   | `/categories`      | Criar categoria               | Admin  |
| PUT    | `/categories/:id`  | Atualizar categoria           | Admin  |
| DELETE | `/categories/:id`  | Remover categoria             | Admin  |

### Books

| Método | Rota          | Descrição                         | Acesso |
|--------|---------------|-----------------------------------|--------|
| GET    | `/books`      | Listar livros com JOIN (paginado) | Auth   |
| GET    | `/books/:id`  | Buscar livro por ID               | Auth   |
| POST   | `/books`      | Cadastrar livro                   | Admin  |
| PUT    | `/books/:id`  | Atualizar livro                   | Admin  |
| DELETE | `/books/:id`  | Remover livro                     | Admin  |

### Loans

| Método | Rota                  | Descrição                           | Acesso         |
|--------|-----------------------|-------------------------------------|----------------|
| GET    | `/loans`              | Listar empréstimos (paginado)       | Admin/User(*) |
| GET    | `/loans/:id`          | Buscar empréstimo por ID            | Admin/Dono    |
| POST   | `/loans`              | Realizar empréstimo                 | Auth           |
| PATCH  | `/loans/:id/return`   | Registrar devolução                 | Admin          |
| DELETE | `/loans/:id`          | Remover registro                    | Admin          |

(*) Admin vê todos; User vê apenas os próprios.

---

## 5. Formato de Resposta Paginada

Todas as rotas de listagem suportam `?page=1&limit=10` e retornam:

```json
{
  "data": [ ... ],
  "total": 42,
  "page": 1,
  "limit": 10
}
```

---

## 6. Códigos de Status HTTP

| Código | Significado                                   |
|--------|-----------------------------------------------|
| 200    | OK — requisição bem-sucedida                  |
| 201    | Created — recurso criado                      |
| 204    | No Content — deletado com sucesso             |
| 400    | Bad Request — campos obrigatórios ausentes    |
| 401    | Unauthorized — token ausente ou inválido      |
| 403    | Forbidden — permissão insuficiente            |
| 404    | Not Found — recurso não encontrado            |
| 409    | Conflict — duplicata ou estado inválido       |
| 500    | Internal Server Error — erro inesperado       |

---

## 7. Regras de Negócio

1. **Senha nunca retornada:** O campo `password` nunca é incluído nas respostas da API.
2. **Disponibilidade de livros:** Ao realizar um empréstimo, `available_qty` é decrementado. Se `available_qty < 1`, retorna 409.
3. **Devolução:** Ao registrar a devolução, `available_qty` é incrementado e `return_date` recebe a data/hora atual.
4. **Devolução dupla:** Tentar devolver um empréstimo já `returned` retorna 409.
5. **Isolamento de empréstimos:** Um usuário com role `user` só pode ver seus próprios empréstimos.
6. **Integridade referencial:** Não é possível deletar um autor com livros vinculados (RESTRICT). Deletar uma categoria não apaga os livros (SET NULL).

---

## 8. Sugestões de Cenários para Testes

### Testes Unitários (models/middlewares)
- `User.findByEmail` retorna `null` quando o e-mail não existe
- `authenticate` retorna 401 sem header Authorization
- `authenticate` retorna 401 com token expirado/inválido
- `authorize('admin')` retorna 403 para role `user`
- `Loan.findByUser` retorna apenas empréstimos do usuário informado

### Testes de Integração (endpoints)
- POST `/auth/register` com e-mail já cadastrado → 409
- POST `/auth/login` com senha errada → 401
- GET `/books` sem token → 401
- POST `/books` com role `user` → 403
- POST `/books` sem `title` → 400
- POST `/loans` com `available_qty = 0` → 409
- PATCH `/loans/:id/return` em empréstimo já devolvido → 409
- GET `/loans` como `user` deve retornar apenas empréstimos próprios
- GET `/users` com paginação `?page=1&limit=2` → `limit: 2` na resposta
