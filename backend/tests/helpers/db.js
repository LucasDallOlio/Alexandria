import pool from '../../src/config/databaseTest.js';

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