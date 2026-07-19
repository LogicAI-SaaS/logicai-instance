# 🐳 Docker Hub Publication - Instructions

## ✅ GitHub Actions Workflow configuré

Le workflow `.github/workflows/docker-publish.yml` est maintenant en place.

## 🔄 Mise à jour du repo

Le repo a été renommé de **LogicAI-N8N** → **LogicAI-Docker**

Nouveau URL: https://github.com/BouBouw/LogicAI-Docker

## 📦 Publication automatique sur Docker Hub

### Comment ça marche

À chaque push sur `main`, GitHub Actions:
1. Build l'image Docker `logicai`
2. Push sur Docker Hub: `bouboom/logicai:latest`
3. Crée des tags par version (ex: `v1.0.0` → `bouboom/logicai:1.0.0`)
4. Support multi-architecture (amd64, arm64)

### Configuration requise

1. **Créer un Docker Hub account** (si ce n'est pas déjà fait)
   - https://hub.docker.com/

2. **Créer un Access Token**:
   - Docker Hub → Account Settings → Security → New Access Token
   - Cocher "Read, Write, Delete"

3. **Ajouter le secret dans GitHub**:
   - Aller sur: https://github.com/BouBouw/LogicAI-Docker/settings/secrets/actions
   - Cliquer "New repository secret"
   - Name: `DOCKERHUB_TOKEN`
   - Value: (votre token Docker Hub)

4. **Vérifier le username** dans `.github/workflows/docker-publish.yml`:
   ```yaml
   env:
     DOCKERHUB_USERNAME: bouboom  # ← Changez si nécessaire
   ```

## 🚀 Utilisation pour les utilisateurs

### Installation en une commande :

```bash
docker pull bouboom/logicai:latest
```

### Lancer une instance :

```bash
docker run -d \
  --name logicai-instance \
  -p 5678:3000 \
  -e INSTANCE_ID=test123 \
  bouboom/logicai:latest
```

### Avec volumes persistants :

```bash
docker run -d \
  --name logicai-instance \
  -p 5678:3000 \
  -e INSTANCE_ID=test123 \
  -v logicai-data:/app/data \
  bouboom/logicai:latest
```

### Avec docker-compose :

```yaml
version: '3.8'

services:
  logicai:
    image: bouboom/logicai:latest
    container_name: logicai-instance
    ports:
      - "5678:3000"
    environment:
      - INSTANCE_ID=test123
      - NODE_ENV=production
    volumes:
      - logicai-data:/app/data
    restart: unless-stopped

volumes:
  logicai-data:
```

## 🏷️ Tags disponibles

Une fois publié, vous aurez:
- `bouboom/logicai:latest` - Dernière version stable
- `bouboom/logicai:1.0.0` - Version spécifique
- `bouboom/logicai:1.0` - Version mineure
- `bouboom/logicai:1` - Version majeure

## 🔨 Build manuel local

Si vous voulez builder localement:

```bash
# Builder l'image
docker build -t logicai:local .

# Lancer
docker run -d -p 5678:3000 logicai:local
```

## ⚠️ Supprimer la branche deploy (manuelle)

La branche `deploy` est encore la branche par défaut sur GitHub.

**Pour la supprimer manuellement:**

1. Aller sur: https://github.com/BouBouw/LogicAI-Docker/settings/branches
2. Dans "Default branch", changer `deploy` → `main`
3. Cliquer "Update" et confirmer
4. Aller sur: https://github.com/BouBouw/LogicAI-Docker/branches
5. Trouver `deploy` et cliquer la corbeille 🗑️

**Ou via Git après changement:**

```bash
git push origin --delete deploy
```

## 📊 Statistiques du build

- **Platforms**: linux/amd64, linux/arm64
- **Taille estimée**: ~500-800 MB compressée
- **Build time**: ~5-10 minutes sur GitHub Actions
- **Cache**: Oui (GitHub Actions cache)

## 🎯 Workflow déclencheurs

Le workflow se lance automatiquement sur:
- ✅ Push sur `main`
- ✅ Tag de version (ex: `v1.0.0`)
- ✅ Pull Request sur `main` (build seulement, pas de push)

## 📝 Versions sémantiques

Pour créer une nouvelle version:

```bash
# Taguer la version
git tag v1.0.0

# Pusher le tag
git push origin v1.0.0
```

GitHub Actions va créer:
- `bouboom/logicai:1.0.0`
- `bouboom/logicai:1.0`
- `bouboom/logicai:1`
- `bouboom/logicai:latest`

---

**LogicAI Docker** - Automated builds 🚀

Repo: https://github.com/BouBouw/LogicAI-Docker
Docker Hub: https://hub.docker.com/r/bouboom/logicai
