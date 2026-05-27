# Documentation de déploiement — Tick & Sass

## Objectif

Ce document décrit la préparation du déploiement de l’application **Tick & Sass**.

L’objectif est de disposer d’un environnement reproductible permettant de lancer l’application avec ses différents services :

- frontend SvelteKit ;
- API GraphQL ;
- PostgreSQL ;
- Redis ;
- Nginx en reverse proxy ;
- Artillery pour les tests de charge.

Le projet a d’abord été validé en local avec Docker Compose, puis avec Docker Swarm.

---

## Architecture générale

L’application est organisée autour de plusieurs services.

```txt
Utilisateur
   ↓
Nginx reverse proxy
   ↓
Frontend SvelteKit
API GraphQL
   ↓
PostgreSQL
Redis
```

Le reverse proxy Nginx sert de point d’entrée.

Routes principales :

```txt
/              → frontend
/api/graphql   → API GraphQL
/health        → vérification de santé de l’API
```

Des schémas sont disponibles dans le dossier `Docs` :

```txt
Docs/architecture.png
Docs/deploiement.png
Docs/ERD.png
```

---

## Prérequis

Pour lancer le projet, il faut avoir :

- Docker ;
- Docker Compose ;
- Git ;
- Node.js et npm si les scripts sont lancés hors Docker.

---

## Variables d’environnement

Les vrais fichiers d’environnement ne doivent pas être versionnés.

À prévoir :

```txt
.env
docker.env
```

Des fichiers d’exemple peuvent être fournis :

```txt
.env.example
docker.env.example
```

Exemple de variables côté API :

```env
NODE_ENV=development
PORT=4005

PGHOST=database
PGPORT=5432
PGUSER=tickandsass
PGPASSWORD=tickandsass
PGDATABASE=tickandsassproject

DATABASE_URL=postgresql://tickandsass:tickandsass@database:5432/tickandsassproject

REDIS_HOST=redis
REDIS_PORT=6379
```

Exemple côté base :

```env
POSTGRES_USER=tickandsass
POSTGRES_PASSWORD=tickandsass
POSTGRES_DB=tickandsassproject
```

---

## Lancement local avec Docker Compose

Depuis la racine du projet :

```bash
docker compose -f compose.yml up --build
```

Pour lancer en arrière-plan :

```bash
docker compose -f compose.yml up -d --build
```

Pour arrêter :

```bash
docker compose -f compose.yml down --remove-orphans
```

---

## Vérification après lancement Compose

Vérifier les services :

```bash
docker compose -f compose.yml ps
```

Tester l’API directement :

```bash
curl -X POST http://localhost:4005/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ health }"}'
```

Tester via Nginx :

```bash
curl http://localhost:8030/health
```

Résultat attendu :

```json
{ "data": { "health": "OK" } }
```

---

## Accès aux services en local

Selon la configuration Docker Compose :

```txt
Frontend via proxy : http://localhost:8030
API GraphQL directe : http://localhost:4005/graphql
Health via proxy : http://localhost:8030/health
Adminer : http://localhost:8080
```

---

## Déploiement local avec Docker Swarm

Le déploiement Swarm permet de se rapprocher d’une logique de mise en production.

Construire les images locales :

```bash
docker build -t tick-and-sass-api:local ./api
docker build -t tick-and-sass-frontend:local ./frontend
```

Vérifier les images :

```bash
docker images | grep tick-and-sass
```

Initialiser Swarm si nécessaire :

```bash
docker swarm init
```

Si Swarm est déjà actif, cette commande n’est pas nécessaire.

Déployer la stack :

```bash
docker stack deploy -c swarm.yml tick-and-sass
```

Vérifier les services :

```bash
docker stack services tick-and-sass
docker stack ps tick-and-sass
```

Résultat attendu :

```txt
tick-and-sass_api        2/2
tick-and-sass_db         1/1
tick-and-sass_frontend   1/1
tick-and-sass_proxy      1/1
tick-and-sass_redis      1/1
```

---

## Vérification après déploiement Swarm

Tester l’API via le proxy :

```bash
curl -X POST http://localhost/api/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ health }"}'
```

Tester la route de santé :

```bash
curl http://localhost/health
```

Résultat attendu :

```json
{ "data": { "health": "OK" } }
```

---

## Points corrigés pendant la validation

Pendant la validation Swarm, l’image `postgres:latest` a posé problème car elle utilisait une version majeure plus récente de PostgreSQL.

Correction appliquée :

```yaml
image: postgres:16-alpine
```

Cette correction permet de figer la version de PostgreSQL et d’éviter les effets de bord liés à l’utilisation de `latest`.

---

## Volumes

La stack utilise des volumes persistants pour conserver les données.

Exemples :

```txt
pg-data      → données PostgreSQL
redis-data   → données Redis
```

---

## Nettoyage de la stack Swarm

Pour supprimer la stack :

```bash
docker stack rm tick-and-sass
```

Pour vérifier :

```bash
docker service ls
```

Si besoin, supprimer un volume de test :

```bash
docker volume ls
docker volume rm <nom_du_volume>
```

À utiliser avec prudence, car cela supprime les données.

---

## Procédure de rollback simple

En cas de problème sur un service Swarm :

```bash
docker service rollback tick-and-sass_api
```

Pour forcer le redémarrage d’un service :

```bash
docker service update --force tick-and-sass_proxy
```

Pour redéployer complètement :

```bash
docker stack rm tick-and-sass
docker stack deploy -c swarm.yml tick-and-sass
```

---

## Déploiement sur serveur

Le projet peut être déployé sur un serveur Linux disposant de Docker.

Étapes prévues :

```bash
ssh student@<serveur>
git clone <url_du_repo>
cd TickAndSass
docker swarm init
docker stack deploy -c swarm.yml tick-and-sass
```

Vérification attendue :

```bash
curl http://<serveur>/health
```

Résultat attendu :

```json
{ "data": { "health": "OK" } }
```

