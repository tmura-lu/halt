#!/bin/bash
# entrypoint.sh
# Executado toda vez que o container sobe.
# O seed_data roda apenas na primeira vez (controlado pelo arquivo .initialized).

set -e  # Aborta o script se qualquer comando falhar

echo ""
echo "========================================"
echo "  Iniciando setup do container..."
echo "========================================"

# ── 1. Migrations (seguro rodar sempre) ──────────────────────────────────────
echo ""
echo " [1/4] Criando migrations..."
python manage.py makemigrations --no-input

echo ""
echo "  [2/4] Aplicando migrations..."
python manage.py migrate --no-input

# ── 2. Static files (seguro rodar sempre) ────────────────────────────────────
echo ""
echo "  [3/4] Coletando arquivos estáticos..."
python manage.py collectstatic --no-input --clear

# ── 3. Seed (somente na primeira vez) ────────────────────────────────────────
FLAG="/app/.initialized"

if [ ! -f "$FLAG" ]; then
    echo ""
    echo " [4/4] Primeira execução detectada — populando banco de dados..."
    python manage.py seed_data
    touch "$FLAG"
    echo ""
    echo " Banco populado! Arquivo .initialized criado para evitar re-execução."
else
    echo ""
    echo "⏭  [4/4] Banco já inicializado — seed ignorado."
fi

echo ""
echo "========================================"
echo "   Setup concluído! Subindo servidor..."
echo "========================================"
echo ""

# Executa o comando passado pelo docker-compose (runserver, gunicorn, etc.)
exec "$@"
