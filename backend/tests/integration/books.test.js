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