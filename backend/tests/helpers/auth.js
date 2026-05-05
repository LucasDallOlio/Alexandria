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