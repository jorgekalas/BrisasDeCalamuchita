# Documento Base del Sistema — Brisas de Calamuchita

> Fuente original: `PP4_E2_KALAS_JORGE.pdf`. Esta versión es para consulta rápida y se actualiza junto con el código.

## 1. Resumen ejecutivo

Sistema web para la gestión de reservas de la propiedad **Brisas de Calamuchita** (Santa Rosa de Calamuchita, Córdoba). Reemplaza el proceso manual actual (WhatsApp, llamadas, papel) por una solución digital responsive con dos interfaces:

- Una **interfaz pública** para visitantes y clientes.
- Un **panel de administración** para el responsable de la propiedad.

El modelo de negocio es **híbrido**: la solicitud es digital pero la confirmación final requiere validación humana del administrador.

## 2. Propósito

Centralizar y optimizar la gestión de reservas, facilitando la interacción con los clientes y la administración interna, e incorporando buenas prácticas de SEO para mejorar la visibilidad del alojamiento.

## 3. Alcance

### Incluye

- Interfaz pública: información de la propiedad, calendario de disponibilidad, registro de clientes, solicitud de reservas.
- Panel admin: gestión de reservas, confirmación/cancelación, registro de estados de pago, administración de huéspedes.

### No incluye en esta versión

- Integración con Booking/Airbnb
- Procesamiento de pagos online
- Gestión de múltiples propiedades
- App móvil nativa
- Chat en tiempo real
- Facturación automática

## 4. Objetivos

**General:** desarrollar un sistema web que gestione eficientemente las reservas, reduciendo errores operativos y mejorando la experiencia de usuario.

**Específicos:**

1. Digitalizar el proceso manual de reservas.
2. Evitar reservas duplicadas mediante un calendario centralizado.
3. Permitir consulta de disponibilidad en tiempo real.
4. Implementar sistema de solicitud + confirmación.
5. Incorporar notificaciones automáticas por email.
6. Mejorar la organización y trazabilidad.
7. Posicionar la propiedad con SEO.

## 5. Usuarios del sistema

| Rol | Autenticado | Acciones principales |
|---|---|---|
| **Visitante** | No | Ver información, consultar disponibilidad, registrarse |
| **Cliente** | Sí | Solicitar y cancelar reservas, ver historial, recibir notificaciones |
| **Administrador** | Sí | Gestionar todas las reservas, confirmar/cancelar, registrar pagos, administrar huéspedes, controlar el calendario |

## 6. Funcionalidades principales

### 6.1 Gestión de reservas
- Solicitud por parte del cliente
- **Bloqueo temporal de fechas por 2 horas**
- Confirmación manual del administrador
- Liberación automática si se cancela o expira el bloqueo

### 6.2 Calendario de disponibilidad
- Visualización en tiempo real
- Estados: Disponible / Pendiente / Confirmado

### 6.3 Gestión de usuarios
- Registro de clientes
- Login de administrador
- Asociación de reservas a usuarios

### 6.4 Estados de reserva
- Pendiente → Confirmada → En curso → Finalizada
- Caminos alternativos: Cancelada, No Show

### 6.5 Gestión de pagos (informativa)
- Seña pendiente
- Seña recibida
- Pago total recibido
- Pago en efectivo al ingreso

### 6.6 Control de capacidad
- **Mínimo: 4 huéspedes**
- **Máximo: 10 huéspedes**
- Registro de cantidad de personas

### 6.7 Control de vehículos
- Registro del vehículo
- **Máximo: 1 vehículo por reserva**
- Campo de observaciones para excepciones

### 6.8 Notificaciones automáticas
- Confirmación de solicitud
- Confirmación de reserva
- Cancelación

## 7. Reglas de negocio (resumen ejecutable)

| ID | Regla |
|---|---|
| RN-01 | Una reserva no puede solaparse con otra ya confirmada o pendiente (no expirada) |
| RN-02 | Una reserva pendiente bloquea las fechas durante 120 minutos |
| RN-03 | Vencido el bloqueo sin confirmación, la reserva pasa a `Cancelada` automáticamente |
| RN-04 | La cantidad de huéspedes debe estar entre 4 y 10 inclusive |
| RN-05 | Máximo 1 vehículo por reserva (excepciones manuales por el admin con observación) |
| RN-06 | Solo el administrador puede confirmar una reserva |
| RN-07 | El cliente solo puede cancelar reservas propias en estado `Pendiente` o `Confirmada` |
| RN-08 | El check-in y check-out solo los registra el administrador |
| RN-09 | Cada cambio de estado dispara una notificación por email al cliente |
| RN-10 | Fechas de check-in deben ser estrictamente futuras al crear una reserva |

## 8. Tecnologías

Ver [README.md](../../README.md) para el detalle del stack y justificación.

## 9. Diagramas

Los diagramas UML del sistema están en `docs/diagramas/`:

- Casos de uso
- Diagrama Entidad-Relación
- Diagrama de Clases
- Diagrama de Estados
- Diagrama de Secuencia
