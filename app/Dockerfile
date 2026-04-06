FROM python:3.11-slim

# Metadatos del autor
LABEL maintainer="SQLi-Lab Portfolio"
LABEL description="Laboratorio educativo de SQL Injection – solo uso local"

WORKDIR /app

# Dependencias del sistema mínimas
RUN apt-get update && apt-get install -y --no-install-recommends \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Dependencias Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Código fuente
COPY . .

# Directorio para la base de datos SQLite
RUN mkdir -p /app/data

# Puerto interno
EXPOSE 5000

# Entrypoint: el modo (vulnerable | secure) se inyecta vía ENV
CMD ["python", "app.py"]
