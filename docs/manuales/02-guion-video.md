# 🎬 Guion del video — Etapa 3 Evento No Programado

**Brisas de Calamuchita · Proyecto Integrador IFTS N°29**
Jorge Kalas · Mayo 2026

---

## Objetivo del video

Presentación ejecutiva al cliente (15 minutos) mostrando avance, demo en vivo y plan a futuro.

**Tono:** profesional, cercano, sin tecnicismos. Vos como dueño de Kalas Software, hablándole a un cliente real.

**Duración objetivo:** 14 minutos de contenido + 1 minuto de margen para transiciones y respiros = 15 minutos finales.

---

## Antes de grabar — Checklist técnico

- [ ] **Cámara encendida** al inicio y al cierre (la consigna lo aclara).
- [ ] **Compartir pantalla** durante el deck y la demo.
- [ ] **Frontend levantado** en otra pestaña: `npm run dev` → `http://localhost:5173`.
- [ ] **Datos de demo cargados**: la página `/admin` debe tener reservas pendientes para que el flow se vea fluido.
- [ ] **Audio probado**: micrófono externo si tenés, si no, asegurate de que no haya eco.
- [ ] **Notificaciones silenciadas**: WhatsApp Desktop, Slack, mail, todo apagado.
- [ ] **Modo presentación**: PPT en pantalla completa, el resto en otra pantalla.
- [ ] **Vaso de agua a mano** — vas a hablar 15 minutos.
- [ ] **Ensayar al menos 2 veces** la transición entre deck y demo.

---

## Estructura general

| Bloque | Tiempo | Slide | Qué se ve |
|---|---|---|---|
| Apertura | 0:00 – 1:15 | 1-2 | Cámara → deck |
| El proyecto y el problema | 1:15 – 3:00 | 3-4 | Deck |
| La solución | 3:00 – 4:30 | 5 | Deck |
| **Demo en vivo** | 4:30 – 10:00 | — | Frontend navegable |
| Tecnologías y avance | 10:00 – 12:00 | 7-9 | Deck |
| Próximos pasos y cierre | 12:00 – 14:45 | 13-16 | Deck → cámara |

---

# 📍 BLOQUE 1 — Apertura (0:00 – 1:15)

## Slide 1: Portada — "Hospitalidad serrana, gestión que respira"

### 🎥 Cámara
> **Estás en cámara**, slide 1 visible detrás. Sonreí, mirá a cámara.

### 🗣️ Guion (sugerido — adaptalo a tu forma de hablar)

> *"Hola, ¿cómo andan? Soy Jorge Kalas, fundador de Kalas Software. Hoy estamos en una reunión que pediste vos para conocer el avance del proyecto, y la verdad, traigo cosas muy buenas para mostrar."*
>
> *"Muchas gracias por el tiempo. En los próximos 15 minutos te voy a contar dónde estamos, qué resolvimos, qué viene, y al medio voy a mostrarte el sistema funcionando en vivo. Vas a ver que ya hay mucho hecho."*

**Tiempo: ~30 segundos.**

### → Transición: cambia a Slide 2

## Slide 2: Equipo — "Un equipo enfocado en resolver tu problema"

### 🗣️ Guion

> *"Antes de meternos en el proyecto, dos palabras sobre quiénes estamos atrás de esto."*
>
> *"Yo coordino el proyecto, hago el análisis, el diseño y el desarrollo. Vengo de la Tecnicatura en Desarrollo de Software del IFTS y también tengo más de diez años en gestión de proyectos y producto. Eso me sirve para entender tu negocio tanto como para construir el sistema."*
>
> *"Kalas Software es la empresa con la que llevamos adelante esto. No vendemos plantillas: armamos sistemas a medida para emprendimientos turísticos que no quieren perder la calidez en el trato con sus huéspedes."*

**Tiempo: ~45 segundos.**

### 💡 Notas
- No te quedes leyendo la slide. Mirá un segundo, contá con tus palabras.
- Si te trabás con "Kalas Software", andá tranquilo: cliente nuevo no espera memorización.

### → Transición: "Pasemos al proyecto."

---

# 📍 BLOQUE 2 — El proyecto y el problema (1:15 – 3:00)

## Slide 3: El proyecto — "Tu propiedad en Calamuchita, ahora con su propio sistema"

### 🗣️ Guion

> *"Brisas de Calamuchita es una casa serrana de alquiler turístico ubicada en Santa Rosa, capacidad para 4 a 10 personas, a dos cuadras del río. Hoy la propiedad funciona muy bien… pero la gestión se está volviendo un problema."*
>
> *"Las reservas se manejan por WhatsApp, anotando fechas en papel, cruzando agendas. Y eso —cuando crece el flujo de huéspedes— empieza a fallar."*

**Tiempo: ~30 segundos.**

### → Transición: Slide 4

## Slide 4: El problema — "Hoy gestionar reservas es un desorden"

### 🗣️ Guion

> *"Estos son los cuatro problemas que detectamos en la operación actual."*
>
> **Apuntá levemente a cada card mientras hablás:**
>
> *"Primero: reservas duplicadas. Pasa que dos huéspedes terminan con la misma fecha, y alguien se queda afuera. Mala experiencia, posible reseña negativa."*
>
> *"Segundo: no hay trazabilidad. Si pasa algo —una cancelación, un reclamo, una duda de seis meses atrás— no hay forma de reconstruir qué se prometió."*
>
> *"Tercero: tiempo perdido. Las mismas tres preguntas se repiten todo el tiempo: ¿está disponible tal fin de semana? ¿cuánto cuesta? ¿hay cochera? Eso lo resuelve un calendario público en un segundo."*
>
> *"Y cuarto, quizás el más importante: la imagen. Una propiedad seria que se gestiona por WhatsApp transmite informalidad, y eso te hace perder huéspedes premium."*

**Tiempo: ~1 minuto 15 segundos.**

### 💡 Notas
- Hablá pausado en esta slide. Es la que justifica todo el proyecto.
- Si querés un golpe de humor sutil: "*Y sí, a todos nos pasó: ese mensaje de WhatsApp que se perdió entre veinte conversaciones, y de repente alguien te escribe 'che, te confirmaba para el sábado'…*"

### → Transición: "Bueno. ¿Qué propusimos? Pasemos a la solución."

---

# 📍 BLOQUE 3 — La solución (3:00 – 4:30)

## Slide 5: La solución — Sistema híbrido

### 🗣️ Guion

> *"La clave del proyecto fue entender una cosa: no queremos reemplazar lo que vos hacés bien, que es el trato personal con cada huésped. Queremos automatizar lo que hace ruido."*
>
> *"Por eso pensamos un sistema híbrido. Mirá:"*
>
> **Apuntá a la columna izquierda (verde oscura):**
>
> *"Lo digital se ocupa del trabajo repetitivo: mostrar la propiedad, mantener el calendario actualizado al segundo, recibir solicitudes las 24 horas sin que vos hagas nada, bloquear fechas automáticamente para evitar superposiciones, y mandar emails de confirmación."*
>
> **Apuntá a la columna derecha (crema):**
>
> *"Y vos seguís haciendo lo que importa: recibir cada solicitud con su detalle completo, hablar con el huésped por WhatsApp con un click —después te muestro cómo—, confirmar manualmente solo lo que vos querés, coordinar la seña a tu modo, y mantener el trato cercano que te diferencia de Airbnb."*
>
> *"Cero impersonal. Cero pérdida de control. Pero con la prolijidad de una plataforma profesional."*

**Tiempo: ~1 minuto 30 segundos.**

### 💡 Notas
- **Esta es la slide más importante de todo el deck.** Es donde vendés la filosofía.
- Si solo querés que el cliente se acuerde de UNA cosa del video entero, que sea esta: "lo digital hace lo repetitivo, vos seguís haciendo lo que importa".

### → Transición: "Y todo eso, lo voy a mostrar funcionando ahora mismo. Comparto pantalla."

---

# 📍 BLOQUE 4 — DEMO EN VIVO (4:30 – 10:00) ⭐

> ⚠️ **El bloque más importante del video.** 5 minutos y medio de demo dividida en tres actos: visitante, cliente, admin.

## 🔄 Cambio de pantalla compartida

Pasá de PowerPoint al navegador con el frontend (`http://localhost:5173`).

> *"Compartiéndome la pantalla… Listo. Lo que ven es el sistema funcionando, tal cual lo verá un visitante que entra desde Google."*

---

## ACTO 1 — El visitante (4:30 – 6:30)

### Pantalla: `/` (Landing)

### 🗣️ Guion

> *"Esto es lo primero que ve cualquier persona que llega a Brisas. Una página que respira hospitalidad: foto grande, la propuesta clara, el precio, lo que vamos a encontrar."*
>
> **Scrolleá lento mostrando:**
> - Hero
> - "Pensada para que no te falte nada" — los 10 features con sus iconos
> - Galería
>
> *"Acá pueden ver las características: capacidad 4 a 10 personas, 3 habitaciones, 2 baños, asadores, pet friendly, Wi-Fi, cocina equipada, todo. Esto es lo que reemplaza las veinte preguntas que hoy te llegan por WhatsApp."*
>
> **Seguí scrolleando hasta la sección "Dónde estamos":**
>
> *"Y muy importante: la ubicación real. Mapa de Google embebido, dirección exacta. El huésped puede ver dónde estás, calcular distancia desde su casa, abrirlo en su Google Maps."*

**Tiempo: ~1 minuto 15.**

### Acción: click "Ver disponibilidad"

### Pantalla: `/disponibilidad` (Calendario)

### 🗣️ Guion

> *"Y este es el calendario. En vivo. Tachadas las fechas reservadas, en amarillo las que están en proceso de confirmación, todo lo demás disponible."*
>
> **Click en una fecha futura (por ejemplo: día 20).**
>
> *"Elijo el día de ingreso…"*
>
> **Click en otra fecha (por ejemplo: día 25).**
>
> *"…y el día de egreso. Y miren: ya me arma 5 noches, calcula el total estimado, y me dice que las fechas se van a bloquear por 2 horas mientras coordinamos."*

**Tiempo: ~45 segundos.**

### Acción: click "Solicitar reserva"

---

## ACTO 2 — El cliente (6:30 – 8:00)

### Pantalla: `/ingresar` (Login)

### 🗣️ Guion

> *"Para reservar, el huésped tiene que estar registrado —así sabemos quién es, su teléfono, su email. Hoy vamos a entrar como María, que es una clienta de prueba."*
>
> **Click en el botón autocompletar "maria@ejemplo.com" → escribir cualquier password → Ingresar.**

### Pantalla: `/reservar` (Formulario)

### 🗣️ Guion

> *"Y acá tenemos el formulario de reserva. Las fechas ya están cargadas. Le digo cuántos huéspedes vamos a ser…"*
>
> **Click en el "+" para subir a 6 huéspedes.**
>
> *"…6 personas. El teléfono ya está autocompletado con el del perfil, pero si quiero darte otro número de contacto, lo puedo cambiar. Cargo la patente del auto, modelo… ah, o también puedo decir que no llevo vehículo y se simplifica."*
>
> *"Y un campo de observaciones, por si traigo mascota, llego tarde, lo que sea."*
>
> **Click en "Confirmar solicitud".**

### Pantalla: `/reserva-enviada/...` (Confirmación)

### 🗣️ Guion — **ESTE ES EL MOMENTO ESTRELLA**

> *"¡Listo! Y miren esto: solicitud enviada. El número de la reserva, las fechas, el estado pendiente. Pero ahora, abajo, lo más importante:"*
>
> **Apuntá con el cursor al recuadro del email simulado:**
>
> *"El email automático que recibió la huésped. Sin que vos tengas que hacer nada. Acaba de quedar registrada la solicitud, se bloquearon las fechas por dos horas, y María tiene su confirmación en el inbox."*
>
> *"Ahora pasemos al otro lado del mostrador: el panel del administrador. O sea, lo que ves vos cuando te llega esta solicitud."*

**Tiempo total Acto 2: ~1 minuto 30 segundos.**

### Acción: Logout (botón del header) → Login como `admin@brisas.com.ar`

---

## ACTO 3 — El administrador (8:00 – 10:00)

### Pantalla: `/admin` (Panel)

### 🗣️ Guion

> *"Bienvenido al panel. Esto es lo que vas a usar vos día a día."*
>
> **Apuntá a los KPIs en la parte superior:**
>
> *"Arriba: el resumen ejecutivo. Reservas pendientes, confirmadas, finalizadas. Y a la derecha el ingreso histórico del año."*
>
> **Click en la tarjeta "Ingreso histórico 2026".**
>
> *"Y mirá esto: si toco acá, abre el detalle. Evolución mensual de ingresos, mejor mes, promedio, gráfico con barras y línea de tendencia acumulada. Esto te sirve para presentar al contador, planificar el próximo año, saber cuándo subir tarifas."*
>
> **Cerrá el modal con la X o tocando afuera.**

**Tiempo: ~45 segundos.**

### 🗣️ Guion — Listado y WhatsApp

> *"Bajemos al listado. Acá están todas las reservas ordenadas por fecha de solicitud, las más recientes arriba. Tenemos filtros por estado y paginación de a 10 para cuando crezca el volumen."*
>
> **Scrolleá hasta la reserva pendiente de Familia López.**
>
> *"Acá tengo una reserva pendiente: Familia López, 8 personas, 12 al 17 de junio. Pero miren esto:"*
>
> **Apuntá al bloque verde del teléfono y el botón de WhatsApp.**
>
> *"El teléfono del huésped, bien visible, y un botón de WhatsApp. Si lo toco…"*
>
> **Click al botón verde "WhatsApp".**
>
> *"…se me abre WhatsApp con un mensaje ya armado: saludo personalizado, número de la reserva, fechas, y la referencia a la seña. Solo aprieto enter y arrancó la conversación. Tiempo ahorrado: muchísimo."*
>
> **Cerrá la pestaña de WhatsApp y volvé al panel.**

**Tiempo: ~1 minuto 15.**

### 🗣️ Guion — Confirmación

> *"Y para cerrar el flow: una vez que coordiné la seña con la huésped por WhatsApp, vuelvo acá y tocó 'Confirmar'."*
>
> **Click en "Confirmar" de la reserva de Familia López.**
>
> *"Listo. La reserva pasa a estado confirmada. La huésped recibe automáticamente un email avisándole que está todo OK. Y a la derecha, ven que aparece una nueva notificación en el panel de envíos automáticos."*

**Tiempo: ~30 segundos.**

### → Transición: "Cierro pantalla compartida del navegador y vuelvo al deck."

---

# 📍 BLOQUE 5 — Tecnologías y avance (10:00 – 12:00)

## Slide 7: Tecnologías — "Modernas, preparadas para crecer"

### 🗣️ Guion

> *"Una pregunta que me suelen hacer los clientes: '¿y esto con qué está hecho?'. La respuesta corta: tecnologías modernas, las mismas que usan Netflix, Airbnb o Mercado Libre."*
>
> *"¿Qué significa eso en la práctica?"*
>
> **Recorré las 4 cards rápido:**
>
> - *Rápido — carga en menos de 2 segundos en cualquier celular o computadora.*
> - *Seguro — datos encriptados, buenas prácticas de la industria.*
> - *Escalable — si mañana querés sumar otra propiedad o alquilar a varios, el sistema crece con vos.*
> - *Mantenible — código limpio y documentado, fácil de actualizar.*
>
> *"Y eso es todo lo técnico que voy a decir. Si querés profundizar en otra reunión, lo charlamos."*

**Tiempo: ~1 minuto.**

### → Transición: Slide 8

## Slide 8: Hitos — "Esto ya está hecho. 3 de 4."

### 🗣️ Guion

> *"En cuanto al avance: tenemos cuatro etapas, y ya están las primeras tres."*
>
> *"Análisis del negocio: hecho. Diagramas, casos de uso y todo el alcance: hecho. Prototipo interactivo funcional —lo que acaban de ver—: hecho."*
>
> *"Lo que falta es la última etapa: cerrar el sistema con la base de datos real, pruebas y deploy. Estamos en el sprint final."*

**Tiempo: ~45 segundos.**

### → Transición: Slide 9 (opcional, si tenés tiempo)

## Slide 9: Flujo de la reserva — "De principio a fin"

> ⚠️ **Esta slide es OPCIONAL.** Si vas justo de tiempo, saltala y pasá directo a la 13.
> Si la usás:

### 🗣️ Guion (versión rápida)

> *"Y un resumen visual del flow completo, que ya vimos en la demo: visitante elige fechas, se bloquean por 2 horas, recibís la solicitud, le escribís por WhatsApp, confirmás. Cinco pasos, dos horas como máximo entre el primero y el último."*

**Tiempo: ~20 segundos.**

---

# 📍 BLOQUE 6 — Próximos pasos y cierre (12:00 – 14:45)

## Slide 13: Próximos pasos — "Lo que viene en las próximas semanas"

### 🗣️ Guion

> *"Mirá lo que viene en las próximas semanas."*
>
> **Apuntá a cada card de a una:**
>
> *"01: Sistema conectado. Unir lo que viste con la base de datos real para que las reservas se guarden de verdad. Dos semanas."*
>
> *"02: Pruebas exhaustivas. Verificar cada flujo: registro, reserva, confirmación, cancelación, notificaciones. Una semana."*
>
> *"03: Puesta en producción. Subirlo a internet con dominio propio, certificado SSL, copias de seguridad, monitoreo. Una semana."*
>
> *"04: Capacitación y entrega. Una sesión de dos horas para que veas el panel con todo lo cargado, y documentación completa para que tengas siempre a mano. Tres días."*

**Tiempo: ~1 minuto.**

### → Transición: Slide 14

## Slide 14: Cronograma — Gantt 6 semanas

### 🗣️ Guion

> *"Visto así, el cronograma total: 6 semanas. Las primeras dos semanas para terminar el desarrollo, una semana de pruebas con cierto solapamiento, una semana de deploy y al final la capacitación contigo."*
>
> *"O sea: a mediados de julio, lo tenés andando en producción."*

**Tiempo: ~30 segundos.**

### → Transición: Slide 15

## Slide 15: Costo y beneficio — "Lo que invertís, lo que recuperás"

### 🗣️ Guion

> *"Y para hablar del costo: pago único de 1.200.000 pesos. Incluye el desarrollo completo, el dominio y hosting del primer año, dos horas de capacitación, tres meses de soporte post-entrega, y toda la documentación técnica y de usuario."*
>
> *"¿Cuándo lo recuperás? En dos reservas. La cuenta es simple: si el sistema te trae 40% más reservas estimadas al año, evita cien por ciento de duplicaciones, y te libera tiempo… lo recuperás muy rápido."*
>
> *"Es un valor estimativo, lo ajustamos en la reunión final de cierre."*

**Tiempo: ~1 minuto.**

### → Transición: Slide 16

## Slide 16: Cierre — "¿Empezamos?"

### 🎥 Cámara
> **Volvés a cámara**, slide 16 visible. Sonrisa.

### 🗣️ Guion

> *"Y eso es todo lo que te quería mostrar hoy. Como ven, tenemos un sistema funcional, un plan claro, un cronograma realista, y todo el potencial para empezar a operar tu propiedad de una forma totalmente distinta."*
>
> *"Mi propuesta es que tengamos una reunión técnica final esta semana o la próxima para cerrar alcance y firmar. Y arrancamos."*
>
> *"Muchas gracias por confiar en el proyecto, y quedo a tu disposición para cualquier pregunta."*

**Tiempo: ~30 segundos.**

### Acción: Quedate en cámara 2-3 segundos en silencio antes de cortar. Da prolijidad.

---

# 🎬 Después de grabar

## Checklist post-producción

- [ ] **Revisar el audio**: ¿se escucha bien? ¿hay ecos, ruidos?
- [ ] **Verificar duración total**: tiene que estar entre 15 y 20 minutos.
- [ ] **Edición mínima**: cortar el principio (cuando ajustás la cámara) y el final (cuando frenás la grabación). Nada más.
- [ ] **Exportar en MP4**: resolución 1080p mínimo.
- [ ] **Subir a un drive accesible** y compartir el link en el documento de entrega.

## Si te quedaste corto (< 15 min)

Estirá los bloques de:
- Slide 4 (problema) — agregá un ejemplo concreto: "*Imaginate este escenario: te escriben dos personas el mismo día, le dijiste que sí a una, te olvidaste de bloquear, y a las dos horas te escribe otra que también quiere el mismo finde…*"
- Demo del admin — explorá filtros, mostrá la paginación, abrí más reservas pendientes.

## Si te pasaste (> 20 min)

Cortá:
- Slide 9 (flujo de reserva) — está implícito en la demo.
- Slide 2 — acortá la parte de Kalas Software a una frase.
- Demo del Acto 1 (landing) — no scrollees todo, mostrá hero y saltá al calendario.

---

# 💡 Tips finales

- **Hablá pausado**: la tendencia en cámara es acelerar. Bajá un 20% el ritmo que sentís natural.
- **Mirá a cámara, no a la pantalla**: al menos al principio y al final.
- **Las pausas son tus amigas**: dejá respirar al cliente entre slides.
- **Si te trabás, no te frenes**: corregí y seguí. El video se va a editar mínimamente.
- **Después de grabar, mirá los primeros 3 minutos**: si esos están bien, todo lo demás también lo va a estar.

---

> **Última edición:** Mayo 2026
> **Versión:** 1.0
