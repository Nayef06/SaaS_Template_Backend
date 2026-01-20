import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../utils/db';

import { validatePassword } from '../utils/validation';

// Helper to generate tokens
// In a real app, you might want to type the payload more strictly
const generateTokens = (userId: string, role: string) => {
    const accessSecret = process.env.JWT_ACCESS_SECRET!;
    const refreshSecret = process.env.JWT_REFRESH_SECRET!;
    const accessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
    const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

    const accessToken = jwt.sign({ userId, role }, accessSecret, { expiresIn: accessExpiresIn } as jwt.SignOptions);
    const refreshToken = jwt.sign({ userId, role }, refreshSecret, { expiresIn: refreshExpiresIn } as jwt.SignOptions);

    return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({ error: passwordValidation.error });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Fetch default role
        const userRole = await prisma.role.findUnique({
            where: { name: 'USER' }
        });

        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                roles: userRole ? {
                    create: {
                        roleId: userRole.id
                    }
                } : undefined
            },
            include: {
                roles: {
                    include: {
                        role: true
                    }
                }
            }
        });

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: newUser.id,
                email: newUser.email,
                role: newUser.roles[0]?.role?.name,
                createdAt: newUser.createdAt,
            },
        });
    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Determine user role - simply taking the first one or default for now
        // In a complex app, you might put all roles in the token
        // We haven't implemented roles fully yet, so we'll pass 'USER' or fetch if exists
        // But per schema, `user.roles` needs to be fetched.
        // Let's fetch roles.
        const userWithRoles = await prisma.user.findUnique({
            where: { id: user.id },
            include: { roles: { include: { role: true } } }
        });

        // Fallback role if none assigned
        const roleName = userWithRoles?.roles[0]?.role?.name || 'USER';

        const { accessToken, refreshToken } = generateTokens(user.id, roleName);

        // Store refresh token in DB
        // Calculate expiry date for DB (7 days from now usually, but let's just use Date object)
        // Parsing "7d" to date is annoying, so we'll just set it to 7 days from now manually for the DB record
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: expiresAt,
            },
        });

        res.json({
            message: 'Login successful',
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                role: roleName
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const refreshToken = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token is required' });
        }

        // Verify token signature
        let decoded: any;
        try {
            decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!);
        } catch (err) {
            return res.status(401).json({ error: 'Invalid refresh token' });
        }

        // Check if it exists in DB and is valid
        const storedToken = await prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true }
        });

        if (!storedToken) {
            return res.status(401).json({ error: 'Refresh token not found' });
        }

        if (storedToken.revoked) {
            // Token reuse detection could happen here - revoke all user tokens?
            return res.status(401).json({ error: 'Refresh token has been revoked' });
        }

        if (new Date() > storedToken.expiresAt) {
            return res.status(401).json({ error: 'Refresh token expired' });
        }

        // Revoke the used refresh token (Rotation)
        await prisma.refreshToken.update({
            where: { id: storedToken.id },
            data: { revoked: true }
        });

        // Generate new pair
        // Re-fetch roles to be safe
        const userWithRoles = await prisma.user.findUnique({
            where: { id: storedToken.userId },
            include: { roles: { include: { role: true } } }
        });
        const roleName = userWithRoles?.roles[0]?.role?.name || 'USER';

        const tokens = generateTokens(storedToken.userId, roleName);

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        // Save new refresh token
        await prisma.refreshToken.create({
            data: {
                token: tokens.refreshToken,
                userId: storedToken.userId,
                expiresAt: expiresAt
            }
        });

        res.json({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        });

    } catch (error) {
        console.error('Refresh Token Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const logout = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;

        if (refreshToken) {
            // We can either delete it or mark it revoked. Let's delete it or mark revoked.
            // The schema has `revoked` boolean. Let's mark it.
            // Actually, if we want to "logout", we should probably ensure it can't be used again.
            // If we just revoke, it's good.
            // We could also delete it to save space.
            // Let's revoke.
            const storedToken = await prisma.refreshToken.findUnique({
                where: { token: refreshToken }
            });

            if (storedToken) {
                await prisma.refreshToken.update({
                    where: { id: storedToken.id },
                    data: { revoked: true }
                });
            }
        }

        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
