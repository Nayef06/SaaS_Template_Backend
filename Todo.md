# SaaS Backend Todo

## PART 1 – Project & Environment
[✓] Initialize git repository  
[✓] Initialize Node.js project  
[✓] Set up TypeScript  
[✓] Create Express app  
[✓] Add health check endpoint  
[✓] Add environment variable support  

## PART 2 – Postgres & Data Layer w/ RLS
[✓] Set up Postgres locally  
[✓] Choose DB access layer  
[✓] Configure DB connection  
[✓] Create users table  
[✓] Create roles table  
[✓] Create user_roles table  
[✓] Create refresh_tokens table  

## PART 3 – Auth Core (JWT + bcrypt)
[✓] User registration endpoint  
[✓] Password hashing  
[✓] User login endpoint  
[✓] JWT access token generation  
[✓] JWT refresh token generation  
[✓] Store refresh tokens in DB  
[✓] Token refresh endpoint  
[✓] Logout endpoint  

## PART 4 – Auth Middleware & Security
[✓] JWT verification middleware  
[✓] Protected route example  
[✓] Token expiration handling  
[✓] Password validation rules  
[✓] Basic rate limiting  

## PART 5 – RBAC
[✓] Define roles enum  
[✓] Define permissions mapping  
[✓] Role assignment logic  
[✓] RBAC middleware  
[✓] Protect routes by role  
[✓] Admin-only route  

## PART 6 – Redis Integration
[✓] Set up Redis  
[✓] Connect Redis client  
[✓] Cache example read  
[✓] Cache invalidation  
[✓] Use Redis for refresh tokens or sessions  

## PART 7 – Stripe Setup
[ ] Create Stripe account  
[ ] Configure Stripe SDK  
[ ] Create products  
[ ] Create prices  
[ ] Create checkout session endpoint  
[ ] Store subscription metadata  

## PART 8 – Stripe Webhooks
[ ] Webhook endpoint  
[ ] Signature verification  
[ ] Handle subscription created  
[ ] Handle subscription updated  
[ ] Handle subscription canceled  
[ ] Sync subscription to DB  

## PART 9 – SaaS Access Control
[ ] Create subscriptions table  
[ ] Link users to subscriptions  
[ ] Feature gating middleware  
[ ] Block access for inactive subscriptions  

## PART 10 – Logging & Error Handling
[ ] Winston logger setup  
[ ] Request logging  
[ ] Error logging  
[ ] Global error handler  
[ ] Standard error response format  

## PART 11 – API Hardening
[ ] Input validation layer  
[ ] Sanitize request data  
[ ] Centralized response helpers  
[ ] CORS configuration  
[ ] Security headers  

## PART 12 – Developer Experience
[ ] Seed data scripts  
[ ] Test users & roles  
[ ] Stripe test mode flow  
[ ] API client collection  

## PART 13 – Testing
[ ] Test setup  
[ ] Authentication tests  
[ ] RBAC tests  
[ ] Stripe webhook tests  
[ ] Redis-related tests  

## PART 14 – Production Readiness
[ ] Environment validation  
[ ] Graceful shutdown  
[ ] Dockerfile  
[ ] Docker Compose (Postgres, Redis)  
[ ] README documentation  
[ ] Final cleanup  
