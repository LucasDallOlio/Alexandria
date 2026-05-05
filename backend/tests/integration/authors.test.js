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