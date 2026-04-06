# 01 — Setup y Arquitectura del Laboratorio

## Arquitectura

```
┌─────────────────────────────────────────────────────┐
│            Docker Bridge Network (aislada)           │
│                  172.28.0.0/16                       │
│                                                      │
│  ┌─────────────────────┐  ┌─────────────────────┐   │
│  │  sqli_vulnerable    │  │   sqli_secure        │   │
│  │  Flask :5000        │  │   Flask :5000        │   │
│  │  APP_MODE=vulnerable│  │   APP_MODE=secure    │   │
│  │  SQLite /app/data/  │  │   SQLite /app/data/  │   │
│  └─────────────────────┘  └─────────────────────┘   │
│           │ :5000                   │ :5001           │
└───────────┼─────────────────────────┼───────────────┘
            │  port-forward           │  port-forward
    localhost:5000           localhost:5001
         (atacante)              (comparativa)
```

## Credenciales de Prueba

| Usuario | Contraseña  | Rol   |
|---------|-------------|-------|
| admin   | admin123    | admin |
| alice   | alice2024   | user  |
| bob     | b0bSecure!  | user  |

## Estructura de la Base de Datos (SQLite)

```sql
-- Tabla principal de autenticación
users (id, username, password[SHA-256], role, email)

-- Tabla de demostración de extracción de datos
products (id, name, description, price, category)

-- Tabla "secreta" que el atacante intentará extraer
secret_tokens (id, token, note)
```

## Verificar logs en tiempo real

```bash
# Logs del contenedor vulnerable
docker logs -f sqli_vulnerable

# Logs del contenedor seguro
docker logs -f sqli_secure
```
