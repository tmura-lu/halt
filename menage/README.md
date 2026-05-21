## Como Injetar os Dados no Banco

Você pode carregar os dados iniciais de duas formas: **manualmente** (com os containers já rodando) ou **automaticamente** (a cada inicialização do container).

### Opção 1: Carga Manual (Via Terminal)

Com o ambiente do Docker já inicializado e rodando em background, execute o seguinte comando no seu terminal para injetar a fixture:

```bash
docker compose exec halt-web python manage.py loaddata db_init.json
```
### Opção 2:

```bash
# Executa as migrações para garantir que o banco existe e está atualizado
python manage.py migrate --noinput

# Injeta os dados iniciais no banco SQLite/Postgres
python manage.py loaddata db_init.json

# Executa o comando principal do container (runserver, gunicorn, etc.)
exec "$@"
```