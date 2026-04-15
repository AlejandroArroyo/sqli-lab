# 🔐 SQLi Lab — Laboratorio de SQL Injection (Entorno Educativo)

> **DevSecOps · Seguridad Ofensiva & Defensiva**

[![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.0-lightgrey?logo=flask)](https://flask.palletsprojects.com)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://docker.com)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Educational](https://img.shields.io/badge/Purpose-Educational%20Only-orange)](.)

---

## ⚠️ Aviso Legal

> Este laboratorio contiene código **intencionalmente vulnerable** con fines **exclusivamente educativos**.
> Está diseñado para ejecutarse en un entorno local y aislado mediante Docker.
> **Nunca lo despliegues en producción ni lo expongas a Internet.**
> El autor no se hace responsable del uso indebido de este material.

---

## 📋 Descripción

Laboratorio completo de **SQL Injection (SQLi)** que demuestra:

| Aspecto | Descripción |
|---|---|
| **Ofensivo** | Bypass de autenticación, extracción de datos via UNION |
| **Defensivo** | Prepared Statements, validación de entrada |
| **DevSecOps** | Análisis estático de código, principio de mínimo privilegio |

La aplicación Flask corre simultáneamente en **dos modos**:
- Puerto `5000` → versión **vulnerable** (para demostrar ataques)
- Puerto `5001` → versión **segura** (para demostrar la mitigación)

---

## 🗂️ Estructura del Proyecto

```
sqli-lab/
├── app/
│   ├── app.py              # Aplicación Flask (modo dual: vuln/secure)
│   ├── Dockerfile
│   └── requirements.txt
├── docs/
│   ├── 01-setup.md         # Instalación y puesta en marcha
│   ├── 02-exploitation.md  # Guía ofensiva paso a paso
│   ├── 03-remediation.md   # Análisis del código seguro
│   └── diagrams/
│       └── attack-flow.md  # Diagrama del flujo de ataque
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 🚀 Inicio Rápido

### Prerequisitos
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) ≥ 24.x
- [Docker Compose](https://docs.docker.com/compose/) ≥ 2.x

### Levantar el lab

```bash
# Clonar el repositorio
git clone https://github.com/TU_USUARIO/sqli-lab.git
cd sqli-lab

# Construir y levantar ambos contenedores
docker compose up --build -d

# Verificar que están corriendo
docker compose ps
```

| URL | Descripción |
|---|---|
| `http://localhost:5000/login` | App **vulnerable** |
| `http://localhost:5001/login` | App **segura** |

### Detener el lab

```bash
docker compose down -v   # -v elimina los volúmenes con las BBDDs
```

---

## 📚 Documentación

| Documento | Contenido |
|---|---|
| [01 - Setup](docs/01-setup.md) | Arquitectura, red Docker, credenciales de prueba |
| [02 - Explotación](docs/02-exploitation.md) | Ataques paso a paso con explicación técnica |
| [03 - Remediación](docs/03-remediation.md) | Código seguro y análisis detallado |

---

## 🏗️ Stack Tecnológico

- **Backend**: Python 3.11 + Flask 3.0
- **Base de Datos**: SQLite 3 (embebida, sin servidor)
- **Contenedores**: Docker + Docker Compose
- **Red**: Bridge network aislada `172.28.0.0/16`
