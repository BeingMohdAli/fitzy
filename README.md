# 🏋️ Meet FITzy — AI-Powered Fitness Tracker

A full-stack fitness tracking app with microservices architecture, Keycloak auth, RabbitMQ messaging, and Gemini AI recommendations.

---

## 🏗️ Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────────┐
│   Frontend  │────▶│  API Gateway │────▶│   Eureka Server  │
│  (React)    │     │  (Port 8080) │     │   (Port 8761)    │
└─────────────┘     └──────┬───────┘     └──────────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
      ┌──────────────┐ ┌────────────┐ ┌──────────────────────┐
      │ User Service │ │  Activity  │ │ Recommendation Service│
      │  (Port 8081) │ │  Service   │ │    (Port 8083)        │
      └──────────────┘ │(Port 8082) │ └──────────┬───────────┘
                       └─────┬──────┘            │
                             │ RabbitMQ           │ Gemini AI
                             └────────────────────┘

Infrastructure: PostgreSQL + RabbitMQ + Keycloak + Config Server
```

---

## 🚀 Quick Start (Docker)

### 1. Prerequisites
- Docker & Docker Compose installed
- Gemini API Key → https://makersuite.google.com/app/apikey

### 2. Clone & Configure
```bash
git clone <your-repo>
cd fitzy

# Edit .env and add your Gemini API key
nano .env
# Set: GEMINI_API_KEY=your-actual-key-here
```

### 3. Run Everything
```bash
chmod +x scripts/create-databases.sh
docker compose up --build -d
```

### 4. Wait for services to start (~3-5 minutes)
```bash
docker compose logs -f
```

### 5. Access the App
| Service        | URL                              |
|----------------|----------------------------------|
| 🌐 Frontend    | http://localhost                 |
| 🔑 Keycloak    | http://localhost:9090            |
| 🔍 Eureka      | http://localhost:8761            |
| 🐇 RabbitMQ    | http://localhost:15672           |
| ⚙️ Config      | http://localhost:8888            |

---



---

## 🛠️ Local Development (Without Docker)

### Prerequisites
- Java 21
- Maven 3.9+
- Node.js 20+
- PostgreSQL 16
- RabbitMQ 3.13
- Keycloak 24

### 1. Start Infrastructure
```bash
# PostgreSQL - create 3 databases
psql -U postgres
CREATE DATABASE fitzy_users;
CREATE DATABASE fitzy_activities;
CREATE DATABASE fitzy_recommendations;
CREATE USER fitzy WITH PASSWORD 'fitzy123';
GRANT ALL PRIVILEGES ON DATABASE fitzy_users TO fitzy;
GRANT ALL PRIVILEGES ON DATABASE fitzy_activities TO fitzy;
GRANT ALL PRIVILEGES ON DATABASE fitzy_recommendations TO fitzy;

# RabbitMQ - default guest/guest or set fitzy/fitzy123

# Keycloak - import realm
./kc.sh start-dev --import-realm
# Copy keycloak/fitzy-realm.json to keycloak data/import/
```

### 2. Start Services (in order)
```bash
# Terminal 1 - Eureka
cd eureka-server && mvn spring-boot:run

# Terminal 2 - Config Server
cd config-server && mvn spring-boot:run

# Terminal 3 - API Gateway
cd api-gateway && mvn spring-boot:run

# Terminal 4 - User Service
cd user-service && mvn spring-boot:run

# Terminal 5 - Activity Service
cd activity-service && mvn spring-boot:run

# Terminal 6 - Recommendation Service
export GEMINI_API_KEY=your-key-here
cd recommendation-service && mvn spring-boot:run
```

### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:5173
```

---

## ☁️ Deployment

### Deploy to AWS EC2

```bash
# 1. Launch EC2 instance (t3.medium or larger recommended)
# Ubuntu 22.04 LTS, open ports: 22, 80, 8080, 9090, 8761

# 2. Install Docker
sudo apt update
sudo apt install -y docker.io docker-compose-v2
sudo systemctl start docker
sudo usermod -aG docker ubuntu

# 3. Clone & configure
git clone <your-repo>
cd fitzy
echo "GEMINI_API_KEY=your-key" > .env

# 4. Run
docker compose up --build -d
```

### Deploy to Railway / Render
Each service has its own Dockerfile — deploy each as a separate service.
Set environment variables per service as listed in docker-compose.yml.

### Deploy to Kubernetes (K8s)
```bash
# Build and push images
docker build -t yourrepo/fitzy-eureka ./eureka-server
docker build -t yourrepo/fitzy-config ./config-server
docker build -t yourrepo/fitzy-gateway ./api-gateway
docker build -t yourrepo/fitzy-user ./user-service
docker build -t yourrepo/fitzy-activity ./activity-service
docker build -t yourrepo/fitzy-recommendation ./recommendation-service
docker build -t yourrepo/fitzy-frontend ./frontend

# Push to DockerHub / ECR / GCR
docker push yourrepo/fitzy-*
```

---

## 🔑 Environment Variables

| Variable         | Service               | Description                    |
|------------------|-----------------------|--------------------------------|
| GEMINI_API_KEY   | recommendation-service| Your Google Gemini API key     |
| POSTGRES_USER    | postgres              | DB username (fitzy)            |
| POSTGRES_PASSWORD| postgres              | DB password (fitzy123)         |
| RABBITMQ_USER    | rabbitmq              | MQ username (fitzy)            |
| RABBITMQ_PASSWORD| rabbitmq              | MQ password (fitzy123)         |
| KEYCLOAK_ADMIN   | keycloak              | Keycloak admin user            |

---

## 📡 API Endpoints

### User Service (via Gateway: /api/users)
| Method | Endpoint         | Description        |
|--------|------------------|--------------------|
| GET    | /api/users/{id}  | Get user profile   |
| POST   | /api/users/sync  | Sync Keycloak user |

### Activity Service (via Gateway: /api/activities)
| Method | Endpoint              | Description           |
|--------|-----------------------|-----------------------|
| POST   | /api/activities       | Log new activity      |
| GET    | /api/activities       | Get my activities     |
| GET    | /api/activities/{id}  | Get activity by ID    |

### Recommendation Service (via Gateway: /api/recommendations)
| Method | Endpoint                              | Description                    |
|--------|---------------------------------------|--------------------------------|
| GET    | /api/recommendations/user/{userId}    | Get all my AI recommendations  |
| GET    | /api/recommendations/activity/{id}   | Get recommendation for activity|

---

## 🐇 RabbitMQ Message Flow

```
Activity Service  ──[activity.tracked]──▶  fitzy.activity.exchange
                                                     │
                                                     ▼
                                          fitzy.activity.queue
                                                     │
                                                     ▼
                                     Recommendation Service
                                       (calls Gemini AI)
                                       (saves to DB)
```

---

## 🛠️ Troubleshooting

**Services not starting?**
```bash
docker compose logs eureka-server
docker compose logs config-server
```

**Keycloak not loading?**
```bash
docker compose logs keycloak
# Wait ~60s for Keycloak to fully start
```

**Frontend can't connect?**
- Make sure Keycloak is running on port 9090
- Check browser console for CORS errors
- Verify API gateway is up on port 8080

**Gemini AI not working?**
- Check GEMINI_API_KEY in .env
- The app will use fallback recommendations if Gemini is unavailable

---

## 📁 Project Structure

```
fitzy/
├── docker-compose.yml
├── .env
├── scripts/
│   └── create-databases.sh
├── keycloak/
│   └── fitzy-realm.json          ← Pre-configured realm + test users
├── eureka-server/
├── config-server/
│   └── src/main/resources/configs/
│       ├── user-service.yml
│       ├── activity-service.yml
│       └── recommendation-service.yml
├── api-gateway/
├── user-service/
├── activity-service/
├── recommendation-service/
└── frontend/                     ← React + Vite + Keycloak-js
```

👨‍💻 Author
Mohd Ali
Java, Spring Boot Backend Developer | GenAI Enthusiast

🌐 GitHub: https://github.com/BeingMohdAli
💼 Connect me on LinkedIn: https://www.linkedin.com/in/mohd-ali-529684378/
