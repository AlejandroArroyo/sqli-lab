# 03 — Remediación y Código Seguro

> **Target de comparativa**: `http://localhost:5001` (contenedor `sqli_secure`)

---

## La Solución: Consultas Parametrizadas (Prepared Statements)

### Código Vulnerable vs Seguro

#### ❌ VULNERABLE — Concatenación de strings

```python
# app.py – función _login_vulnerable()
query = (
    f"SELECT id, username, role, email FROM users "
    f"WHERE username = '{username}' AND password = '{hashed_pw}'"
)
con.execute(query)
```

**Problema**: `username` y `hashed_pw` forman parte del **string SQL**.
El motor de base de datos recibe un único string y no puede saber qué parte
fue escrita por el desarrollador y qué parte proviene del usuario.

---

#### ✅ SEGURO — Consulta parametrizada

```python
# app.py – función _login_secure()
query = "SELECT id, username, role, email FROM users WHERE username = ? AND password = ?"
con.execute(query, (username, hashed_pw))
```

**Diferencia clave**: ahora se envían **dos mensajes separados** al motor SQL:
1. La **estructura** de la consulta (con marcadores `?`)
2. Los **datos** del usuario (como objetos Python independientes)

El motor compila/planifica el SQL **antes** de ver los datos.
Cuando llegan los valores, solo pueden ocupar el rol de **datos literales**,
nunca de código SQL.

---

## ¿Por qué los Prepared Statements son imposibles de bypassear?

### Flujo interno con parámetros vinculados

```
[Python / sqlite3 driver]
         │
         │  Paso 1: Envía solo la estructura al motor
         │  "SELECT ... WHERE username = ? AND password = ?"
         ▼
[Motor SQLite]
         │
         │  Parsea y compila el plan de consulta
         │  Reserva dos "slots" de tipo texto para los parámetros
         ▼
[Python / sqlite3 driver]
         │
         │  Paso 2: Envía los valores como datos
         │  slot_1 = "admin' --"   ← tratado como string, no SQL
         │  slot_2 = "2d711642..." ← tratado como string, no SQL
         ▼
[Motor SQLite]
         │
         │  Sustituye slots con valores escapados automáticamente
         │  Ejecuta: WHERE username = 'admin'' --' AND password = ...
         │                                ^^
         │                  La comilla simple queda ESCAPADA (duplicada)
         ▼
[Resultado]
         │  No hay usuario con username = "admin' --" → 0 filas → acceso denegado
```

### Por qué `admin' --` deja de ser peligroso

Con parámetros vinculados, el motor trata `'` como un **carácter literal** dentro del dato:

```sql
-- Lo que el motor REALMENTE evalúa:
WHERE username = 'admin'' --'
--                      ^^
--         Comilla escapada → busca el string "admin' --" literalmente
--         No hay usuario con ese nombre → 0 resultados
```

El `--` ya no puede actuar como comentario SQL porque está dentro de un literal string.

### Por qué UNION-based SQLi también falla

```python
# Input malicioso en búsqueda:
term = "' UNION SELECT id,token,note,'','secret' FROM secret_tokens --"

# Con parámetros:
query = "SELECT ... FROM products WHERE name LIKE ?"
con.execute(query, (f"%{term}%",))

# El motor evalúa:
# WHERE name LIKE '%'' UNION SELECT id,token,note,'''',''secret'' FROM secret_tokens --%'
# → Busca productos cuyo nombre CONTIENE literalmente la cadena del ataque
# → 0 resultados (ningún producto tiene ese nombre)
# → Nunca ejecuta el UNION
```

---

## Otras Capas de Defensa (Defensa en Profundidad)

La parametrización es la mitigación **principal**, pero una arquitectura segura incluye:

### 1. Principio de Mínimo Privilegio (Base de Datos)

```sql
-- En MySQL/PostgreSQL, crear un usuario de solo lectura para consultas:
CREATE USER 'app_readonly'@'localhost' IDENTIFIED BY 'strong_pass';
GRANT SELECT ON lab_db.products TO 'app_readonly'@'localhost';
-- Aunque el atacante inyecte SQL, no puede hacer INSERT/DROP/UPDATE
```

### 2. Validación y Sanitización de Entrada

```python
import re

def validate_username(username: str) -> bool:
    """Solo permite caracteres alfanuméricos y _ (whitelist)."""
    return bool(re.match(r'^[a-zA-Z0-9_]{3,32}$', username))

# En el endpoint de login:
if not validate_username(username):
    return "Nombre de usuario inválido", 400
```

### 3. ORM con Abstracción de SQL

Con SQLAlchemy, las queries parametrizadas son automáticas:

```python
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy(app)

class User(db.Model):
    id       = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True)
    password = db.Column(db.String(64))
    role     = db.Column(db.String(20))

# Consulta segura por diseño:
user = User.query.filter_by(username=username, password=hashed_pw).first()
# SQLAlchemy genera automáticamente: WHERE username = ? AND password = ?
```

### 4. Web Application Firewall (WAF) — Capa adicional

Un WAF puede detectar y bloquear patrones de SQLi conocidos:
- `' OR 1=1`
- `UNION SELECT`
- `; DROP TABLE`

Pero **nunca debe reemplazar** las consultas parametrizadas — es una capa complementaria.

### 5. Logging y Detección de Anomalías

```python
# Detectar patrones sospechosos en logs:
SQLI_PATTERNS = ["'", "--", "UNION", "SELECT", "DROP", "INSERT"]

def detect_sqli_attempt(value: str) -> bool:
    return any(p.upper() in value.upper() for p in SQLI_PATTERNS)

if detect_sqli_attempt(username):
    log.warning("⚠️ Posible SQLi detectado: ip=%s, input=%s",
                request.remote_addr, username[:100])
    # Alertar al SIEM / incrementar contador de rate-limiting
```

---

## Resumen Comparativo

| Aspecto | Código Vulnerable | Código Seguro |
|---|---|---|
| Construcción de query | Concatenación f-string | Marcadores `?` + tupla |
| Parsing del SQL | Al ejecutar (con datos incluidos) | Antes de recibir datos |
| Caracteres especiales | Interpretados como SQL | Escapados automáticamente |
| UNION injection | Posible | Imposible |
| Auth bypass | Posible | Imposible |
| Performance | Sin caché de plan | Plan reutilizable (más rápido) |

---

## Verificación: Comprobar la Mitigación

```bash
# En el puerto 5001 (seguro), el mismo payload no funciona:

# Bypass de auth → falla (0 usuarios con ese username literal)
curl -X POST http://localhost:5001/login \
  -d "username=admin'%20--&password=anything"
# → Redirige a /login con "Credenciales incorrectas"

# UNION injection → falla (busca el string literalmente)
curl "http://localhost:5001/search?q=%27%20UNION%20SELECT%20id%2Ctoken%2Cnote%2C1%2C2%20FROM%20secret_tokens%20--"
# → 0 resultados (sin error, sin datos)
```
