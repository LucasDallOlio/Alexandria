// tests/integration/auth.test.js
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../server.js';
import { clearDatabase, closeDatabase } from '../helpers/db.js';


afterAll(async () => {
    await closeDatabase();
});

describe('POST /api/auth/register', () => {
    beforeEach(async () => {
        await clearDatabase();
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
        expect(res.body.user).not.toHaveProperty('password');
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