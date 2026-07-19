# LogicAI - Instance Docker

Instance LogicAI avec nodes personnalisés et fonctionnalités avancées.

## 🚀 Installation Ultra-Rapide

### Option 1: Docker Hub (Recommandé)

```bash
docker run -d --name logicai -p 5678:3000 bouboom/logicai:latest
```

C'est tout ! Ouvrez: http://localhost:5678

### Option 2: Build local

```bash
git clone https://github.com/BouBouw/LogicAI-Docker.git
cd LogicAI-Docker
docker build -t logicai:local .
docker run -d --name logicai -p 5678:3000 logicai:local
```

### Option 3: Docker Compose

```bash
git clone https://github.com/BouBouw/LogicAI-Docker.git
cd LogicAI-Docker
docker-compose up -d
```

---

## 📋 Fonctionnalités

### Nodes Personnalisés

- **AI/LLM**: OpenAI, Anthropic, Gemini, Ollama, OpenRouter
- **Automatisation**: HTTP Request, Rate Limiter Bypass, No-Code Browser
- **Data**: MySQL, SQLite, Firebase, S3
- **Social**: Twitch, YouTube, Snapchat, Kick
- **Utilitaires**: Text Formatter, UUID, Date, Loop, If conditions

### Fonctionnalités LogicAI

- ✅ Système d'authentification JWT
- ✅ Collaboration en temps réel (WebSocket)
- ✅ Gestion d'instances multiples (local + cloud)
- ✅ Base de données locale intégrée
- ✅ Système de formulaires
- ✅ Support multilingue (20+ langues)

---

## 🐳 Gestion Docker

### Images disponibles

- `bouboom/logicai:latest` - Dernière version stable
- `bouboom/logicai:1.0.0` - Version spécifique

### Commandes de base

```bash
# Lancer une instance
docker run -d --name logicai -p 5678:3000 bouboom/logicai:latest

# Avec volumes persistants
docker run -d --name logicai -p 5678:3000 -v logicai-data:/app/data bouboom/logicai:latest

# Voir les logs
docker logs -f logicai

# Arrêter
docker stop logicai

# Démarrer
docker start logicai

# Supprimer
docker stop logicai && docker rm logicai
```

### Docker Compose

```bash
# Démarrer
docker-compose up -d

# Arrêter
docker-compose down

# Logs
docker-compose logs -f

# Rebuild
docker-compose up -d --build
```

---

## 🔧 Configuration

### Variables d'environnement

```bash
docker run -d \
  --name logicai \
  -p 5678:3000 \
  -e INSTANCE_ID=mon-instance \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  bouboom/logicai:latest
```

### Configuration avancée

Voir [DOCKER_HUB_SETUP.md](./DOCKER_HUB_SETUP.md) pour:
- Publication automatique sur Docker Hub
- Multi-architecture (amd64, arm64)
- Versions sémantiques
- GitHub Actions

---

## 📚 Documentation

- **Quick Start**: [QUICK_START_DOCKER.md](./QUICK_START_DOCKER.md)
- **Docker Hub Setup**: [DOCKER_HUB_SETUP.md](./DOCKER_HUB_SETUP.md)
- **Docker Hub**: https://hub.docker.com/r/bouboom/logicai
- **GitHub**: https://github.com/BouBouw/LogicAI-Docker

---

## 🤝 Contribution

Contributions welcome! Fork le projet et submit une PR.

## 📄 Licence

MIT License

---

**LogicAI** - Automation Platform for Everyone 🚀
