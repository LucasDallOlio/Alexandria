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