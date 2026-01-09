# SaaS Backend Todo

## PART 1 – Project & Environment
[✓] Initialize git repository  
[✓] Initialize Node.js project  
[✓] Set up TypeScript  
[✓] Create Express app  
[✓] Add health check endpoint  
[✓] Add environment variable support  
[✓] Commit project bootstrap  

## PART 2 – Postgres & Data Layer
[ ] Set up Postgres locally  
[ ] Choose DB access layer  
[ ] Configure DB connection  
[ ] Create migrations system  
[ ] Create users table  
[ ] Create roles table  
[ ] Create user_roles table  
[ ] Create refresh_tokens table  
[ ] Run migrations  
[ ] Commit database setup  

## PART 3 – Auth Core (JWT + bcrypt)
[ ] User registration endpoint  
[ ] Password hashing  
[ ] User login endpoint  
[ ] JWT access token generation  
[ ] JWT refresh token generation  
[ ] Store refresh tokens in DB  
[ ] Token refresh endpoint  
[ ] Logout endpoint  
[ ] Commit authentication core  

## PART 4 – Auth Middleware & Security
[ ] JWT verification middleware  
[ ] Protected route example  
[ ] Token expiration handling  
[ ] Password validation rules  
[ ] Basic rate limiting  
[ ] Commit auth middleware  

## PART 5 – RBAC
[ ] Define roles enum  
[ ] Define permissions mapping  
[ ] Role assignment logic  
[ ] RBAC middleware  
[ ] Protect routes by role  
[ ] Admin-only route  
[ ] Commit RBAC  

## PART 6 – Redis Integration
[ ] Set up Redis  
[ ] Connect Redis client  
[ ] Cache example read  
[ ] Cache invalidation  
[ ] Use Redis for refresh tokens or sessions  
[ ] Commit Redis integration  

## PART 7 – Stripe Setup
[ ] Create Stripe account  
[ ] Configure Stripe SDK  
[ ] Create products  
[ ] Create prices  
[ ] Create checkout session endpoint  
[ ] Store subscription metadata  
[ ] Commit Stripe base  

## PART 8 – Stripe Webhooks
[ ] Webhook endpoint  
[ ] Signature verification  
[ ] Handle subscription created  
[ ] Handle subscription updated  
[ ] Handle subscription canceled  
[ ] Sync subscription to DB  
[ ] Commit Stripe webhooks  

## PART 9 – SaaS Access Control
[ ] Create subscriptions table  
[ ] Link users to subscriptions  
[ ] Feature gating middleware  
[ ] Block access for inactive subscriptions  
[ ] Commit SaaS gating  

## PART 10 – Logging & Error Handling
[ ] Winston logger setup  
[ ] Request logging  
[ ] Error logging  
[ ] Global error handler  
[ ] Standard error response format  
[ ] Commit logging & errors  

## PART 11 – API Hardening
[ ] Input validation layer  
[ ] Sanitize request data  
[ ] Centralized response helpers  
[ ] CORS configuration  
[ ] Security headers  
[ ] Commit API hardening  

## PART 12 – Developer Experience
[ ] Seed data scripts  
[ ] Test users & roles  
[ ] Stripe test mode flow  
[ ] API client collection  
[ ] Commit developer experience improvements  

## PART 13 – Testing
[ ] Test setup  
[ ] Authentication tests  
[ ] RBAC tests  
[ ] Stripe webhook tests  
[ ] Redis-related tests  
[ ] Commit tests  

## PART 14 – Production Readiness
[ ] Environment validation  
[ ] Graceful shutdown  
[ ] Dockerfile  
[ ] Docker Compose (Postgres, Redis)  
[ ] README documentation  
[ ] Final cleanup  
[ ] Commit production readiness  
