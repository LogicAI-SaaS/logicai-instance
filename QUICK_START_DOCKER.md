# 🚀 LogicAI - Quick Start avec Docker

Installation rapide de LogicAI en une seule commande Docker !

## 📦 Installation en une commande

```bash
docker run -d \
  --name logicai \
  -p 5678:3000 \
  bouboom/logicai:latest
```

C'est tout ! Attendez quelques secondes et ouvrez: http://localhost:5678

---

## 🎯 Scénarios d'utilisation

### 1. Instance simple (test)

```bash
docker run -d --name logicai -p 5678:3000 bouboom/logicai:latest
```

### 2. Instance avec données persistantes

```bash
docker run -d \
  --name logicai \
  -p 5678:3000 \
  -v logicai-data:/app/data \
  bouboom/logicai:latest
```

### 3. Instance avec identifiant custom

```bash
docker run -d \
  --name logicai \
  -p 5678:3000 \
  -e INSTANCE_ID=mon-instance \
  bouboom/logicai:latest
```

### 4. Instance avec base de données externe

```bash
docker run -d \
  --name logicai \
  -p 5678:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  bouboom/logicai:latest
```

### 5. Plusieurs instances sur le même serveur

```bash
# Instance 1
docker run -d --name logicai-1 -p 5678:3000 bouboom/logicai:latest

# Instance 2
docker run -d --name logicai-2 -p 5679:3000 bouboom/logicai:latest

# Instance 3
docker run -d --name logicai-3 -p 5680:3000 bouboom/logicai:latest
```

---

## 🐳 Avec Docker Compose

Créez un fichier `docker-compose.yml`:

```yaml
version: '3.8'

services:
  logicai:
    image: bouboom/logicai:latest
    container_name: logicai
    ports:
      - "5678:3000"
    volumes:
      - logicai-data:/app/data
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - INSTANCE_ID=logicai-main

volumes:
  logicai-data:
```

Lancez:

```bash
docker-compose up -d
```

---

## 🔧 Gestion des conteneurs

### Voir les logs

```bash
docker logs -f logicai
```

### Arrêter l'instance

```bash
docker stop logicai
```

### Démarrer l'instance

```bash
docker start logicai
```

### Redémarrer

```bash
docker restart logicai
```

### Supprimer l'instance

```bash
docker stop logicai
docker rm logicai
```

### Supprimer les données

```bash
docker volume rm logicai-data
```

---

## 📊 Monitoring

### Vérifier l'état

```bash
docker ps | grep logicai
```

### Voir les ressources utilisées

```bash
docker stats logicai
```

### Entrer dans le conteneur

```bash
docker exec -it logicai sh
```

---

## 🌐 Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `PORT` | Port de l'application | 3000 |
| `NODE_ENV` | Environment | production |
| `INSTANCE_ID` | Identifiant unique | auto |
| `DATABASE_URL` | Base de données externe | file:/app/data/instance.db |
| `GLOBAL_API_URL` | URL API LogicAI | https://api.logicai.fr |

---

## 🆕 Mise à jour

### Mettre à jour vers la dernière version

```bash
docker pull bouboom/logicai:latest
docker stop logicai
docker rm logicai
docker run -d --name logicai -p 5678:3000 bouboom/logicai:latest
```

### Avec volumes (données préservées)

```bash
docker pull bouboom/logicai:latest
docker stop logicai
docker rm logicai
docker run -d \
  --name logicai \
  -p 5678:3000 \
  -v logicai-data:/app/data \
  bouboom/logicai:latest
```

---

## 🌍 Multi-architecture

L'image supporte:
- ✅ **linux/amd64** (Intel/AMD)
- ✅ **linux/arm64** (ARM64, Apple Silicon M1/M2/M3)

Docker télécharge automatiquement la bonne architecture pour votre système.

---

## 📱 Accès après installation

Une fois lancé, accédez à:

- **Application**: http://localhost:5678
- **API**: http://localhost:5678/api
- **Health check**: http://localhost:5678/api/health

---

## 🐛 Dépannage

### Port déjà utilisé

```bash
# Changer le port
docker run -d --name logicai -p 5679:3000 bouboom/logicai:latest
```

### Le conteneur ne démarre pas

```bash
# Voir les logs
docker logs logicai

# Vérifier l'état
docker inspect logicai
```

### Accès refusé

```bash
# Vérifier les permissions
docker ps -a | grep logicai
```

---

## 📚 Documentation complète

- **Repo GitHub**: https://github.com/BouBouw/LogicAI-Docker
- **Docker Hub**: https://hub.docker.com/r/bouboom/logicai
- **Documentation**: https://github.com/BouBouw/LogicAI-Docker#readme

---

## 🎉 C'est parti !

En une seule commande, vous avez LogicAI opérationnel !

```bash
docker run -d --name logicai -p 5678:3000 bouboom/logicai:latest
```

**LogicAI** - Automation Platform for Everyone 🚀
