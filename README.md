# 📦 Capstone Project

A full-stack JavaScript web application built with **Node.js** and modern frontend libraries, containerized with **Docker** for deployment.  
This project serves as a capstone demonstration, showcasing API integration, user interface design, and scalable deployment.

---

## ✨ Features
- **Full-stack JavaScript** – modern JavaScript frontend.
- **REST API Integration** – Connects to backend services for dynamic data.
- **Responsive UI** – Built with Bootstrap and modern CSS.
- **Dockerized Deployment** – One-step build and deploy.
- **Package Management** – Managed via npm with `package.json`.
- **Environment Configurable** – Uses `.env` for environment-specific settings.

---

## 🛠 Tech Stack
| Layer       | Technology |
|-------------|------------|
| Frontend    | HTML, CSS, JavaScript, Bootstrap |
| Package Mgr | npm |
| Deployment  | Docker |
| Versioning  | Git |

---

## 📂 Project Structure
```
capstone_project/
│── Dockerfile              # Docker build configuration
│── package.json            # npm dependencies & scripts
│── package-lock.json       # Locked dependency versions
│── src/                    # Application source code 
│── public/                  # Frontend static assets
│── .gitignore              # Git ignore rules
│── README.md               # Project documentation
```

---

## 🚀 Getting Started

### 1️⃣ Prerequisites
- [Node.js 18+](https://nodejs.org/en/)
- [npm](https://www.npmjs.com/)
- [Docker](https://www.docker.com/)

---

### 2️⃣ Local Development
```bash
# Install dependencies
npm install

# Start development server
npm start
```
The app will be available at:
```
http://localhost:3000
```

---

### 3️⃣ Docker Deployment

#### Build Image
```bash
docker build -t capstone_project:latest .
```

#### Run Container
```bash
docker run -d -p 3000:3000 capstone_project:latest
```
The application will be running at `http://localhost:3000`.

---

## 📜 Available npm Scripts
In `package.json`:
- `npm start` – Start the application
- `npm run build` – Build for production
- `npm test` – Run tests

---

