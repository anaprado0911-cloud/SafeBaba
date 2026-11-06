#!/usr/bin/env bash
# Compila o Angular e grava o resultado em src/main/resources/static (servido pelo Spring Boot).
set -e
cd "$(dirname "$0")/frontend"
npm install
npm run build
