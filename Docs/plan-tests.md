# Plan de tests — Tick & Sass

## Objectif

Ce document présente les tests prévus et exécutés sur le projet **Tick & Sass**.

L’objectif était de vérifier que l’application fonctionne correctement avant déploiement, aussi bien sur la partie API que sur la partie infrastructure.

Les tests couvrent :

- des tests unitaires côté API ;
- un test de compilation TypeScript ;
- un test de disponibilité avec la query GraphQL `health` ;
- des tests fonctionnels API sur les tickets ;
- un test de charge avec Artillery ;
- une validation du déploiement local avec Docker Compose et Docker Swarm.

---

## Environnement de test

Les tests ont été réalisés dans un environnement Docker local.

Services utilisés :

- API GraphQL Node.js / Apollo Server ;
- frontend SvelteKit ;
- PostgreSQL ;
- Redis ;
- Nginx comme reverse proxy ;
- Artillery pour les tests de charge.

Commandes principales :

```bash
docker compose -f compose.yml up --build
docker compose -f compose.yml exec api npm test
docker compose -f compose.yml exec api npm run compile
npm run load:report:docker
```

---

## Plan de tests

| ID | Type de test | Élément testé | Action réalisée | Résultat attendu | Statut |
|---|---|---|---|---|---|
| T01 | Unitaire | Resolver `health` | Exécuter le test Vitest | Le resolver retourne `OK` | OK |
| T02 | Unitaire | Utilitaire ticket | Exécuter le test Vitest | La fonction retourne la valeur attendue | OK |
| T03 | Build | Compilation API | Lancer `npm run compile` | Compilation TypeScript sans erreur | OK |
| T04 | Disponibilité | API GraphQL | Appeler `{ health }` | Réponse `{"data":{"health":"OK"}}` | OK |
| T05 | Reverse proxy | Route `/api/graphql` | Appeler GraphQL via Nginx | La requête est transmise à l’API | OK |
| T06 | Fonctionnel API | Liste des tickets | Requête GraphQL sur les tickets | La liste des tickets est retournée | OK |
| T07 | Fonctionnel API | Détail d’un ticket | Requête GraphQL avec un identifiant | Le détail du ticket est retourné | OK |
| T08 | Fonctionnel API | Création d’un ticket | Mutation GraphQL | Un ticket est créé | OK |
| T09 | Charge | Scénario Artillery | Lancer le scénario `tickets.yml` | Réponses 2xx et aucun échec | OK |
| T10 | Déploiement | Stack Swarm | Déployer avec `docker stack deploy` | Tous les services sont en `Running` | OK |

---

## Tests unitaires

Les tests unitaires sont lancés avec Vitest depuis le conteneur API.

Commande utilisée :

```bash
docker compose -f compose.yml exec api npm test
```

Résultat obtenu :

```txt
Test Files  2 passed (2)
Tests       2 passed (2)
```

Ces tests permettent de valider rapidement des fonctions isolées, sans lancer tout un parcours utilisateur.

---

## Test de compilation

La compilation TypeScript a été vérifiée avec :

```bash
docker compose -f compose.yml exec api npm run compile
```

Résultat obtenu :

```txt
tsc
postcompile: copie du fichier schema.graphql dans dist/schemas
```

Ce test permet de vérifier que le code API est compilable avant la construction de l’image Docker.

---

## Test de disponibilité

La disponibilité de l’API est vérifiée avec une query GraphQL simple :

```bash
curl -X POST http://localhost/api/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ health }"}'
```

Résultat attendu :

```json
{"data":{"health":"OK"}}
```

Une route simplifiée est aussi disponible via le reverse proxy :

```bash
curl http://localhost/health
```

Résultat attendu :

```json
{"data":{"health":"OK"}}
```

---

## Test de charge Artillery

Un scénario Artillery a été ajouté dans :

```txt
tests/load/scenarios/tickets.yml
```

Il simule plusieurs usages :

- récupération de la liste des tickets ;
- récupération du détail d’un ticket ;
- création d’un ticket ;
- parcours complet autour des tickets.

Commande utilisée :

```bash
npm run load:report:docker
```

Résultat obtenu lors du test :

```txt
http.requests: 592
http.codes.200: 592
vusers.created: 390
vusers.completed: 390
vusers.failed: 0
http.response_time.mean: 6.8 ms
http.response_time.p95: 13.1 ms
http.response_time.p99: 19.9 ms
```

Le test a donc permis de vérifier que l’API répondait correctement sous une charge progressive, sans erreur HTTP et sans échec de scénario.

