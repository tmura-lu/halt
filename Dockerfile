# 1. Imagem oficial do Python
FROM python:3.11-slim

# 3. Define a pasta de trabalho dentro do container
WORKDIR /app

# 4. Configurações para o Python não gerar arquivos inúteis e rodar em tempo real
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 6. Instala as bibliotecas do requirements.txt dentro do venv do container
COPY requirements.txt /app/
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# 7. Copia o resto dos arquivos do seu projeto
COPY . /app/