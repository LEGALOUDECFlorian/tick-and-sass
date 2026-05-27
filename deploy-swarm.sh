echo "Déploiement avec Swarm"

# Build de l'image API
cd backend
docker build -t tick-and-sass-api:local .
cd ..

docker info | grep -q "Swarm: active" || docker swarm init

# Déploiement de la stack
docker stack deploy -c swarm.yml tick-and-sass

# Vérification des containers
docker service ls

echo "Test Api: http://localhost/health"