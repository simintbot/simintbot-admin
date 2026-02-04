#!/bin/bash

# Script de déploiement pour simintbot-admin
# Usage: ./deploy.sh [dev|prod]

if [ "$1" == "prod" ]; then
    echo "🚀 Déploiement en PRODUCTION..."
    DIR="/var/www/SIMINTBOT/simintbot_admin"
    COMPOSE_FILE="docker-compose.prod.yml"
elif [ "$1" == "dev" ]; then
    echo "🚧 Déploiement en DÉVELOPPEMENT..."
    DIR="/var/www/SIMINTBOT/simintbot_devadmin"
    COMPOSE_FILE="docker-compose.dev.yml"
else
    echo "❌ Usage: ./deploy.sh [dev|prod]"
    exit 1
fi

# Aller dans le répertoire
cd $DIR || { echo "❌ Répertoire $DIR introuvable"; exit 1; }

# Pull code is handled by CI/CD separately via git pull or scp, 
# But standard practice often assumes we run this AFTER git pull.

echo "📦 Reconstruction des conteneurs..."
docker compose -f $COMPOSE_FILE down
docker compose -f $COMPOSE_FILE up -d --build

echo "🧹 Nettoyage des images inutilisées..."
docker image prune -f

echo "✅ Déploiement terminé avec succès pour $1 !"
