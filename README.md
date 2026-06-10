# Halt

Aplicativo de treinos e rede social inspirado no Hevy e Strava. Permite registrar sessões de treino, acompanhar evolução pessoal e interagir com outros usuários.

Desenvolvido com Django, dividido em três módulos: `usuarios`, `treinos` e `social`.

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

### Subindo o projeto

```bash
docker compose up
```

Na primeira execução, o container automaticamente:
- Aplica as migrations
- Coleta os arquivos estáticos
- Popula o banco com dados de teste

| Serviço | URL |
|---|---|
| Aplicação | http://localhost:8000 |
| Django Admin | http://localhost:8000/admin |
| Visualizador do banco | http://localhost:8081 |

Credenciais do admin geradas pelo seed:

```
usuário: admin
senha:   senha123
```

### Resetar o banco de dados

```bash
rm .initialized db.sqlite3
docker compose up
```
