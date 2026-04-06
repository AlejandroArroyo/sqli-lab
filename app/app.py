"""
╔══════════════════════════════════════════════════════════════════╗
║         SQLi LAB  –  Aplicación Flask (Dual Mode)               ║
║  APP_MODE=vulnerable  →  código intencionalmente inseguro        ║
║  APP_MODE=secure      →  código remediado con Prepared Statements║
╚══════════════════════════════════════════════════════════════════╝
ADVERTENCIA: Este código contiene vulnerabilidades INTENCIONALES
con fines EXCLUSIVAMENTE EDUCATIVOS. Nunca lo despliegues en
producción ni en una red accesible públicamente.
"""

import os
import sqlite3
import hashlib
import logging
from flask import Flask, request, render_template_string, redirect, url_for, session

# ─────────────────────────────────────────────────────────
# Configuración base
# ─────────────────────────────────────────────────────────
APP_MODE = os.environ.get("APP_MODE", "vulnerable")   # 'vulnerable' | 'secure'
DB_PATH  = "/app/data/lab.db"

app = Flask(__name__)
app.secret_key = "lab-secret-key-do-not-use-in-prod"

logging.basicConfig(
    level=logging.DEBUG,
    format="[%(levelname)s] %(message)s"
)
log = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────
# Bootstrap de la base de datos
# ─────────────────────────────────────────────────────────
def init_db():
    """Crea tablas y puebla datos de ejemplo en cada arranque."""
    os.makedirs("/app/data", exist_ok=True)
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()

    # Tabla de usuarios
    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT    NOT NULL UNIQUE,
            password TEXT    NOT NULL,      -- SHA-256 hex
            role     TEXT    NOT NULL DEFAULT 'user',
            email    TEXT
        )
    """)

    # Tabla de productos (para demo de extracción de datos)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            name        TEXT NOT NULL,
            description TEXT,
            price       REAL NOT NULL,
            category    TEXT
        )
    """)

    # Tabla secreta que el atacante intentará extraer con UNION
    cur.execute("""
        CREATE TABLE IF NOT EXISTS secret_tokens (
            id    INTEGER PRIMARY KEY AUTOINCREMENT,
            token TEXT NOT NULL,
            note  TEXT
        )
    """)

    # Seed – se salta si ya existen
    users = [
        ("admin",    _hash("admin123"),   "admin", "admin@lab.local"),
        ("alice",    _hash("alice2024"),  "user",  "alice@lab.local"),
        ("bob",      _hash("b0bSecure!"), "user",  "bob@lab.local"),
    ]
    cur.executemany(
        "INSERT OR IGNORE INTO users (username, password, role, email) VALUES (?,?,?,?)",
        users
    )

    products = [
        ("Widget Pro",     "Industrial widget",   29.99,  "hardware"),
        ("DataSync SDK",   "Sync library v3",    149.00,  "software"),
        ("SecureVault USB","Encrypted USB drive",  79.50, "security"),
        ("Nano Router",    "Pocket-size router",   55.00, "networking"),
    ]
    cur.executemany(
        "INSERT OR IGNORE INTO products (name, description, price, category) VALUES (?,?,?,?)",
        products
    )

    tokens = [
        ("FLAG{sql_injection_master_2024}", "Token de administrador – ¡no exponer!"),
        ("API_KEY_PROD_a3f9c2b8e1d4",       "Clave API de producción"),
    ]
    cur.executemany(
        "INSERT OR IGNORE INTO secret_tokens (token, note) VALUES (?,?)",
        tokens
    )

    con.commit()
    con.close()
    log.info("✅ Base de datos inicializada en %s", DB_PATH)


def _hash(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


# ─────────────────────────────────────────────────────────
# Plantillas HTML (inline para mantener un solo archivo)
# ─────────────────────────────────────────────────────────
BASE_STYLE = """
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Courier New', monospace;
    background: #0d1117; color: #c9d1d9;
    display: flex; flex-direction: column;
    align-items: center; min-height: 100vh; padding: 2rem;
  }
  .badge {
    padding: .3rem .8rem; border-radius: 4px;
    font-size: .75rem; font-weight: 700; letter-spacing: .1em;
    margin-bottom: 1.5rem;
  }
  .badge.vuln  { background: #3d1212; color: #ff6b6b; border: 1px solid #ff4444; }
  .badge.secure{ background: #0d2818; color: #56d364; border: 1px solid #2ea043; }
  .card {
    background: #161b22; border: 1px solid #30363d;
    border-radius: 8px; padding: 2rem; width: 100%; max-width: 520px;
  }
  h1 { font-size: 1.4rem; margin-bottom: 1.5rem; color: #f0f6fc; }
  label { display: block; font-size: .8rem; color: #8b949e; margin-bottom: .3rem; }
  input[type=text], input[type=password] {
    width: 100%; padding: .6rem .8rem;
    background: #0d1117; border: 1px solid #30363d; border-radius: 6px;
    color: #c9d1d9; font-family: inherit; font-size: .9rem;
    margin-bottom: 1rem; outline: none;
  }
  input:focus { border-color: #388bfd; }
  button {
    width: 100%; padding: .7rem; border: none; border-radius: 6px;
    font-size: .9rem; font-weight: 700; cursor: pointer; letter-spacing: .05em;
  }
  .btn-primary { background: #238636; color: #fff; }
  .btn-primary:hover { background: #2ea043; }
  .alert { padding: .7rem 1rem; border-radius: 6px; margin-bottom: 1rem; font-size: .85rem; }
  .alert.error   { background: #3d1212; border: 1px solid #ff4444; color: #ff6b6b; }
  .alert.success { background: #0d2818; border: 1px solid #2ea043; color: #56d364; }
  .alert.info    { background: #0c2d6b; border: 1px solid #388bfd; color: #79c0ff; }
  .debug-box {
    background: #0d1117; border: 1px solid #6e40c9;
    border-radius: 6px; padding: 1rem; margin-top: 1.5rem;
    font-size: .75rem; color: #d2a8ff; white-space: pre-wrap; word-break: break-all;
  }
  .debug-box h3 { color: #a371f7; margin-bottom: .5rem; font-size: .8rem; }
  table { width: 100%; border-collapse: collapse; margin-top: 1rem; font-size: .82rem; }
  th { background: #21262d; color: #8b949e; text-align: left; padding: .5rem .8rem; }
  td { padding: .5rem .8rem; border-bottom: 1px solid #21262d; }
  tr:hover td { background: #1c2128; }
  .nav { margin-bottom: 1.5rem; font-size: .8rem; }
  .nav a { color: #388bfd; text-decoration: none; margin-right: 1rem; }
  .nav a:hover { text-decoration: underline; }
  .query-label { font-size: .7rem; color: #8b949e; margin-top: 1.5rem; margin-bottom: .4rem; }
</style>
"""

TMPL_LOGIN = BASE_STYLE + """
<div class="badge {{ 'vuln' if mode == 'vulnerable' else 'secure' }}">
  {{ '⚠️  MODO VULNERABLE' if mode == 'vulnerable' else '🔒 MODO SEGURO' }}
</div>
<div class="card">
  <h1>🔐 Portal de Acceso</h1>
  {% if msg %}
    <div class="alert {{ msg_type }}">{{ msg }}</div>
  {% endif %}
  <form method="POST" action="/login">
    <label>Usuario</label>
    <input type="text"     name="username" placeholder="admin" autocomplete="off">
    <label>Contraseña</label>
    <input type="password" name="password" placeholder="••••••••">
    <button type="submit" class="btn-primary">Iniciar Sesión</button>
  </form>
  {% if debug_query %}
    <div class="debug-box">
      <h3>🔍 SQL generado (solo en modo lab):</h3>{{ debug_query }}
    </div>
  {% endif %}
  <div style="margin-top:1.5rem; font-size:.75rem; color:#8b949e;">
    También puedes buscar productos: <a href="/search" style="color:#388bfd">/search</a>
  </div>
</div>
"""

TMPL_DASHBOARD = BASE_STYLE + """
<div class="badge {{ 'vuln' if mode == 'vulnerable' else 'secure' }}">
  {{ '⚠️  MODO VULNERABLE' if mode == 'vulnerable' else '🔒 MODO SEGURO' }}
</div>
<div class="card" style="max-width:700px">
  <div class="nav">
    <a href="/search">🔎 Buscar productos</a>
    <a href="/logout">⬅ Cerrar sesión</a>
  </div>
  <h1>✅ Bienvenido, {{ username }}</h1>
  <div class="alert info" style="margin-top:1rem">
    Rol: <strong>{{ role }}</strong> &nbsp;|&nbsp; Email: {{ email }}
  </div>
</div>
"""

TMPL_SEARCH = BASE_STYLE + """
<div class="badge {{ 'vuln' if mode == 'vulnerable' else 'secure' }}">
  {{ '⚠️  MODO VULNERABLE' if mode == 'vulnerable' else '🔒 MODO SEGURO' }}
</div>
<div class="card" style="max-width:800px">
  <div class="nav"><a href="/login">⬅ Volver al login</a></div>
  <h1>🔎 Búsqueda de Productos</h1>
  <form method="GET" action="/search" style="display:flex;gap:.5rem;margin-bottom:1rem">
    <input type="text" name="q" value="{{ query }}"
           placeholder="ej: widget  o  ' UNION SELECT..." style="margin:0;flex:1">
    <button type="submit" class="btn-primary" style="width:auto;padding:.6rem 1.2rem">Buscar</button>
  </form>
  {% if debug_query %}
    <div class="debug-box">
      <h3>🔍 SQL generado:</h3>{{ debug_query }}
    </div>
  {% endif %}
  {% if results %}
    <table>
      <tr><th>ID</th><th>Nombre</th><th>Descripción</th><th>Precio</th><th>Categoría</th></tr>
      {% for row in results %}
        <tr>{% for col in row %}<td>{{ col }}</td>{% endfor %}</tr>
      {% endfor %}
    </table>
  {% elif query %}
    <div class="alert error" style="margin-top:1rem">Sin resultados para "{{ query }}"</div>
  {% endif %}
</div>
"""


# ─────────────────────────────────────────────────────────
# Rutas – Login
# ─────────────────────────────────────────────────────────
@app.route("/", methods=["GET"])
def index():
    return redirect(url_for("login"))


@app.route("/login", methods=["GET", "POST"])
def login():
    msg = msg_type = debug_query = None

    if request.method == "POST":
        username = request.form.get("username", "")
        password = request.form.get("password", "")
        hashed   = _hash(password)

        if APP_MODE == "vulnerable":
            result, debug_query = _login_vulnerable(username, hashed)
        else:
            result, debug_query = _login_secure(username, hashed)

        if result:
            session["user"]  = result["username"]
            session["role"]  = result["role"]
            session["email"] = result["email"]
            return redirect(url_for("dashboard"))
        else:
            msg      = "Credenciales incorrectas."
            msg_type = "error"

    return render_template_string(
        TMPL_LOGIN,
        msg=msg, msg_type=msg_type,
        debug_query=debug_query,
        mode=APP_MODE
    )


# ─────────────────────────────────────────────────────────
# ⚠️  CÓDIGO VULNERABLE – NO USAR EN PRODUCCIÓN
# ─────────────────────────────────────────────────────────
def _login_vulnerable(username: str, hashed_pw: str):
    """
    Concatenación directa de parámetros en la query SQL.
    Vulnerable a: bypass de autenticación, extracción de datos, etc.
    """
    query = (
        f"SELECT id, username, role, email FROM users "
        f"WHERE username = '{username}' AND password = '{hashed_pw}'"
    )
    log.warning("⚠️  [VULNERABLE] Ejecutando: %s", query)

    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    try:
        row = con.execute(query).fetchone()
    except sqlite3.OperationalError as e:
        log.error("SQL Error: %s", e)
        row = None
    finally:
        con.close()

    result = dict(row) if row else None
    return result, query


# ─────────────────────────────────────────────────────────
# ✅ CÓDIGO SEGURO – Prepared Statements
# ─────────────────────────────────────────────────────────
def _login_secure(username: str, hashed_pw: str):
    """
    Consulta parametrizada: el driver separa código SQL de datos.
    Los caracteres especiales del usuario NUNCA se interpretan como SQL.
    """
    query       = "SELECT id, username, role, email FROM users WHERE username = ? AND password = ?"
    safe_display = f"SELECT id, username, role, email FROM users WHERE username = ? AND password = ?"

    log.info("✅ [SECURE] Ejecutando con parámetros: username=%s", username)

    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    try:
        row = con.execute(query, (username, hashed_pw)).fetchone()
    except sqlite3.OperationalError as e:
        log.error("SQL Error: %s", e)
        row = None
    finally:
        con.close()

    result = dict(row) if row else None
    return result, safe_display


# ─────────────────────────────────────────────────────────
# Rutas – Búsqueda de productos
# ─────────────────────────────────────────────────────────
@app.route("/search", methods=["GET"])
def search():
    query_param = request.args.get("q", "")
    results = debug_query = None

    if query_param:
        if APP_MODE == "vulnerable":
            results, debug_query = _search_vulnerable(query_param)
        else:
            results, debug_query = _search_secure(query_param)

    return render_template_string(
        TMPL_SEARCH,
        query=query_param,
        results=results,
        debug_query=debug_query,
        mode=APP_MODE
    )


def _search_vulnerable(term: str):
    """
    Búsqueda vulnerable: permite UNION-based SQLi para extraer
    datos de otras tablas (p.ej. secret_tokens).
    """
    query = (
        f"SELECT id, name, description, price, category "
        f"FROM products WHERE name LIKE '%{term}%'"
    )
    log.warning("⚠️  [VULNERABLE] Ejecutando: %s", query)

    con = sqlite3.connect(DB_PATH)
    try:
        rows = con.execute(query).fetchall()
    except sqlite3.OperationalError as e:
        log.error("SQL Error: %s", e)
        rows = [(f"ERROR: {e}", "", "", "", "")]
    finally:
        con.close()

    return rows, query


def _search_secure(term: str):
    """
    Búsqueda segura: parámetro vinculado, UNION imposible.
    """
    query       = "SELECT id, name, description, price, category FROM products WHERE name LIKE ?"
    safe_display = query

    log.info("✅ [SECURE] Buscando: %s", term)

    con = sqlite3.connect(DB_PATH)
    try:
        rows = con.execute(query, (f"%{term}%",)).fetchall()
    except sqlite3.OperationalError as e:
        log.error("SQL Error: %s", e)
        rows = []
    finally:
        con.close()

    return rows, safe_display


# ─────────────────────────────────────────────────────────
# Rutas auxiliares
# ─────────────────────────────────────────────────────────
@app.route("/dashboard")
def dashboard():
    if "user" not in session:
        return redirect(url_for("login"))
    return render_template_string(
        TMPL_DASHBOARD,
        username=session["user"],
        role=session["role"],
        email=session["email"],
        mode=APP_MODE
    )


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))


# ─────────────────────────────────────────────────────────
# Entrypoint
# ─────────────────────────────────────────────────────────
if __name__ == "__main__":
    init_db()
    log.info("🚀 Iniciando en modo: %s", APP_MODE.upper())
    app.run(host="0.0.0.0", port=5000, debug=(APP_MODE == "vulnerable"))
