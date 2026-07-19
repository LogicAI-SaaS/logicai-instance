# LogicAI — Instance (open-source)

Instance **LogicAI** auto-hébergeable : un moteur de workflows/automatisation avec
nodes personnalisés, qui tourne **~90 % en local chez vous**, lancé via **Docker**.

La liaison avec l'API [LogicAI](https://github.com/LogicAI-SaaS) est **optionnelle** :
sans elle, l'instance fonctionne de manière totalement autonome ; avec elle, vous
débloquez les fonctionnalités cloud (auto-login SSO, gestion multi-instances,
partage/collaboration) depuis la plateforme LogicAI.

> 🔓 Ce dépôt est **open-source (MIT)**. Clonez, buildez et lancez librement.

---

## 🚀 Installation ultra-rapide

### Option 1 — Docker Hub (recommandé)

```bash
docker run -d --name logicai -p 5678:3000 logicai/logicai:latest
```

C'est tout ! Ouvrez : http://localhost:5678

### Option 2 — Build local depuis les sources

```bash
git clone https://github.com/LogicAI-SaaS/logicai-instance.git
cd logicai-instance
docker build -t logicai:local .
docker run -d --name logicai -p 5678:3000 logicai:local
```

### Option 3 — Docker Compose

```bash
git clone https://github.com/LogicAI-SaaS/logicai-instance.git
cd logicai-instance
docker compose up -d
```

---

## 📋 Fonctionnalités

### Nodes personnalisés

- **IA / LLM** : OpenAI, Anthropic, Gemini, Ollama, OpenRouter
- **Automatisation** : HTTP Request, navigateur no-code, triggers (webhook, cron…)
- **Data** : PostgreSQL, MySQL, SQLite, Redis, MongoDB, S3
- **Intégrations** : Slack, Discord, Telegram, GitHub, Notion, Stripe, Google…
- **Utilitaires** : formatage de texte, UUID, dates, boucles, conditions, merge

### Cœur LogicAI

- ✅ Authentification JWT
- ✅ Collaboration temps réel (WebSocket)
- ✅ Base de données locale intégrée
- ✅ Système de formulaires & webhooks
- ✅ Support multilingue

---

## 🔗 Liaison avec l'API LogicAI (optionnelle)

Quand l'instance est provisionnée par la plateforme LogicAI, celle-ci injecte un
**secret JWT propre à l'instance** (`JWT_SECRET`) permettant l'auto-login SSO et la
gestion à distance. En usage 100 % local, laissez la valeur par défaut ou définissez
la vôtre — aucune connexion externe n'est requise.

```bash
docker run -d --name logicai -p 5678:3000 \
  -e JWT_SECRET="votre-secret-unique" \
  -e INSTANCE_ID="mon-instance" \
  logicai/logicai:latest
```

---

## 🐳 Gestion Docker

### Images disponibles

- `logicai/logicai:latest` — dernière version stable
- `logicai/logicai:1.0.0` — version spécifique

### Commandes de base

```bash
# Lancer avec un volume persistant (recommandé)
docker run -d --name logicai -p 5678:3000 -v logicai-data:/app/data logicai/logicai:latest

docker logs -f logicai      # logs
docker stop logicai         # arrêter
docker start logicai        # redémarrer
docker rm -f logicai        # supprimer
```

### Docker Compose

```bash
docker compose up -d        # démarrer
docker compose logs -f      # logs
docker compose down         # arrêter
docker compose up -d --build  # rebuild
```

---

## 🔧 Configuration

| Variable        | Description                                   | Défaut                    |
|-----------------|-----------------------------------------------|---------------------------|
| `PORT`          | Port interne du serveur                       | `3000`                    |
| `JWT_SECRET`    | Secret JWT (injecté par la plateforme si liée)| *(défaut de dév)*         |
| `DATABASE_URL`  | Base de données (SQLite locale par défaut)    | `file:/app/data/instance.db` |
| `INSTANCE_ID`   | Identifiant de l'instance                     | —                         |

Voir aussi :
- [QUICK_START_DOCKER.md](./QUICK_START_DOCKER.md) — démarrage rapide & multi-instances
- [DOCKER_HUB_SETUP.md](./DOCKER_HUB_SETUP.md) — publication d'image, multi-arch, CI

---

## 📚 Liens

- **Docker Hub** : https://hub.docker.com/r/logicai/logicai
- **Dépôt** : https://github.com/LogicAI-SaaS/logicai-instance
- **Organisation LogicAI** : https://github.com/LogicAI-SaaS

---

## 🤝 Contribution

Les contributions sont bienvenues — forkez le projet et proposez une PR.

## 📄 Licence

Distribué sous licence **MIT**. Voir [LICENSE](./LICENSE).

---

**LogicAI** — l'automatisation pour tout le monde 🚀
