# Guia de Testes — Alexandria API

> **Ferramentas:** [Vitest](https://vitest.dev/) + [Supertest](https://github.com/ladjs/supertest)  
> **Requisito mínimo:** 30 testes ao todo, com pelo menos 5 por grupo de funcionalidade.

---

## Sumário

1. [Por que Vitest e Supertest?](#1-por-que-vitest-e-supertest)
2. [Instalação](#2-instalação)
3. [Configuração do Ambiente de Testes](#3-configuração-do-ambiente-de-testes)
4. [Banco de Dados de Teste](#4-banco-de-dados-de-teste)
5. [Estrutura de Pastas](#5-estrutura-de-pastas)
6. [Requisitos Mínimos](#6-requisitos-mínimos)
7. [Tipos de Teste — Quando Usar Cada Um](#7-tipos-de-teste--quando-usar-cada-um)
8. [Configuração Global dos Testes (setup)](#8-configuração-global-dos-testes-setup)
9. [Exemplos por Grupo](#9-exemplos-por-grupo)
   - [Auth](#91-auth)
   - [Users](#92-users)
   - [Authors](#93-authors)
   - [Categories](#94-categories)
   - [Books](#95-books)
   - [Loans](#96-loans)
   - [Middlewares (unitários)](#97-middlewares-unitários)
10. [Comandos Úteis](#10-comandos-úteis)
11. [Dicas e Boas Práticas](#11-dicas-e-boas-práticas)
12. [Checklist Final](#12-checklist-final)

---

## 1. Por que Vitest e Supertest?

### Vitest
- Configuração mínima — funciona com Node.js puro, sem precisar de Babel ou transpilação
- API idêntica ao Jest (`describe`, `it`, `expect`, `beforeEach`, `afterAll`…), então o conhecimento é transferível
- Suporte nativo a ES Modules e TypeScript (útil no futuro)
- Saída no terminal limpa e com diff visual de falhas

### Supertest
- Permite fazer requisições HTTP reais para o servidor Express **sem precisar subir em uma porta**
- Testa o fluxo completo: rota → middleware → controller → model → banco
- Retorna a resposta com `status`, `body` e `headers` prontos para assertion

---

## 2. Instalação

No diretório `backend/`, execute:

```bash
npm install --save-dev vitest supertest @vitest/coverage-v8
```

Adicione os scripts ao `package.json`:

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage"
}
```

---

## 3. Configuração do Ambiente de Testes

### 3.1 Arquivo `vitest.config.js`

Crie na raiz do `backend/`:

```js
// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup.js'],  // executado antes de cada arquivo de teste
    env: {
      NODE_ENV: 'test',
    },
    // roda os arquivos em série para não ter conflito de banco
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.js'],
      exclude: ['src/config/swagger.js'],
    },
  },
});
```

> **Por que `singleFork: true`?**  
> Por padrão o Vitest paraleliza os arquivos de teste. Com banco de dados real, dois arquivos rodando ao mesmo tempo podem interferir nos dados um do outro. `singleFork` garante execução sequencial.

### 3.2 Arquivo `.env.test`

Crie um `.env.test` **separado** do `.env`:

```env
PORT=3001
NODE_ENV=test

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=alexandria_test       # banco separado!

JWT_SECRET=segredo_exclusivo_para_testes
JWT_EXPIRES_IN=1h
```

> Use um banco de dados diferente (`alexandria_test`) para que os testes nunca toquem nos dados reais de desenvolvimento.

---

## 4. Banco de Dados de Teste

### 4.1 Criar o banco de testes

Execute uma única vez:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS alexandria_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p alexandria_test < migrations/schema.sql
```

**Não execute o `seed.sql` no banco de testes.** Os próprios testes inserem e removem os dados que precisam — isso garante que cada teste controla seu estado.

### 4.2 Por que banco separado?

| Banco `alexandria`      | Banco `alexandria_test`   |
|-------------------------|---------------------------|
| Dados reais de dev      | Dados efêmeros de testes  |
| Populado via seed.sql   | Populado pelos próprios testes |
| Nunca apagado pelos testes | Limpo a cada rodada    |

---

## 5. Estrutura de Pastas

Crie a pasta `tests/` dentro de `backend/`:

```
backend/
└── tests/
    ├── setup.js                  # Carrega .env.test e helpers globais
    ├── helpers/
    │   ├── db.js                 # Funções de limpeza e setup do banco
    │   └── auth.js               # Gera tokens JWT para os testes
    ├── unit/
    │   └── middlewares/
    │       ├── auth.test.js      # Testes unitários do middleware de auth
    │       └── authorize.test.js # Testes unitários do middleware de autorização
    └── integration/
        ├── auth.test.js
        ├── users.test.js
        ├── authors.test.js
        ├── categories.test.js
        ├── books.test.js
        └── loans.test.js
```

---

## 6. Requisitos Mínimos

Você deve implementar **no mínimo 30 testes**, distribuídos conforme abaixo:

| Grupo               | Mínimo | O que cobrir                                                    |
|---------------------|--------|-----------------------------------------------------------------|
| **Auth**            | 5      | Registro, login, token inválido, e-mail duplicado, perfil       |
| **Users**           | 5      | Listagem, busca, atualização, deleção, acesso negado por role   |
| **Authors**         | 5      | CRUD completo + tentativa sem autenticação                      |
| **Categories**      | 5      | CRUD completo + tentativa sem autenticação                      |
| **Books**           | 5      | CRUD completo + JOIN com autor/categoria na resposta            |
| **Loans**           | 5      | Criar empréstimo, sem estoque, devolução, acesso isolado por user|
| **Middlewares**     | 5      | `authenticate` e `authorize` em isolamento (testes unitários)   |
| **Total**           | **35** | *(5 extras distribuídos à sua escolha)*                        |

> Testes a mais são bem-vindos e demonstram maior domínio. A meta de 35 já supera o mínimo e garante boa cobertura.

### Critérios de avaliação

- [ ] Cada teste tem uma única responsabilidade (testa uma coisa só)
- [ ] O banco é limpo antes de cada suíte (`beforeEach` / `afterAll`)
- [ ] Nenhum teste depende da ordem de execução
- [ ] Testes de autorização cobrem tanto o caminho autorizado quanto o negado
- [ ] Testes de validação cobrem o caminho de erro (400, 404, 409) além do sucesso (200/201)

---

## 7. Tipos de Teste — Quando Usar Cada Um

### Teste de Integração (via Supertest)

Use para testar **rotas completas**. O Supertest dispara uma requisição HTTP real contra o servidor Express e você verifica status code + body.

```
Requisição HTTP
    → Express Router
        → Middleware (auth/authorize)
            → Controller
                → Model
                    → Banco de dados real (alexandria_test)
```

**Use quando:** quiser garantir que a rota se comporta corretamente de ponta a ponta.

### Teste Unitário (com mocks)

Use para testar **uma unidade isolada** — uma função, um middleware — sem depender de banco ou servidor.

```
Função sendo testada
    → Dependências substituídas por mocks (vi.fn(), vi.mock())
```

**Use quando:** quiser testar a lógica de um middleware sem subir o servidor, ou testar uma função model com banco simulado.

---

## 8. Configuração Global dos Testes (setup)

### `tests/setup.js`

```js
import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });
```

### `tests/helpers/db.js`

```js
import pool from '../../src/config/database.js';

// Limpa todas as tabelas na ordem correta (respeitando FK)
export async function clearDatabase() {
  await pool.query('SET FOREIGN_KEY_CHECKS = 0');
  await pool.query('TRUNCATE TABLE loans');
  await pool.query('TRUNCATE TABLE books');
  await pool.query('TRUNCATE TABLE categories');
  await pool.query('TRUNCATE TABLE authors');
  await pool.query('TRUNCATE TABLE users');
  await pool.query('SET FOREIGN_KEY_CHECKS = 1');
}

// Fecha o pool ao fim de todos os testes (evita o processo ficar pendurado)
export async function closeDatabase() {
  await pool.end();
}
```

> **Por que `SET FOREIGN_KEY_CHECKS = 0`?**  
> As tabelas possuem chaves estrangeiras entre si. Sem desativar a verificação temporariamente, o MySQL impediria o `TRUNCATE` em tabelas referenciadas por outras.

### `tests/helpers/auth.js`

```js
import jwt from 'jsonwebtoken';

export function generateToken(payload = {}) {
  return jwt.sign(
    { id: 1, email: 'test@test.com', role: 'user', ...payload },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
}

export function adminToken() {
  return generateToken({ id: 99, email: 'admin@test.com', role: 'admin' });
}

export function userToken(id = 1) {
  return generateToken({ id, email: `user${id}@test.com`, role: 'user' });
}
```

---

## 9. Exemplos por Grupo

> Os exemplos abaixo são **modelos**. Você deve expandi-los e adaptar ao seu raciocínio.  
> Cada `describe` representa um arquivo de teste.

### 9.1 Auth

```js
// tests/integration/auth.test.js
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../server.js';
import { clearDatabase, closeDatabase } from '../helpers/db.js';

// Exportar app sem o listen() é necessário para o Supertest.
// Veja a seção "Adaptando o server.js" mais abaixo.

describe('POST /api/auth/register', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  it('deve registrar um novo usuário e retornar 201', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Teste',
      email: 'teste@email.com',
      password: 'senha123',
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user).not.toHaveProperty('password'); // senha nunca exposta
  });

  it('deve retornar 409 ao registrar e-mail já existente', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Primeiro',
      email: 'duplicado@email.com',
      password: 'senha123',
    });

    const res = await request(app).post('/api/auth/register').send({
      name: 'Segundo',
      email: 'duplicado@email.com',
      password: 'outrasenha',
    });

    expect(res.status).toBe(409);
  });

  it('deve retornar 400 quando campos obrigatórios estão ausentes', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'semsenha@email.com',
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await clearDatabase();
    // Registra um usuário para testar o login
    await request(app).post('/api/auth/register').send({
      name: 'Login User',
      email: 'login@test.com',
      password: 'correta123',
    });
  });

  it('deve autenticar com credenciais corretas e retornar token JWT', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'login@test.com',
      password: 'correta123',
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(typeof res.body.token).toBe('string');
    expect(res.body.user.role).toBe('user');
  });

  it('deve retornar 401 com senha incorreta', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'login@test.com',
      password: 'senhaerrada',
    });

    expect(res.status).toBe(401);
  });

  it('deve retornar 401 com e-mail inexistente', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'naoexiste@test.com',
      password: 'qualquer',
    });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/profile', () => {
  it('deve retornar 401 sem token', async () => {
    const res = await request(app).get('/api/auth/profile');
    expect(res.status).toBe(401);
  });

  it('deve retornar 401 com token inválido', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer token.invalido.aqui');

    expect(res.status).toBe(401);
  });
});
```

---

### 9.2 Users

```js
// tests/integration/users.test.js
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../server.js';
import { clearDatabase, closeDatabase } from '../helpers/db.js';
import { adminToken, userToken } from '../helpers/auth.js';

describe('GET /api/users', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(closeDatabase);

  it('deve retornar 403 para usuário com role user', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${userToken()}`);

    expect(res.status).toBe(403);
  });

  it('deve retornar lista paginada para admin', async () => {
    // Cria dois usuários para verificar a paginação
    await request(app).post('/api/auth/register').send({ name: 'A', email: 'a@t.com', password: '123456' });
    await request(app).post('/api/auth/register').send({ name: 'B', email: 'b@t.com', password: '123456' });

    const res = await request(app)
      .get('/api/users?page=1&limit=10')
      .set('Authorization', `Bearer ${adminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('page');
    expect(res.body).toHaveProperty('limit');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('deve respeitar o parâmetro limit na paginação', async () => {
    await request(app).post('/api/auth/register').send({ name: 'U1', email: 'u1@t.com', password: '123456' });
    await request(app).post('/api/auth/register').send({ name: 'U2', email: 'u2@t.com', password: '123456' });
    await request(app).post('/api/auth/register').send({ name: 'U3', email: 'u3@t.com', password: '123456' });

    const res = await request(app)
      .get('/api/users?page=1&limit=2')
      .set('Authorization', `Bearer ${adminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(2);
    expect(res.body.limit).toBe(2);
  });

  it('deve retornar 401 sem token', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(401);
  });

  it('deve retornar 404 ao buscar usuário inexistente', async () => {
    const res = await request(app)
      .get('/api/users/99999')
      .set('Authorization', `Bearer ${adminToken()}`);

    expect(res.status).toBe(404);
  });
});
```

---

### 9.3 Authors

```js
// tests/integration/authors.test.js
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../server.js';
import { clearDatabase, closeDatabase } from '../helpers/db.js';
import { adminToken, userToken } from '../helpers/auth.js';

async function createAuthor(token, data = {}) {
  return request(app)
    .post('/api/authors')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Autor Padrão', nationality: 'Brasileiro', ...data });
}

describe('Authors — CRUD', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(closeDatabase);

  it('deve criar um autor como admin e retornar 201', async () => {
    const res = await createAuthor(adminToken(), { name: 'Clarice Lispector' });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Clarice Lispector');
    expect(res.body).toHaveProperty('id');
  });

  it('deve retornar 403 ao tentar criar autor como user', async () => {
    const res = await createAuthor(userToken());
    expect(res.status).toBe(403);
  });

  it('deve retornar 400 quando name está ausente', async () => {
    const res = await request(app)
      .post('/api/authors')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ nationality: 'Brasileiro' });

    expect(res.status).toBe(400);
  });

  it('deve listar autores com paginação', async () => {
    await createAuthor(adminToken(), { name: 'Autor 1' });
    await createAuthor(adminToken(), { name: 'Autor 2' });

    const res = await request(app)
      .get('/api/authors?page=1&limit=10')
      .set('Authorization', `Bearer ${userToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
  });

  it('deve retornar 404 ao buscar autor inexistente', async () => {
    const res = await request(app)
      .get('/api/authors/99999')
      .set('Authorization', `Bearer ${userToken()}`);

    expect(res.status).toBe(404);
  });

  it('deve atualizar um autor como admin', async () => {
    const created = await createAuthor(adminToken(), { name: 'Nome Antigo' });
    const id = created.body.id;

    const res = await request(app)
      .put(`/api/authors/${id}`)
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ name: 'Nome Novo' });

    expect(res.status).toBe(200);
  });

  it('deve deletar um autor como admin e retornar 204', async () => {
    const created = await createAuthor(adminToken());
    const id = created.body.id;

    const res = await request(app)
      .delete(`/api/authors/${id}`)
      .set('Authorization', `Bearer ${adminToken()}`);

    expect(res.status).toBe(204);
  });
});
```

---

### 9.4 Categories

> Estrutura idêntica à de Authors. Implemente adaptando os campos e mensagens.

```js
// tests/integration/categories.test.js
// Cubra: criar (201), criar sem name (400), criar como user (403),
//        listar (200 + paginação), buscar inexistente (404),
//        atualizar (200), deletar (204).
```

---

### 9.5 Books

```js
// tests/integration/books.test.js
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../server.js';
import { clearDatabase, closeDatabase } from '../helpers/db.js';
import { adminToken, userToken } from '../helpers/auth.js';

async function createAuthorId() {
  const res = await request(app)
    .post('/api/authors')
    .set('Authorization', `Bearer ${adminToken()}`)
    .send({ name: 'Autor Teste' });
  return res.body.id;
}

describe('Books — CRUD', () => {
  let authorId;

  beforeEach(async () => {
    await clearDatabase();
    authorId = await createAuthorId();
  });

  afterAll(closeDatabase);

  it('deve criar um livro e retornar 201', async () => {
    const res = await request(app)
      .post('/api/books')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ title: 'Dom Casmurro', author_id: authorId, quantity: 3 });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Dom Casmurro');
    expect(res.body).toHaveProperty('author_name'); // verifica o JOIN
  });

  it('deve retornar 400 sem title ou author_id', async () => {
    const res = await request(app)
      .post('/api/books')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ quantity: 2 });

    expect(res.status).toBe(400);
  });

  it('deve retornar 403 ao criar livro como user', async () => {
    const res = await request(app)
      .post('/api/books')
      .set('Authorization', `Bearer ${userToken()}`)
      .send({ title: 'Livro', author_id: authorId });

    expect(res.status).toBe(403);
  });

  it('deve trazer author_name e category_name na listagem (JOIN)', async () => {
    await request(app)
      .post('/api/books')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ title: 'Livro JOIN', author_id: authorId });

    const res = await request(app)
      .get('/api/books')
      .set('Authorization', `Bearer ${userToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('author_name');
  });

  it('deve retornar 404 ao buscar livro inexistente', async () => {
    const res = await request(app)
      .get('/api/books/99999')
      .set('Authorization', `Bearer ${userToken()}`);

    expect(res.status).toBe(404);
  });

  it('deve deletar um livro como admin', async () => {
    const created = await request(app)
      .post('/api/books')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ title: 'A Deletar', author_id: authorId });

    const res = await request(app)
      .delete(`/api/books/${created.body.id}`)
      .set('Authorization', `Bearer ${adminToken()}`);

    expect(res.status).toBe(204);
  });
});
```

---

### 9.6 Loans

```js
// tests/integration/loans.test.js
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../server.js';
import { clearDatabase, closeDatabase } from '../helpers/db.js';
import { adminToken, userToken } from '../helpers/auth.js';
import pool from '../../src/config/database.js';

async function setupBookAndUser() {
  // Cria um usuário real no banco para o empréstimo
  const [result] = await pool.query(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    ['User Loan', 'loaner@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user']
  );
  const userId = result.insertId;

  const authorRes = await request(app)
    .post('/api/authors')
    .set('Authorization', `Bearer ${adminToken()}`)
    .send({ name: 'Autor' });

  const bookRes = await request(app)
    .post('/api/books')
    .set('Authorization', `Bearer ${adminToken()}`)
    .send({ title: 'Livro Empréstimo', author_id: authorRes.body.id, quantity: 2 });

  return { userId, bookId: bookRes.body.id };
}

describe('Loans — empréstimos e devoluções', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(closeDatabase);

  it('deve criar um empréstimo e retornar 201', async () => {
    const { userId, bookId } = await setupBookAndUser();
    const token = userToken(userId);

    const res = await request(app)
      .post('/api/loans')
      .set('Authorization', `Bearer ${token}`)
      .send({ book_id: bookId, due_date: '2026-12-31' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.status).toBe('active');
  });

  it('deve retornar 409 quando livro não tem exemplares disponíveis', async () => {
    const { userId, bookId } = await setupBookAndUser();

    // Zera o estoque disponível diretamente no banco
    await pool.query('UPDATE books SET available_qty = 0 WHERE id = ?', [bookId]);

    const res = await request(app)
      .post('/api/loans')
      .set('Authorization', `Bearer ${userToken(userId)}`)
      .send({ book_id: bookId, due_date: '2026-12-31' });

    expect(res.status).toBe(409);
  });

  it('deve retornar 400 sem book_id ou due_date', async () => {
    const res = await request(app)
      .post('/api/loans')
      .set('Authorization', `Bearer ${userToken()}`)
      .send({ book_id: 1 }); // falta due_date

    expect(res.status).toBe(400);
  });

  it('deve registrar devolução como admin e retornar 200', async () => {
    const { userId, bookId } = await setupBookAndUser();

    const loanRes = await request(app)
      .post('/api/loans')
      .set('Authorization', `Bearer ${userToken(userId)}`)
      .send({ book_id: bookId, due_date: '2026-12-31' });

    const loanId = loanRes.body.id;

    const res = await request(app)
      .patch(`/api/loans/${loanId}/return`)
      .set('Authorization', `Bearer ${adminToken()}`);

    expect(res.status).toBe(200);
  });

  it('deve retornar 409 ao tentar devolver um empréstimo já devolvido', async () => {
    const { userId, bookId } = await setupBookAndUser();

    const loanRes = await request(app)
      .post('/api/loans')
      .set('Authorization', `Bearer ${userToken(userId)}`)
      .send({ book_id: bookId, due_date: '2026-12-31' });

    const loanId = loanRes.body.id;

    await request(app)
      .patch(`/api/loans/${loanId}/return`)
      .set('Authorization', `Bearer ${adminToken()}`);

    // Segunda tentativa de devolução
    const res = await request(app)
      .patch(`/api/loans/${loanId}/return`)
      .set('Authorization', `Bearer ${adminToken()}`);

    expect(res.status).toBe(409);
  });

  it('deve impedir que user veja empréstimo de outro usuário', async () => {
    const { userId, bookId } = await setupBookAndUser();

    const loanRes = await request(app)
      .post('/api/loans')
      .set('Authorization', `Bearer ${userToken(userId)}`)
      .send({ book_id: bookId, due_date: '2026-12-31' });

    const loanId = loanRes.body.id;

    // Outro usuário (id diferente) tenta acessar
    const res = await request(app)
      .get(`/api/loans/${loanId}`)
      .set('Authorization', `Bearer ${userToken(999)}`);

    expect(res.status).toBe(403);
  });

  it('deve decrementar available_qty ao criar empréstimo', async () => {
    const { userId, bookId } = await setupBookAndUser();

    const [[before]] = await pool.query('SELECT available_qty FROM books WHERE id = ?', [bookId]);

    await request(app)
      .post('/api/loans')
      .set('Authorization', `Bearer ${userToken(userId)}`)
      .send({ book_id: bookId, due_date: '2026-12-31' });

    const [[after]] = await pool.query('SELECT available_qty FROM books WHERE id = ?', [bookId]);

    expect(after.available_qty).toBe(before.available_qty - 1);
  });
});
```

---

### 9.7 Middlewares (unitários)

```js
// tests/unit/middlewares/auth.test.js
import { describe, it, expect, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import authenticate from '../../../src/middlewares/auth.js';

process.env.JWT_SECRET = 'segredo_teste';

function mockReqRes(authHeader) {
  const req = { headers: { authorization: authHeader } };
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  const next = vi.fn();
  return { req, res, next };
}

describe('Middleware: authenticate', () => {
  it('deve chamar next() com token válido', () => {
    const token = jwt.sign({ id: 1, role: 'user' }, 'segredo_teste', { expiresIn: '1h' });
    const { req, res, next } = mockReqRes(`Bearer ${token}`);

    authenticate(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(req.user).toHaveProperty('id', 1);
  });

  it('deve retornar 401 sem header Authorization', () => {
    const { req, res, next } = mockReqRes(undefined);

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('deve retornar 401 com token malformado', () => {
    const { req, res, next } = mockReqRes('Bearer token.invalido');

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('deve retornar 401 com token expirado', () => {
    const token = jwt.sign({ id: 1 }, 'segredo_teste', { expiresIn: '-1s' });
    const { req, res, next } = mockReqRes(`Bearer ${token}`);

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('deve retornar 401 sem o prefixo Bearer', () => {
    const token = jwt.sign({ id: 1 }, 'segredo_teste');
    const { req, res, next } = mockReqRes(token); // sem "Bearer "

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});

// tests/unit/middlewares/authorize.test.js
import authorize from '../../../src/middlewares/authorize.js';

describe('Middleware: authorize', () => {
  it('deve chamar next() quando o role está na lista permitida', () => {
    const req = { user: { role: 'admin' } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    authorize('admin')(req, res, next);

    expect(next).toHaveBeenCalledOnce();
  });

  it('deve retornar 403 quando o role não está na lista', () => {
    const req = { user: { role: 'user' } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    authorize('admin')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
```

---

## Adaptando o `server.js` para o Supertest

O Supertest precisa importar o `app` **sem** que o `listen()` já tenha sido chamado. Refatore o `server.js` assim:

```js
// server.js
require('dotenv').config();
const express = require('express');
// ... demais imports ...

const app = express();

// ... toda a configuração de middlewares e rotas ...

module.exports = app; // exporta o app

// Só sobe o servidor se este arquivo for executado diretamente (não via require/import)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}
```

> **Por que isso importa?**  
> Se o `listen()` for chamado ao importar o módulo, o Supertest tentará usar uma porta já em uso e o processo não terminará após os testes.

---

## 10. Comandos Úteis

```bash
# Rodar todos os testes uma vez
npm test

# Rodar em modo watch (re-executa ao salvar)
npm run test:watch

# Rodar apenas um arquivo
npx vitest run tests/integration/auth.test.js

# Ver relatório de cobertura de código
npm run test:coverage
# Abre o relatório HTML em: coverage/index.html

# Rodar testes que correspondem a um padrão no nome
npx vitest run -t "deve retornar 401"
```

---

## 11. Dicas e Boas Práticas

### Isolamento de dados
Cada `describe` ou `it` deve começar com um estado limpo. Use `beforeEach(() => clearDatabase())` no nível do `describe` mais externo.

### Nomes descritivos
Um bom nome de teste comunica a intenção sem precisar ler o corpo:
```
✅ deve retornar 409 ao emprestar livro sem estoque
❌ teste de empréstimo 3
```

### Uma assertion por comportamento
Prefira vários `it()` pequenos a um `it()` com 10 `expect()`. Se o teste falhar, você saberá exatamente o quê.

### Não use dados hardcoded entre testes
```js
// ❌ ruim: depende do ID 1 existir de uma execução anterior
const res = await request(app).get('/api/books/1');

// ✅ bom: cria o recurso no próprio teste e usa o ID retornado
const created = await request(app).post('/api/books')...;
const res = await request(app).get(`/api/books/${created.body.id}`);
```

### Teste os erros tanto quanto os sucessos

| Tipo de cenário | Exemplo                                              |
|-----------------|------------------------------------------------------|
| Caminho feliz   | Criar recurso com dados válidos → 201                |
| Validação       | Criar recurso sem campo obrigatório → 400            |
| Autenticação    | Acessar rota protegida sem token → 401               |
| Autorização     | User tentando operação de admin → 403                |
| Não encontrado  | Buscar recurso com ID inexistente → 404              |
| Conflito        | Criar recurso duplicado ou estado inválido → 409     |

### Verifique o body, não só o status

```js
// ✅ verifica que a resposta tem a estrutura esperada
expect(res.status).toBe(201);
expect(res.body.title).toBe('Dom Casmurro');
expect(res.body).toHaveProperty('author_name'); // confirma o JOIN
expect(res.body).not.toHaveProperty('password'); // confirma segurança
```

---

## 12. Checklist Final

Antes de entregar, verifique:

- [ ] `npm test` roda sem erros
- [ ] Total de testes: **≥ 30** (meta: 35)
- [ ] Cada grupo tem **≥ 5** testes
- [ ] Todos os testes passam de forma **independente** (sem dependência de ordem)
- [ ] O banco de testes é limpo no `beforeEach` de cada suíte
- [ ] O pool é fechado no `afterAll` para o processo encerrar corretamente
- [ ] O `.env.test` usa o banco `alexandria_test` (não o `alexandria`)
- [ ] Testes cobrem tanto **caminhos de sucesso** quanto **caminhos de erro**
- [ ] Nenhum `console.log` ou `console.error` desnecessário nos testes
- [ ] `npm run test:coverage` mostra cobertura relevante nas camadas testadas
