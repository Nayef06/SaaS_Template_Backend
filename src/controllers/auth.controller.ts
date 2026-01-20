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

import { setCache, getCache, deleteCache } from '../utils/cache';

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

        // Store refresh token in DB (keeping for persistence)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: expiresAt,
            },
        });

        // Store in Redis (primary for validation)
        // Key: refresh_token:<token>, Value: userId, TTL: 7 days (seconds)
        await setCache(`refresh_token:${refreshToken}`, { userId: user.id }, 7 * 24 * 60 * 60);

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

        // Check Redis first
        const cacheData = await getCache<{ userId: string }>(`refresh_token:${refreshToken}`);

        if (cacheData) {
            // Valid in Redis, proceed
            // (We assume if it's in Redis, it's not revoked, as we delete on revoke)
        } else {
            // Not in Redis, check DB (fallback or older session)
            const storedToken = await prisma.refreshToken.findUnique({
                where: { token: refreshToken },
                include: { user: true }
            });

            // If not in DB either, or revoked/expired
            if (!storedToken || storedToken.revoked || new Date() > storedToken.expiresAt) {
                return res.status(401).json({ error: 'Refresh token not found or expired' });
            }

            // If valid in DB but missing in Redis (e.g. server restart), we can continue.
            // Ideally we write back to Redis here but optional.
        }

        // We need userId. If we got it from cache, use it. If from DB, use storedToken.userId.
        // But wait, we need to generate NEW tokens.
        // We also need to revoke the OLD token.

        // Revoke Strategy:
        // 1. Delete old token from Redis
        // 2. Mark old token revoked in DB

        await deleteCache(`refresh_token:${refreshToken}`);

        // Find in DB to revoke (even if we validated via Redis, we sync state)
        const storedToken = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
        if (storedToken) {
            await prisma.refreshToken.update({
                where: { id: storedToken.id },
                data: { revoked: true }
            });
        }

        // Generate new pair
        const userId = decoded.userId || storedToken?.userId;

        const userWithRoles = await prisma.user.findUnique({
            where: { id: userId },
            include: { roles: { include: { role: true } } }
        });
        const roleName = userWithRoles?.roles[0]?.role?.name || 'USER';

        const tokens = generateTokens(userId, roleName);

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        // Save new
        await prisma.refreshToken.create({
            data: {
                token: tokens.refreshToken,
                userId: userId,
                expiresAt: expiresAt
            }
        });

        await setCache(`refresh_token:${tokens.refreshToken}`, { userId: userId }, 7 * 24 * 60 * 60);

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
            // Delete from Redis
            await deleteCache(`refresh_token:${refreshToken}`);

            // Mark revoked in DB
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
