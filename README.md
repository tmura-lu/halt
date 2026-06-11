# Halt

Aplicativo de treinos e rede social inspirado no Hevy e Strava. Permite registrar sessões de treino, acompanhar evolução pessoal e interagir com outros usuários.

O projeto é dividido em um back-end (Django REST API) e um front-end (React + Vite SPA).

O Back-end gerencia a lógica nos módulos: `usuarios`, `treinos` e `social`.
O Front-end consome a API do back-end para entregar a interface interativa.

---

## Como rodar

### Pré-requisitos

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

### Configuração

1. Clone o repositório

```bash
git clone https://github.com/tmura-lu/halt.git
cd halt
```

### Subindo o Back-end e Banco de Dados (Docker)

```bash
docker compose up
```

Na primeira execução, o container automaticamente:
- Aplica as migrations
- Coleta os arquivos estáticos
- Popula o banco com dados de teste

| Serviço | URL |
|---|---|
| Django API | http://localhost:8000 |
| Django Admin | http://localhost:8000/admin |
| Visualizador do banco | http://localhost:8081 |
| Aplicação Web (Front) | http://localhost:5174 |

Credenciais do admin geradas pelo seed:

```
usuário: admin
senha:   senha123
```


### Resetar o banco de dados

```bash
docker compose down -v
rm .initialized 
docker compose up
```
