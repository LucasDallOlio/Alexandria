// tests/integration/loans.test.js
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../server.js';
import { clearDatabase, closeDatabase } from '../helpers/db.js';
import { adminToken, userToken } from '../helpers/auth.js';
import pool from '../../src/config/databaseTest.js';

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