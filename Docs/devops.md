# Démarche DevOps — Tick & Sass

## Objectif

Ce document décrit la démarche DevOps mise en place autour du projet **Tick & Sass**.

L’objectif est de montrer comment l’application peut être testée, construite, conteneurisée, déployée et vérifiée de manière progressive.

La démarche repose sur :

- Docker pour conteneuriser les services ;
- Docker Compose pour l’environnement local ;
- Docker Swarm pour préparer une mise en production ;
- GitHub Actions pour automatiser les tests, le build et la publication ;
- Nginx comme reverse proxy ;
- Artillery pour les tests de charge ;
- un endpoint `health` pour vérifier l’état de l’API.

---

## Organisation générale

Le projet contient plusieurs parties :

```txt
api/          → API GraphQL
frontend/     → application SvelteKit
nginx/        → configuration reverse proxy
Docs/         → documentation et schémas
tests/load/   → scénarios et rapports Artillery
compose.yml   → lancement local
swarm.yml     → déploiement Swarm
```

---

## Validation locale avant CI/CD

Avant de pousser le projet sur GitHub, j’ai validé les éléments principaux en local.

Tests réalisés :

```bash
docker compose -f compose.yml exec api npm test
docker compose -f compose.yml exec api npm run compile
npm run load:report:docker
```

Résultats validés :

```txt
Tests unitaires API : OK
Compilation TypeScript : OK
Test de charge Artillery : OK
Endpoint health : OK
Docker Compose : OK
Docker Swarm : OK
```

---

## Construction des images Docker

Les images ont été construites localement pour valider le fonctionnement avant publication.

```bash
docker build -t tick-and-sass-api:local ./api
docker build -t tick-and-sass-frontend:local ./frontend
```

Vérification :

```bash
docker images | grep tick-and-sass
```

Images obtenues :

```txt
tick-and-sass-api:local
tick-and-sass-frontend:local
```

---

## Déploiement Swarm local

Le fichier `swarm.yml` permet de déployer l’application avec plusieurs services.

Services déployés :

```txt
api        → API GraphQL répliquée
db         → PostgreSQL
frontend   → application frontend
proxy      → Nginx
redis      → Redis
```

Commande de déploiement :

```bash
docker stack deploy -c swarm.yml tick-and-sass
```

Commande de vérification :

```bash
docker stack services tick-and-sass
```

Résultat attendu :

```txt
tick-and-sass_api        2/2
tick-and-sass_db         1/1
tick-and-sass_frontend   1/1
tick-and-sass_proxy      1/1
tick-and-sass_redis      1/1
```

Le service API est répliqué en deux instances, ce qui permet de valider une première logique de disponibilité.

---

## Reverse proxy Nginx

Nginx sert de point d’entrée à l’application.

En Swarm, il permet notamment :

```txt
/api/graphql → API GraphQL
/health      → query GraphQL de santé
```

Tests réalisés :

```bash
curl -X POST http://localhost/api/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ health }"}'

curl http://localhost/health
```

Résultat attendu :

```json
{"data":{"health":"OK"}}
```

---

## GitHub Actions — API

Un workflow GitHub Actions est prévu pour l’API.

Objectif :

```txt
1. récupérer le code ;
2. installer les dépendances ;
3. lancer les tests unitaires ;
4. compiler l’API ;
5. construire l’image Docker ;
6. publier l’image sur DockerHub.
```

Workflow concerné :

```txt
.github/workflows/deploy-api.yml
```

Étapes importantes :

```yaml
- name: Install API dependencies
  working-directory: api
  run: npm ci

- name: Run API unit tests
  working-directory: api
  run: npm test

- name: Compile API
  working-directory: api
  run: npm run compile
```

L’image Docker n’est construite et publiée que si les tests et la compilation passent.

---

## GitHub Actions — Frontend

Un workflow est aussi prévu pour le frontend.

Objectif :

```txt
1. installer les dépendances frontend ;
2. construire l’application ;
3. vérifier que le build est généré ;
4. publier le frontend sur GitHub Pages.
```

Workflow concerné :

```txt
.github/workflows/deploy-frontend.yml
```

Point d’attention :

Le frontend doit utiliser une URL publique pour l’API en production.

Exemple :

```txt
PUBLIC_API_URL=http://<serveur>/api/graphql
```

---

## Publication DockerHub

Le workflow API publie l’image sur DockerHub avec plusieurs tags :

```txt
tag par branche
tag par commit SHA
tag latest sur la branche principale
```

Cela permet d’identifier l’image produite et de revenir à une version précédente si nécessaire.

---

## Mise en production sur serveur

Pour une mise en production sur serveur, la cible peut être une machine Linux fournie par l’école.

Principe :

```txt
GitHub Actions ou déploiement manuel
        ↓
serveur distant
        ↓
docker stack deploy
        ↓
Nginx + API + PostgreSQL + Redis
```

Déploiement manuel possible :

```bash
ssh student@<serveur>
git clone <url_du_repo>
cd TickAndSass
docker stack deploy -c swarm.yml tick-and-sass
```

Vérification :

```bash
curl http://<serveur>/health
```

Résultat attendu :

```json
{"data":{"health":"OK"}}
```

---

## Sécurité et secrets

Les secrets ne doivent pas être versionnés.

À ne pas commiter :

```txt
.env
docker.env
tokens
mots de passe
clés privées SSH
```

À utiliser à la place :

```txt
.env.example
docker.env.example
GitHub Secrets
```

Exemples de secrets GitHub :

```txt
DOCKERHUB_USERNAME
DOCKERHUB_TOKEN
SERVER_HOST
SERVER_USER
SERVER_SSH_KEY
```

---

## Rollback

En cas de problème sur un service Swarm :

```bash
docker service rollback tick-and-sass_api
```

Pour redémarrer un service :

```bash
docker service update --force tick-and-sass_proxy
```

Pour repartir d’un déploiement propre :

```bash
docker stack rm tick-and-sass
docker stack deploy -c swarm.yml tick-and-sass
```

