echo "C'est parti pour le coup de balai !"

docker compose down -v

# Suppression de la stack Swarm
docker stack rm tick-and-sass 2>/dev/null
sleep 5

# Suppression des images locales
docker rmi tick-and-sass-api:local tick-and-sass-api:dev 2>/dev/null
docker rmi tick-and-sass-frontend:local tick-and-sass-frontend:dev 2>/dev/null

# Nettoyage des volumes
docker volume prune -f