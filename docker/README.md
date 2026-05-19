# Entorno local con Docker

Esta carpeta contiene la configuración para levantar el entorno de desarrollo local de **Brisas de Calamuchita** usando Docker Compose: MySQL 8 + phpMyAdmin.

## Requisitos previos

- **Docker Desktop** (Windows / macOS) o **Docker Engine + Docker Compose** (Linux).
- Verificar que esté instalado:
  ```bash
  docker --version
  docker compose version
  ```
- Tener libres los puertos **3306** (MySQL) y **8080** (phpMyAdmin) en tu máquina.

> Si no tenés Docker instalado, descargalo desde https://www.docker.com/products/docker-desktop/

## Cómo levantar el entorno

Todos los comandos se ejecutan desde la **raíz del proyecto** (donde está el `docker-compose.yml`), no desde esta carpeta.

### Primera vez

```bash
# 1. Levantar los contenedores (descarga las imágenes la primera vez)
docker compose up -d

# 2. Ver el estado (esperá a que mysql diga "healthy")
docker compose ps

# 3. Listo. Verificar accesos:
#    - MySQL:       localhost:3306
#    - phpMyAdmin:  http://localhost:8080
```

La primera vez tarda 1-2 minutos en descargar las imágenes y bootstrappear MySQL. Las siguientes veces arranca en segundos.

### ¿Qué pasa en el primer arranque?

Cuando MySQL detecta que el volumen `brisas_mysql_data` está vacío, ejecuta automáticamente en orden:

1. Crea la base de datos `brisas_de_calamuchita`
2. Ejecuta `backend/migraciones/001_schema.sql` (las 8 tablas + constraints)
3. Ejecuta `backend/semillas/001_datos_iniciales.sql` (usuarios + 30 reservas)

Cuando el contenedor pasa a estado **healthy**, todo está cargado y la BD está lista para usar.

> **Importante:** los init scripts solo corren la **primera vez**. Si modificás el schema y querés que se vuelva a ejecutar, tenés que borrar el volumen (ver "Reset total" más abajo).

## Comandos del día a día

```bash
# Ver estado de los contenedores
docker compose ps

# Ver logs en tiempo real (Ctrl+C para salir)
docker compose logs -f

# Ver logs solo de mysql
docker compose logs -f mysql

# Parar los contenedores (mantiene los datos)
docker compose stop

# Volver a arrancar (rápido, no rehace nada)
docker compose start

# Parar + borrar contenedores (mantiene los datos en el volumen)
docker compose down

# Reset total: parar + borrar contenedores + borrar volumen
# Esto borra TODOS los datos. Al siguiente up se reejecutan migraciones + seeds.
docker compose down -v
```

## Resetear los datos

Hay dos formas, según qué tan limpio quieras dejar todo:

### Opción A — Reset blando (recomendado en desarrollo)

Usa el runner del backend. Mantiene los contenedores corriendo, dropea la BD y la vuelve a crear.

```bash
# desde la raíz del proyecto:
cd backend
npm run resetear
```

### Opción B — Reset duro (volumen desde cero)

Borra todo el volumen de MySQL. La siguiente vez que arranques, los init scripts vuelven a correr.

```bash
docker compose down -v
docker compose up -d
```

## Conectarse a la BD desde el backend

El backend usa las variables de `.env`. Para apuntar al MySQL del Docker Compose, el `.env.ejemplo` ya viene preconfigurado con:

```env
BD_HOST=localhost
BD_PUERTO=3306
BD_USUARIO=brisas_user
BD_PASSWORD=brisas_password_local
BD_NOMBRE=brisas_de_calamuchita
```

Estos valores coinciden con los del `docker-compose.yml`. Si los cambiás en uno, hay que cambiarlos en ambos.

## Conectarse desde phpMyAdmin

Andá a **http://localhost:8080** en el navegador. La sesión queda **auto-iniciada como `root`** (configurado en el compose para desarrollo).

Desde ahí podés:
- Explorar las 8 tablas
- Ver las 30 reservas cargadas
- Ejecutar queries arbitrarias
- Exportar/importar datos
- Inspeccionar las constraints y FKs

## Conectarse desde tu cliente favorito

| Cliente | Configuración |
|---|---|
| **DBeaver** | host: `localhost` · port: `3306` · user: `brisas_user` · pass: `brisas_password_local` · db: `brisas_de_calamuchita` |
| **MySQL Workbench** | Same as above |
| **CLI directo** | `docker compose exec mysql mysql -u brisas_user -p brisas_de_calamuchita` |

## Usuarios de MySQL configurados

| Usuario | Contraseña | Para qué se usa |
|---|---|---|
| `root` | `rootBrisas2026` | Administración (cuidado en producción) |
| `brisas_user` | `brisas_password_local` | El backend de la aplicación |

> Estas son contraseñas de **desarrollo local**. En producción se sobreescriben con variables de entorno reales y nunca van al repo.

## Estructura de la carpeta `docker/`

```
docker/
├── README.md              # este archivo
└── mysql/
    └── conf/
        └── my.cnf         # config custom de MySQL (charset, timezone, logs)
```

La configuración custom se monta como `/etc/mysql/conf.d/custom.cnf` dentro del contenedor y MySQL la carga al arrancar.

## Troubleshooting

### Error: "port is already allocated" / "puerto 3306 ya está en uso"

Tenés otro MySQL corriendo (nativo o de otro proyecto Docker). Dos opciones:

1. Parar el MySQL nativo:
   ```bash
   # Linux/macOS
   sudo systemctl stop mysql
   # Windows (admin)
   net stop mysql80
   ```

2. Cambiar el puerto en `docker-compose.yml`:
   ```yaml
   ports:
     - "3307:3306"   # primer número = puerto en tu host
   ```
   Y actualizar `BD_PUERTO=3307` en tu `.env`.

### El healthcheck falla y mysql no llega a healthy

Mirá los logs para ver qué pasó:
```bash
docker compose logs mysql
```

Lo más común: error en alguno de los SQL del init. Si modificaste el schema y dejó un error de sintaxis, MySQL no arranca. Probá:

```bash
docker compose down -v   # borrar todo
# arreglar el SQL
docker compose up -d     # volver a arrancar
```

### phpMyAdmin dice "Cannot log in to the MySQL server"

Esperá 30 segundos y refrescá. MySQL puede tardar más que phpMyAdmin la primera vez. Si persiste, mirá los logs de mysql.

### "El init no ejecutó las semillas"

Los init scripts **solo corren la primera vez**. Si ya tenías el volumen creado de antes, no los va a tocar. Hacé reset total:
```bash
docker compose down -v
docker compose up -d
```

### Liberar espacio en disco

```bash
# Borrar contenedores parados, imágenes sin usar, volúmenes huérfanos
docker system prune -a --volumes
```

> ⚠️ Cuidado: esto borra **todo** lo de Docker en tu máquina, no solo este proyecto.

## Para producción

Este compose es para **desarrollo local**. Para producción:

- Cambiar todas las contraseñas (root y brisas_user) por valores fuertes desde variables de entorno
- No exponer phpMyAdmin públicamente
- Configurar backups automáticos del volumen `brisas_mysql_data`
- Ajustar `innodb_buffer_pool_size` y `max_connections` según la carga real
- Usar imágenes pinneadas a un SHA específico, no solo el tag (`mysql:8.4@sha256:...`)

El deploy en producción se hace en **Railway** (ver Bloque 16).
