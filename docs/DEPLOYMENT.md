# Deployment Guide

Complete guide for deploying One Job to production environments.

## 🎯 Deployment Options

### 1. Docker Deployment (Recommended)
Simple containerized deployment with Docker Compose.

### 2. Traditional Server Deployment
Deploy to VPS/dedicated server with manual setup.

### 3. Cloud Platform Deployment
Deploy to Heroku, Railway, Vercel, or similar platforms.

### 4. Self-Hosted Development
Local deployment for development/testing.

---

## 🐳 Docker Deployment

### Prerequisites
- Docker Engine 20.0+
- Docker Compose 2.0+
- Domain name (optional, but recommended)

### 1. Prepare Environment

#### Create Production Environment File
```bash
# Create production environment
cp backend/.env.example backend/.env.prod

# Edit with production values
nano backend/.env.prod
```

#### Sample Production Environment
```bash
# Database (PostgreSQL)
DATABASE_URL=postgresql://username:password@db:5432/onejob_prod

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
ENVIRONMENT=production

# Security
SECRET_KEY=your-super-secret-key-here
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Optional: External Integrations
LINEAR_API_KEY=your_linear_api_key
JIRA_API_KEY=your_jira_api_key

# Optional: Monitoring
SENTRY_DSN=your_sentry_dsn
```

### 2. Create Docker Configuration

#### Create Dockerfile for Backend
```dockerfile
# backend/Dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Create Dockerfile for Frontend
```dockerfile
# Dockerfile.frontend
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Create nginx.conf
```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Logging
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;
    error_log   /var/log/nginx/error.log;

    # Performance
    sendfile        on;
    tcp_nopush      on;
    tcp_nodelay     on;
    keepalive_timeout  65;
    types_hash_max_size 2048;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Frontend routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # API proxy
        location /api/ {
            proxy_pass http://backend:8000/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### 3. Create Docker Compose Configuration

#### docker-compose.prod.yml
```yaml
version: '3.8'

services:
  # PostgreSQL Database
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: onejob_prod
      POSTGRES_USER: onejob_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U onejob_user -d onejob_prod"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped
    networks:
      - onejob_network

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      - DATABASE_URL=postgresql://onejob_user:${DB_PASSWORD}@db:5432/onejob_prod
      - ENVIRONMENT=production
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped
    networks:
      - onejob_network

  # Frontend + Nginx
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      backend:
        condition: service_healthy
    volumes:
      - ./ssl:/etc/nginx/ssl:ro  # For SSL certificates
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped
    networks:
      - onejob_network

  # Redis (for future caching)
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped
    networks:
      - onejob_network

volumes:
  postgres_data:
  redis_data:

networks:
  onejob_network:
    driver: bridge
```

### 4. Deploy

#### Environment Setup
```bash
# Create environment file
echo "DB_PASSWORD=your_secure_database_password" > .env

# Create SSL directory (if using HTTPS)
mkdir -p ssl
```

#### Deploy Application
```bash
# Build and start services
docker-compose -f docker-compose.prod.yml up -d --build

# Check deployment status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

#### Database Migration
```bash
# Run initial database setup
docker-compose -f docker-compose.prod.yml exec backend python -c "
from main import Base, engine
Base.metadata.create_all(bind=engine)
print('Database initialized successfully')
"
```

---

## 🖥️ Traditional Server Deployment

### Prerequisites
- Ubuntu 20.04+ or CentOS 8+
- Root or sudo access
- Domain name pointed to server IP

### 1. Server Setup

#### Update System
```bash
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y python3 python3-pip python3-venv nginx postgresql postgresql-contrib nodejs npm git curl
```

#### Setup PostgreSQL
```bash
# Switch to postgres user
sudo -u postgres psql

-- Create database and user
CREATE DATABASE onejob_prod;
CREATE USER onejob_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE onejob_prod TO onejob_user;
\q

# Configure PostgreSQL
sudo nano /etc/postgresql/*/main/postgresql.conf
# Uncomment and set: listen_addresses = 'localhost'

sudo systemctl restart postgresql
```

### 2. Application Deployment

#### Clone and Setup Application
```bash
# Create application user
sudo useradd -m -s /bin/bash onejob
sudo su - onejob

# Clone repository
git clone https://github.com/yourusername/one-job.git
cd one-job

# Setup Python environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Setup Node.js environment
npm install
npm run build
```

#### Configure Environment
```bash
# Create production environment file
cp backend/.env.example backend/.env

# Edit with production values
nano backend/.env
```

```bash
# Production environment
DATABASE_URL=postgresql://onejob_user:secure_password@localhost:5432/onejob_prod
API_HOST=127.0.0.1
API_PORT=8000
ENVIRONMENT=production
SECRET_KEY=your-super-secret-production-key
```

### 3. Process Management with Systemd

#### Create Backend Service
```bash
sudo nano /etc/systemd/system/onejob-backend.service
```

```ini
[Unit]
Description=One Job Backend API
After=network.target postgresql.service

[Service]
Type=exec
User=onejob
Group=onejob
WorkingDirectory=/home/onejob/one-job/backend
Environment=PATH=/home/onejob/one-job/venv/bin
ExecStart=/home/onejob/one-job/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

#### Start and Enable Services
```bash
# Reload systemd and start backend
sudo systemctl daemon-reload
sudo systemctl enable onejob-backend
sudo systemctl start onejob-backend

# Check status
sudo systemctl status onejob-backend
```

### 4. Nginx Configuration

#### Create Nginx Config
```bash
sudo nano /etc/nginx/sites-available/onejob
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend files
    root /home/onejob/one-job/dist;
    index index.html;

    # Frontend routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

#### Enable Site
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/onejob /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 5. SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## ☁️ Cloud Platform Deployment

### Heroku Deployment

#### 1. Prepare Application
```bash
# Create Procfile
echo "web: uvicorn main:app --host=0.0.0.0 --port=\$PORT" > backend/Procfile

# Create runtime.txt
echo "python-3.9.7" > backend/runtime.txt

# Update requirements.txt to include gunicorn
echo "gunicorn==20.1.0" >> backend/requirements.txt
```

#### 2. Deploy to Heroku
```bash
# Install Heroku CLI and login
heroku login

# Create application
heroku create your-app-name

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set ENVIRONMENT=production
heroku config:set SECRET_KEY=your-secret-key

# Deploy
git add .
git commit -m "Prepare for Heroku deployment"
git push heroku main

# Initialize database
heroku run python -c "from main import Base, engine; Base.metadata.create_all(bind=engine)"
```

### Railway Deployment

#### 1. Prepare railway.json
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn main:app --host 0.0.0.0 --port $PORT",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300
  }
}
```

#### 2. Deploy
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Vercel Deployment (Frontend Only)

#### 1. Configure vercel.json
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://your-backend-api.herokuapp.com/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

#### 2. Deploy
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

---

## 🔧 Configuration Management

### Environment Variables

#### Required Variables
```bash
# Database
DATABASE_URL=postgresql://user:pass@host:port/dbname

# API Configuration  
API_HOST=0.0.0.0
API_PORT=8000
ENVIRONMENT=production

# Security
SECRET_KEY=your-super-secret-key
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
```

#### Optional Variables
```bash
# External Integrations
LINEAR_API_KEY=your_linear_api_key
JIRA_API_KEY=your_jira_api_key

# Monitoring
SENTRY_DSN=your_sentry_dsn
LOG_LEVEL=INFO

# Caching
REDIS_URL=redis://localhost:6379/0

# Email (future feature)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

### Security Configuration

#### Backend Security Headers
```python
# Add to main.py
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

# Trust only specific hosts in production
if os.getenv("ENVIRONMENT") == "production":
    app.add_middleware(
        TrustedHostMiddleware, 
        allowed_hosts=os.getenv("ALLOWED_HOSTS", "").split(",")
    )

# Configure CORS for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
```

#### Database Security
```bash
# PostgreSQL security settings
# In postgresql.conf:
ssl = on
shared_preload_libraries = 'pg_stat_statements'

# In pg_hba.conf:
hostssl all onejob_user 0.0.0.0/0 md5
```

---

## 📊 Monitoring & Observability

### Health Checks

#### Backend Health Endpoint
```python
# Add to main.py
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

@app.get("/health/db")
async def database_health(db: Session = Depends(get_db)):
    try:
        db.execute("SELECT 1")
        return {"database": "healthy"}
    except Exception as e:
        raise HTTPException(500, f"Database unhealthy: {e}")
```

### Logging Configuration

#### Production Logging
```python
# Add to main.py
import logging
from pythonjsonlogger import jsonlogger

# Configure structured logging
logHandler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter()
logHandler.setFormatter(formatter)
logger = logging.getLogger()
logger.addHandler(logHandler)
logger.setLevel(logging.INFO)
```

### Error Tracking with Sentry

#### Install and Configure
```bash
# Add to requirements.txt
sentry-sdk[fastapi]==1.15.0
```

```python
# Add to main.py
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration

sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN"),
    integrations=[
        FastApiIntegration(auto_enabling=True),
        SqlalchemyIntegration(),
    ],
    environment=os.getenv("ENVIRONMENT", "production"),
    traces_sample_rate=1.0,
)
```

---

## 🔄 Backup & Recovery

### Database Backups

#### Automated PostgreSQL Backups
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="onejob_prod"

# Create backup
pg_dump -h localhost -U onejob_user -d $DB_NAME > $BACKUP_DIR/onejob_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "onejob_*.sql" -mtime +7 -delete

echo "Backup completed: onejob_$DATE.sql"
```

#### Setup Backup Cron Job
```bash
# Add to crontab
0 2 * * * /home/onejob/backup.sh >> /var/log/onejob_backup.log 2>&1
```

### Application Backups

#### Docker Volume Backups
```bash
# Backup PostgreSQL data
docker run --rm -v onejob_postgres_data:/data -v $(pwd):/backup ubuntu tar czf /backup/postgres_backup.tar.gz /data

# Backup Redis data  
docker run --rm -v onejob_redis_data:/data -v $(pwd):/backup ubuntu tar czf /backup/redis_backup.tar.gz /data
```

### Recovery Procedures

#### Database Recovery
```bash
# Stop application
sudo systemctl stop onejob-backend

# Restore database
psql -h localhost -U onejob_user -d onejob_prod < /backups/onejob_20231201_020000.sql

# Start application
sudo systemctl start onejob-backend
```

---

## 🚀 Scaling Considerations

### Horizontal Scaling

#### Load Balancer Configuration
```nginx
upstream onejob_backend {
    server 127.0.0.1:8000;
    server 127.0.0.1:8001;
    server 127.0.0.1:8002;
}

server {
    listen 80;
    
    location /api/ {
        proxy_pass http://onejob_backend/;
        # ... other proxy settings
    }
}
```

#### Multiple Backend Instances
```bash
# Create multiple systemd services
sudo cp /etc/systemd/system/onejob-backend.service /etc/systemd/system/onejob-backend-2.service
sudo nano /etc/systemd/system/onejob-backend-2.service
# Change port to 8001

sudo systemctl enable onejob-backend-2
sudo systemctl start onejob-backend-2
```

### Database Scaling

#### Read Replicas
```python
# Multiple database connections
class DatabaseConfig:
    WRITE_DB_URL = "postgresql://user:pass@primary-db:5432/onejob"
    READ_DB_URL = "postgresql://user:pass@replica-db:5432/onejob"

# Use read replica for queries
@app.get("/tasks")
async def get_tasks(db: Session = Depends(get_read_db)):
    return db.query(DBTask).all()
```

#### Connection Pooling
```python
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,
    max_overflow=30,
    pool_pre_ping=True
)
```

---

## 🛠️ Maintenance

### Regular Maintenance Tasks

#### Weekly Tasks
```bash
#!/bin/bash
# weekly_maintenance.sh

# Update system packages
sudo apt update && sudo apt upgrade -y

# Restart services
sudo systemctl restart onejob-backend
sudo systemctl restart nginx

# Clean up logs
sudo journalctl --vacuum-time=7d

# Database maintenance
sudo -u postgres psql -d onejob_prod -c "VACUUM ANALYZE;"
```

#### Monthly Tasks
```bash
# Certificate renewal check
sudo certbot renew --dry-run

# Security updates
sudo apt list --upgradable | grep -i security

# Database statistics update
sudo -u postgres psql -d onejob_prod -c "ANALYZE;"
```

### Performance Monitoring

#### System Metrics
```bash
# Monitor system resources
htop
iostat 1
free -h
df -h

# Monitor application
sudo systemctl status onejob-backend
sudo journalctl -u onejob-backend -f
```

#### Database Performance
```sql
-- Monitor slow queries
SELECT query, mean_time, calls, total_time 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Monitor connections
SELECT * FROM pg_stat_activity WHERE datname = 'onejob_prod';
```

---

This deployment guide covers all major deployment scenarios from development to enterprise production environments. Choose the option that best fits your infrastructure requirements and technical expertise.

For additional help with deployment, consult the [Architecture Guide](ARCHITECTURE.md) and [Developer Guide](DEVELOPMENT.md) for technical details.