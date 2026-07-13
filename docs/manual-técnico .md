# Manual de Usuario — Ecosistema Rodando

**Producto:** Rodando  
**Alcance:** Panel administrativo Angular + API NestJS + flujos principales del ecosistema móvil/API  
**Idioma:** Español  
**Formato:** Markdown  

---

## Convenciones de este manual

Este manual fue construido a partir del código fuente del frontend Angular y del backend NestJS incluidos en los archivos Repomix. Describe lo que el usuario ve en el panel administrativo y lo conecta con las reglas que se ejecutan en la API.

Como no se adjuntaron capturas reales del frontend, cada módulo incluye bloques de **captura sugerida** para que posteriormente se inserten imágenes del sistema. La recomendación es sustituir cada marcador por una imagen Markdown, por ejemplo:

```md
![Dashboard general](./images/dashboard-general.png)
```

> **Nota de alcance:** el frontend analizado corresponde principalmente al **panel administrativo**. El backend también contiene servicios para conductores, pasajeros, viajes, billeteras, pagos, ubicaciones guardadas, notificaciones, calificaciones, órdenes y planes prepago; esos flujos se documentan cuando impactan el funcionamiento general o son administrados desde el panel.

---

# 1. INTRODUCCIÓN Y PROPÓSITO

## 1.1 ¿Qué es Rodando?

**Rodando** es un ecosistema de movilidad y administración operativa diseñado para gestionar viajes, usuarios, conductores, vehículos, zonas geográficas, precios, recaudación en efectivo, billeteras de conductores y reportes financieros/operativos.

El sistema combina tres grandes capas:

1. **Panel administrativo web** desarrollado en Angular.  
   Permite a los administradores gestionar usuarios, conductores, flota, zonas, puntos de recaudación, precios, configuración, reportes y monitoreo de viajes.

2. **API backend** desarrollada en NestJS.  
   Centraliza autenticación, reglas de negocio, validaciones, persistencia, cálculo de precios, gestión de viajes, billeteras, recaudaciones y reportes.

3. **Flujos móviles/API para pasajeros y conductores.**  
   Aunque no están visibles directamente como pantallas del panel administrativo, el backend contiene endpoints para operaciones como disponibilidad de conductores, creación de viajes, aceptación/rechazo de asignaciones, calificaciones, ubicaciones guardadas, notificaciones, órdenes, transacciones y planes prepago.

## 1.2 Problema que resuelve

Rodando resuelve la necesidad de operar una plataforma de transporte bajo demanda con control administrativo centralizado. Sus objetivos principales son:

- Registrar y administrar pasajeros, conductores y usuarios internos.
- Mantener actualizada la flota: categorías, tipos de vehículos, clases de servicio y vehículos asociados a conductores.
- Configurar ciudades, zonas y reglas geográficas que condicionan la operación.
- Definir políticas de precio según alcance global, ciudad o zona.
- Calcular tarifas tomando en cuenta vehículo, clase de servicio, distancia, tiempo, multiplicadores, combustible, demanda y reglas activas.
- Gestionar viajes en tiempo real, detectar estados problemáticos y aplicar acciones administrativas.
- Controlar billeteras de conductores, recaudaciones en efectivo, movimientos y bloqueos.
- Producir reportes financieros, operativos, de calidad de datos, rendimiento de conductores, uso de vehículos y actividad de pasajeros.

## 1.3 Usuarios principales del manual

Este manual está dirigido a:

- Administradores de la plataforma.
- Personal operativo encargado de monitoreo de viajes.
- Personal financiero o de recaudación.
- Responsables de configurar precios, zonas y parámetros generales.
- Equipo técnico o funcional que necesita entender cómo se conectan las pantallas con la lógica backend.

---

# 2. ROLES DE USUARIO Y PERMISOS

## 2.1 Roles detectados en el ecosistema

El código define tres tipos principales de usuario:

| Rol | Valor técnico | Descripción funcional |
|---|---:|---|
| Administrador | `admin` | Accede al panel administrativo web. Gestiona usuarios, conductores, flota, viajes, reportes, configuración, precios, geografía y recaudación. |
| Conductor | `driver` | Opera desde la aplicación o API móvil de conductor. Puede tener disponibilidad, vehículo, billetera, viajes asignados y movimientos financieros. |
| Pasajero | `passenger` | Solicita viajes desde la aplicación o API de pasajero. Puede tener ubicaciones guardadas, historial de viajes, calificaciones y pagos. |

Adicionalmente, el sistema de autenticación contempla audiencias de aplicación:

| Audiencia | Valor técnico | Uso esperado |
|---|---:|---|
| Panel administrativo | `admin_panel` | Inicio de sesión web para administradores. |
| App de conductor | `driver_app` | Sesiones móviles de conductores. |
| App de pasajero | `passenger_app` | Sesiones móviles de pasajeros. |
| Cliente API | `api_client` | Integraciones o clientes internos/API. |

## 2.2 Protección de rutas en Angular

El frontend protege el panel administrativo con dos niveles:

1. **`authGuard`**  
   Verifica si existe una sesión autenticada. Si no la hay, intenta refrescar la sesión silenciosamente. Si falla, redirige al login.

2. **`roleGuard`**  
   Verifica que el usuario autenticado tenga el rol esperado para la sección administrativa. Para las rutas del panel, el rol requerido es `admin`.

La estructura principal de navegación es:

| Ruta | Módulo | Protección funcional |
|---|---|---|
| `/auth/login` | Autenticación | Acceso público para iniciar sesión. |
| `/admin/dashboard` | Dashboard | Requiere sesión y rol administrador. |
| `/admin/users` | Usuarios | Requiere sesión y rol administrador. |
| `/admin/drivers` | Conductores | Requiere sesión y rol administrador. |
| `/admin/fleet` | Flota | Requiere sesión y rol administrador. |
| `/admin/trips` | Viajes | Requiere sesión y rol administrador. |
| `/admin/geography` | Geografía | Requiere sesión y rol administrador. |
| `/admin/cash-collection-points` | Puntos de recaudación | Requiere sesión y rol administrador. |
| `/admin/system-settings` | Configuración | Requiere sesión y rol administrador. |
| `/admin/price-policies` | Políticas de precio | Requiere sesión y rol administrador. |
| `/admin/reports` | Reportes | Requiere sesión y rol administrador. |

## 2.3 Permisos declarados en navegación

La navegación administrativa declara permisos como metadatos, por ejemplo:

| Módulo | Permiso declarado |
|---|---:|
| Dashboard | `dashboard.read` |
| Usuarios | `users.read` |
| Conductores | `drivers.read` |
| Flota | `fleet.read` |
| Viajes | `trips.read` |
| Geografía | `geography.read` |
| Puntos de recaudación | `cash_collection_points.read` |
| Configuración | `system_settings.read` |
| Políticas de precio | `price_policies.read` |
| Reportes | `reports.read` |

> **Observación técnica importante:** en el frontend existe un `permissionGuard`, pero está comentado. Por tanto, según el código actual, los permisos granulares aparecen como metadatos de ruta/navegación, pero el control efectivo se basa principalmente en autenticación y rol `admin`.

## 2.4 Protección en NestJS

El backend registra un guard global de autenticación JWT. Los endpoints marcados con `@Public()` omiten esa protección. Además existe un `AdminOnlyGuard` que valida `userType === admin`, aunque en el código analizado no todos los controladores administrativos lo aplican de forma explícita.

### Lectura funcional del estado actual

| Área backend | Protección observada | Lectura funcional |
|---|---|---|
| Autenticación | Endpoints públicos para login, refresh, recuperación y logout | Permite iniciar o renovar sesiones. |
| Perfil de usuario autenticado | JWT | Requiere usuario autenticado. |
| Panel administrativo Angular | `authGuard` + `roleGuard` en frontend | Solo usuarios `admin` deberían entrar al panel. |
| Viajes administrativos | JWT explícito | Requiere token válido. |
| Reportes administrativos | Dependen del guard global si no están marcados como públicos | Requieren token válido salvo configuración contraria. |
| Varios CRUD maestros | Algunos endpoints están marcados como `@Public()` | Desde la perspectiva de seguridad, conviene revisar si deben ser públicos o requerir rol administrador. |

> **Recomendación funcional/técnica:** para que el modelo de permisos sea consistente, los endpoints de administración deberían aplicar JWT + rol `admin` en backend, no depender solo de la protección del frontend.

## 2.5 Resumen por tipo de usuario

### Administrador

Puede realizar en el panel:

- Iniciar sesión en `/auth/login`.
- Ver indicadores del dashboard.
- Gestionar usuarios.
- Gestionar conductores y sus procesos de alta.
- Consultar y modificar billeteras de conductores.
- Gestionar vehículos, categorías, tipos y clases de servicio.
- Gestionar ciudades y zonas.
- Gestionar puntos de recaudación y revisar sus registros.
- Monitorear viajes y ejecutar acciones administrativas.
- Configurar parámetros del sistema.
- Crear y activar políticas de precio.
- Consultar reportes.

### Conductor

Interactúa principalmente mediante flujos backend/móviles:

- Disponibilidad y ubicación.
- Perfil de conductor.
- Vehículo actual.
- Aceptación/rechazo de viajes.
- Billetera y movimientos.
- Notificaciones.

Desde el panel administrativo, el conductor se gestiona como entidad operativa.

### Pasajero

Interactúa principalmente mediante flujos backend/móviles:

- Solicitud de viajes.
- Historial.
- Calificaciones.
- Ubicaciones guardadas.
- Órdenes, pagos o planes prepago.
- Notificaciones.

Desde el panel administrativo, el pasajero se gestiona como usuario y aparece en reportes/viajes.

---

# 3. GUÍA DE FLUJOS PRINCIPALES DE LA APLICACIÓN

## 3.1 Inicio de sesión

### Pantalla / Vista Angular

- Ruta: `/auth/login`
- Componente: página de login del módulo de autenticación.
- API usada: `POST /auth/login`

**Captura sugerida:**

```md
![Login administrativo](./images/01-login-administrativo.png)
```

### Acciones del usuario

1. El administrador ingresa correo o identificador permitido.
2. Ingresa contraseña.
3. Presiona el botón de inicio de sesión.
4. Si las credenciales son válidas, el sistema redirige al panel administrativo.
5. Si la sesión expira, el frontend intenta refrescarla de forma silenciosa antes de redirigir al login.

### Reglas de negocio en backend

Al enviar el login, el frontend fuerza el contexto administrativo:

- `appAudience: admin_panel`
- `sessionType: web`
- `expectedUserType: admin`

La API valida:

- Existencia del usuario.
- Contraseña local válida.
- Estado activo de la cuenta.
- Audiencia correcta para la aplicación.
- Rol esperado compatible con el usuario.
- Posibles bloqueos por intentos fallidos.

Errores esperados:

- `Email o contraseña inválidos`
- `La cuenta no está activa`
- `No tienes permisos para esta aplicación`
- `Rol inválido para este usuario`
- `Account is temporarily locked`

---

## 3.2 Panel administrativo y navegación principal

### Pantalla / Vista Angular

- Ruta base: `/admin`
- Layout: shell administrativo con menú lateral y contenido principal.

**Captura sugerida:**

```md
![Layout administrativo con menú lateral](./images/02-layout-admin-menu.png)
```

### Acciones del usuario

El administrador navega por los módulos:

- Dashboard
- Usuarios
- Conductores
- Control de Flota
- Viajes
- Geografía
- Puntos de Recaudo
- Configuración
- Políticas de precio
- Reportes

### Reglas de negocio en frontend/backend

- El acceso a `/admin` exige sesión autenticada.
- El usuario autenticado debe tener `userType = admin`.
- Si no hay token o el refresh falla, se redirige a login.
- Si el usuario autenticado no es administrador, se bloquea el acceso a la sección administrativa.

---

## 3.3 Dashboard general

### Pantalla / Vista Angular

- Ruta: `/admin/dashboard`
- Módulo: Dashboard
- APIs usadas bajo `/admin/reports`

**Captura sugerida:**

```md
![Dashboard general de Rodando](./images/03-dashboard-general.png)
```

### Acciones del usuario

El administrador puede:

1. Consultar indicadores generales de operación.
2. Cambiar el período de análisis mediante presets o rangos.
3. Refrescar la información.
4. Revisar gráficos de viajes, ingresos, estados, uso de vehículos y rendimiento.
5. Detectar alertas de calidad de datos, especialmente viajes sin liquidación.

### Información mostrada

El dashboard integra métricas como:

- Total de viajes.
- Viajes completados.
- Viajes cancelados.
- Viajes sin conductores.
- Ingreso bruto.
- Ingreso de la plataforma.
- Ganancia de conductores.
- Ticket promedio.
- Kilómetros totales.
- Tiempo total.
- Conductores activos.
- Pasajeros activos.
- Uso de vehículos.
- Top de conductores y pasajeros.
- Calidad de liquidación.

### Reglas de negocio en backend

El backend obtiene datos agregados desde los servicios de reportes:

- Resumen financiero.
- Series temporales de ingresos/viajes.
- Estados de viajes.
- Rendimiento de conductores.
- Uso de vehículos.
- Actividad de pasajeros.
- Calidad de liquidación.

Validaciones relevantes:

- El rango `from` debe ser anterior a `to`.
- Las fechas deben tener formato válido.
- El preset debe estar soportado por el sistema.

Errores esperados:

- `Invalid "from" date`
- `Invalid "to" date`
- `from must be before to`

---

## 3.4 Gestión de usuarios

### Pantallas / Vistas Angular

- Listado: `/admin/users`
- Crear usuario: `/admin/users/create`
- Editar usuario: `/admin/users/:id/edit`
- Ver detalle: `/admin/users/:id`
- Perfil propio: `/admin/users/profile`

APIs principales:

- `GET /admin/users`
- `POST /admin/users`
- `GET /admin/users/:id`
- `PATCH /admin/users/:id`
- `DELETE /admin/users/:id`
- `GET /users/profile`
- `PATCH /users/profile`
- `PATCH /users/profile/password`

**Capturas sugeridas:**

```md
![Listado de usuarios](./images/04-usuarios-listado.png)
![Formulario de creación de usuario](./images/05-usuarios-crear.png)
![Detalle de usuario](./images/06-usuarios-detalle.png)
![Perfil administrativo](./images/07-usuarios-perfil.png)
```

### Acciones del usuario

En el listado, el administrador puede:

1. Buscar usuarios.
2. Filtrar por tipo de usuario.
3. Filtrar por estado.
4. Cambiar de página.
5. Abrir detalle.
6. Crear un usuario.
7. Editar datos.
8. Eliminar o desactivar según la implementación backend.

En el perfil propio, puede:

1. Consultar sus datos.
2. Actualizar nombre, teléfono, imagen u otros campos permitidos.
3. Cambiar contraseña.

### Campos principales

| Campo | Uso |
|---|---|
| Nombre | Identificación visible del usuario. |
| Correo | Identificación/contacto opcional según flujo. |
| Teléfono | Contacto principal en varios formularios. |
| Tipo de usuario | `passenger`, `driver`, `admin`. |
| Estado | `active`, `inactive`, `banned`. |
| Imagen de perfil | URL o recurso visual asociado. |
| Idioma preferido | Configuración de idioma. |

### Reglas de negocio en backend

Al crear o editar usuarios, la API valida:

- Debe existir al menos correo o teléfono.
- El correo se normaliza a minúsculas.
- El teléfono se limpia de espacios, guiones y paréntesis.
- No puede repetirse un correo ya registrado.
- No puede repetirse un teléfono ya registrado.
- La contraseña local debe cumplir reglas de longitud.
- No se permite dejar al usuario sin ningún medio de contacto.

Al cambiar contraseña:

- Debe existir credencial local.
- La contraseña actual debe coincidir.
- La nueva contraseña no debe ser igual a la actual.
- La actualización debe persistir correctamente.

Errores esperados:

- `MISSING_CONTACT`
- `EMAIL_CONFLICT`
- `PHONE_CONFLICT`
- `USER_NOT_FOUND`
- `LOCAL_CREDENTIALS_NOT_FOUND`
- `INVALID_CURRENT_PASSWORD`
- `PASSWORD_REUSE_NOT_ALLOWED`

---

## 3.5 Gestión de conductores

### Pantallas / Vistas Angular

- Listado: `/admin/drivers`
- Alta de conductor: `/admin/drivers/create`
- Detalle: `/admin/drivers/:id`
- Edición: `/admin/drivers/:id/edit`
- Billetera: `/admin/drivers/:id/wallet`

APIs principales:

- `GET /drivers`
- `POST /drivers`
- `GET /drivers/:id`
- `PATCH /drivers/:id`
- `DELETE /drivers/:id`
- APIs auxiliares de usuarios, vehículos y billetera.

**Capturas sugeridas:**

```md
![Listado de conductores](./images/08-conductores-listado.png)
![Alta de conductor paso 1 usuario](./images/09-conductores-alta-paso-1.png)
![Alta de conductor paso 2 perfil](./images/10-conductores-alta-paso-2.png)
![Alta de conductor paso 3 vehículo](./images/11-conductores-alta-paso-3.png)
![Detalle de conductor](./images/12-conductores-detalle.png)
```

### Acciones del usuario

En el listado, el administrador puede:

1. Buscar conductores.
2. Filtrar por estado de verificación.
3. Filtrar por estado operativo.
4. Filtrar por aprobación.
5. Consultar detalle.
6. Editar perfil.
7. Acceder a la billetera.
8. Crear un nuevo conductor mediante flujo guiado.

### Alta de conductor: flujo por pasos

El alta de conductor está organizada como onboarding:

#### Paso 1 — Usuario base

El administrador registra datos personales:

- Nombre.
- Teléfono.
- Imagen de perfil.
- Contraseña.

El frontend crea primero un usuario base.

#### Paso 2 — Perfil de conductor

Se registran datos propios del conductor:

- Número de licencia.
- Fecha de vencimiento de licencia.
- Foto/URL de licencia.
- Estado de revisión de antecedentes.
- Fecha de revisión de antecedentes.
- Aprobación del conductor.
- Estado operativo.
- Contacto de emergencia.
- Prioridad pagada hasta una fecha opcional.

#### Paso 3 — Vehículo inicial

Se registra el vehículo inicial:

- Tipo de vehículo.
- Placa.
- Marca.
- Modelo.
- Año.
- Color.
- Capacidad.
- Estado.
- Activo/inactivo.
- Fecha de inspección.
- Fecha de mantenimiento.
- Kilometraje.

#### Paso 4 — Confirmación

El sistema envía al backend el perfil de conductor y el vehículo inicial, vinculados al usuario creado previamente.

### Reglas de negocio en backend

La API valida:

- El `userId` debe ser válido.
- El usuario debe existir.
- El número de licencia es obligatorio y tiene longitud máxima.
- La fecha de expiración de licencia debe ser válida.
- Los estados de revisión y operación deben pertenecer a los enums permitidos.
- El vehículo inicial debe tener tipo válido, placa, marca, modelo, año y capacidad válida.
- El conductor no debe tener una billetera duplicada.
- El vehículo debe estar asociado correctamente al perfil del conductor.

Estados relevantes:

| Concepto | Valores |
|---|---|
| Revisión de antecedentes | `pending_background_check`, `approved`, `rejected` |
| Estado del conductor | `active`, `suspended`, `on_vacation`, `pending_docs`, `deactivated` |

Errores esperados:

- Usuario no encontrado.
- Licencia inválida o faltante.
- Vehículo inicial inválido.
- `El driver ya posee una wallet.`
- Conflictos por datos duplicados.

---

## 3.6 Billetera del conductor

### Pantalla / Vista Angular

- Ruta: `/admin/drivers/:id/wallet`
- Módulo: billetera de conductor.

APIs principales:

- `GET /drivers-balance/:driverId`
- `GET /admin/driver-wallets/:driverId/movements`
- `POST /drivers-balance/:driverId/admin-topups`
- `POST /drivers-balance/:driverId/block`
- `POST /drivers-balance/:driverId/unblock`

**Capturas sugeridas:**

```md
![Billetera de conductor](./images/13-conductor-wallet-resumen.png)
![Movimientos de billetera](./images/14-conductor-wallet-movimientos.png)
![Recarga administrativa de billetera](./images/15-conductor-wallet-recarga.png)
![Bloqueo o desbloqueo de billetera](./images/16-conductor-wallet-bloqueo.png)
```

### Acciones del usuario

El administrador puede:

1. Consultar saldo actual.
2. Consultar saldo retenido.
3. Ver total ganado por viajes.
4. Ver estado de la billetera: activa o bloqueada.
5. Revisar movimientos.
6. Registrar recargas administrativas.
7. Bloquear billetera.
8. Desbloquear billetera.

### Campos principales

| Campo | Descripción |
|---|---|
| Saldo actual | Dinero disponible del conductor. |
| Saldo retenido | Fondos retenidos temporalmente. |
| Total ganado | Ganancia acumulada por viajes. |
| Moneda | Moneda de operación, por ejemplo `CUP`. |
| Estado | `active` o `blocked`. |
| Límite negativo permitido | Margen permitido para operar con saldo negativo. |

### Recarga administrativa

Para registrar una recarga se solicitan:

- Monto mayor que cero.
- Moneda.
- Punto de recaudación.
- Usuario operador/recaudador.
- Motivo.
- Referencia externa opcional.
- Notas opcionales.

### Reglas de negocio en backend

La API valida:

- El conductor debe existir.
- El usuario asociado debe ser realmente conductor.
- La billetera debe existir.
- El monto debe ser positivo.
- La moneda de la operación debe coincidir con la moneda de la billetera.
- El punto de recaudación debe existir y estar activo.
- Los movimientos deben conservar saldo anterior y saldo nuevo.
- Una billetera bloqueada puede impedir operaciones según el tipo de movimiento.
- Si una recarga deja el saldo en estado válido, la billetera puede desbloquearse según la lógica de negocio.

Errores esperados:

- `DRIVER_NOT_FOUND`
- `USER_IS_NOT_DRIVER`
- `WALLET_NOT_FOUND`
- `WALLET_BLOCKED`
- `INVALID_AMOUNT`
- `CURRENCY_MISMATCH`
- `COLLECTION_POINT_NOT_FOUND`
- `COLLECTION_POINT_INACTIVE`

---

## 3.7 Control de flota

El módulo de flota agrupa cuatro submódulos:

1. Categorías de vehículos.
2. Clases de servicio.
3. Tipos de vehículos.
4. Vehículos.

Ruta base:

- `/admin/fleet`

**Captura sugerida general:**

```md
![Módulo de control de flota](./images/17-flota-general.png)
```

---

### 3.7.1 Categorías de vehículos

#### Pantallas / Vistas Angular

- Listado: `/admin/fleet/categories`
- Crear: `/admin/fleet/categories/create`
- Editar: `/admin/fleet/categories/:id/edit`

API principal:

- `/vehicle-categories`

**Capturas sugeridas:**

```md
![Listado de categorías de vehículos](./images/18-flota-categorias-listado.png)
![Formulario de categoría de vehículo](./images/19-flota-categorias-formulario.png)
```

#### Acciones del usuario

El administrador puede:

1. Consultar categorías.
2. Buscar por texto.
3. Crear una categoría.
4. Editar nombre, descripción, icono y estado.
5. Activar o desactivar.

#### Reglas de negocio en backend

La API valida:

- Nombre obligatorio.
- Longitud máxima del nombre.
- URL de icono válida cuando se informa.
- Estado activo/inactivo como booleano.
- Integridad con tipos de vehículos asociados.

---

### 3.7.2 Clases de servicio

#### Pantallas / Vistas Angular

- Listado: `/admin/fleet/service-classes`
- Crear: `/admin/fleet/service-classes/create`
- Detalle: `/admin/fleet/service-classes/:id`
- Editar: `/admin/fleet/service-classes/:id/edit`

API principal:

- `/vehicle-service-classes`

**Capturas sugeridas:**

```md
![Listado de clases de servicio](./images/20-flota-clases-servicio-listado.png)
![Formulario de clase de servicio](./images/21-flota-clases-servicio-formulario.png)
```

#### Acciones del usuario

El administrador puede:

1. Crear clases como económica, estándar, confort u otras variantes operativas.
2. Definir multiplicadores de tarifa.
3. Definir capacidad mínima y máxima.
4. Configurar icono y orden de visualización.
5. Activar o desactivar una clase.

#### Reglas de negocio en backend

La API valida:

- Nombre obligatorio.
- Multiplicadores numéricos no negativos.
- Capacidad mínima y máxima válidas.
- Orden de visualización entero.
- URL de icono válida cuando exista.

La clase de servicio afecta el cálculo de precios mediante multiplicadores sobre tarifas base.

---

### 3.7.3 Tipos de vehículos

#### Pantallas / Vistas Angular

- Listado: `/admin/fleet/vehicle-types`
- Crear: `/admin/fleet/vehicle-types/create`
- Detalle: `/admin/fleet/vehicle-types/:id`
- Editar: `/admin/fleet/vehicle-types/:id/edit`

API principal:

- `/vehicle-types`

**Capturas sugeridas:**

```md
![Listado de tipos de vehículos](./images/22-flota-tipos-vehiculo-listado.png)
![Formulario de tipo de vehículo](./images/23-flota-tipos-vehiculo-formulario.png)
```

#### Acciones del usuario

El administrador puede:

1. Crear tipos de vehículos vinculados a una categoría.
2. Asociar una o más clases de servicio.
3. Configurar tarifa base.
4. Configurar costo por kilómetro.
5. Configurar costo por minuto.
6. Configurar tarifa mínima.
7. Definir capacidad por defecto.
8. Activar o desactivar el tipo.

#### Reglas de negocio en backend

La API valida:

- Categoría válida.
- Al menos una clase de servicio válida.
- Tarifas numéricas no negativas.
- Capacidad por defecto mayor o igual que uno.
- Nombre obligatorio.

Los tipos de vehículos son una entrada esencial para el motor de precios y para el alta de vehículos de conductores.

---

### 3.7.4 Vehículos

#### Pantallas / Vistas Angular

- Listado: `/admin/fleet/vehicles`
- Detalle: `/admin/fleet/vehicles/:id`
- Editar: `/admin/fleet/vehicles/:id/edit`

API principal:

- `/vehicles`

**Capturas sugeridas:**

```md
![Listado de vehículos](./images/24-flota-vehiculos-listado.png)
![Detalle de vehículo](./images/25-flota-vehiculos-detalle.png)
![Edición de vehículo](./images/26-flota-vehiculos-editar.png)
```

#### Acciones del usuario

El administrador puede:

1. Consultar vehículos registrados.
2. Buscar por texto.
3. Filtrar por estado, tipo, categoría o clase de servicio.
4. Ver detalle del vehículo.
5. Editar datos operativos.

Campos comunes:

- Tipo de vehículo.
- Placa.
- Marca.
- Modelo.
- Año.
- Color.
- Capacidad.
- Estado.
- Activo/inactivo.
- Inspección.
- Mantenimiento.
- Kilometraje.

#### Reglas de negocio en backend

La API valida:

- Conductor asociado.
- Perfil de conductor asociado.
- Tipo de vehículo existente.
- Placa obligatoria.
- Marca y modelo obligatorios.
- Año dentro de rango válido.
- Capacidad mínima.
- Fechas válidas cuando se informan.
- Kilometraje no negativo.

---

## 3.8 Geografía: ciudades y zonas

Ruta base:

- `/admin/geography`

La geografía permite definir áreas de operación y reglas espaciales para precios, disponibilidad, resolución por punto y segmentación operativa.

---

### 3.8.1 Ciudades

#### Pantallas / Vistas Angular

- Listado: `/admin/geography/cities`
- Crear: `/admin/geography/cities/create`
- Detalle: `/admin/geography/cities/:id`
- Editar: `/admin/geography/cities/:id/edit`

API principal:

- `/cities`

**Capturas sugeridas:**

```md
![Listado de ciudades](./images/27-geografia-ciudades-listado.png)
![Formulario de ciudad](./images/28-geografia-ciudades-formulario.png)
![Detalle de ciudad](./images/29-geografia-ciudades-detalle.png)
```

#### Acciones del usuario

El administrador puede:

1. Crear ciudades de operación.
2. Editar nombre, país, zona horaria y estado.
3. Definir geometría GeoJSON opcional.
4. Activar o desactivar ciudades.
5. Consultar detalle.

#### Reglas de negocio en backend

La API valida:

- Nombre obligatorio.
- Código de país ISO-3166-1 alpha-2.
- Zona horaria IANA válida.
- Geometría válida si se informa.
- No duplicar ciudad por combinación nombre + país.

Errores esperados:

- `City not found`
- `City already exists (name + countryCode)`
- `countryCode must be ISO-3166-1 alpha-2`
- `timezone must be valid IANA`
- `geom must be valid GeoJSON MultiPolygon`

---

### 3.8.2 Zonas

#### Pantallas / Vistas Angular

- Listado: `/admin/geography/zones`
- Crear: `/admin/geography/zones/create`
- Detalle: `/admin/geography/zones/:id`
- Editar: `/admin/geography/zones/:id/edit`

API principal:

- `/zones`

**Capturas sugeridas:**

```md
![Listado de zonas](./images/30-geografia-zonas-listado.png)
![Formulario de zona](./images/31-geografia-zonas-formulario.png)
![Detalle de zona](./images/32-geografia-zonas-detalle.png)
```

#### Acciones del usuario

El administrador puede:

1. Crear zonas dentro de una ciudad.
2. Definir nombre y tipo de zona.
3. Configurar prioridad.
4. Definir geometría GeoJSON obligatoria.
5. Activar o desactivar zonas.
6. Consultar detalle.

#### Reglas de negocio en backend

La API valida:

- La ciudad asociada debe existir.
- La geometría de zona es obligatoria.
- La geometría debe ser GeoJSON `MultiPolygon`.
- La prioridad debe estar dentro del rango permitido.
- No puede duplicarse una zona con el mismo nombre dentro de la misma ciudad.

Errores esperados:

- `Zone not found`
- `City not found`
- `Zone already exists in this city`
- `geom is required`
- `geom cannot be null`
- `geom must be valid GeoJSON MultiPolygon`

---

## 3.9 Puntos de recaudación

### Pantallas / Vistas Angular

- Listado: `/admin/cash-collection-points`
- Crear: `/admin/cash-collection-points/create`
- Editar: `/admin/cash-collection-points/:id/edit`
- Detalle y registros: `/admin/cash-collection-points/:id`

APIs principales:

- `GET /cash-collection-points`
- `POST /cash-collection-points`
- `GET /cash-collection-points/:id`
- `PATCH /cash-collection-points/:id`
- `DELETE /cash-collection-points/:id`
- `GET /cash-collection-points/:id/records`

**Capturas sugeridas:**

```md
![Listado de puntos de recaudación](./images/33-recaudo-puntos-listado.png)
![Formulario de punto de recaudación](./images/34-recaudo-puntos-formulario.png)
![Detalle de punto de recaudación](./images/35-recaudo-puntos-detalle.png)
![Registros de recaudación](./images/36-recaudo-registros.png)
```

### Acciones del usuario

El administrador puede:

1. Consultar puntos de recaudación.
2. Buscar por nombre u otros datos.
3. Filtrar por activo/inactivo.
4. Crear punto de recaudación.
5. Editar datos.
6. Consultar registros asociados.
7. Revisar operaciones de recarga o cobro vinculadas.

### Campos principales

| Campo | Descripción |
|---|---|
| Nombre | Identifica el punto físico o administrativo. |
| Dirección | Ubicación textual. |
| Teléfono de contacto | Contacto operativo. |
| Localización | Coordenadas `[longitud, latitud]`. |
| Horario | Configuración JSON opcional. |
| Activo | Indica si puede recibir operaciones. |

### Reglas de negocio en backend

La API valida:

- El punto debe existir para editar, eliminar o consultar.
- La localización debe tener dos coordenadas numéricas.
- El punto debe estar activo para aceptar ciertas operaciones.
- No se deben duplicar registros de recaudación por transacción.
- Los registros completados se vinculan con movimientos de billetera y transacciones.

Errores esperados:

- `COLLECTION_POINT_NOT_FOUND`
- `COLLECTION_POINT_INACTIVE`
- `CCR_ALREADY_EXISTS`
- `CCR_NOT_FOUND`
- `CCR_WITHOUT_DRIVER`
- `CCR_WITHOUT_TX`
- `CCR_COMPLETED_NO_MOVEMENT`

---

## 3.10 Monitoreo y administración de viajes

### Pantallas / Vistas Angular

- Monitor: `/admin/trips`
- Detalle: `/admin/trips/:id`

APIs principales:

- `GET /admin/trips`
- `GET /admin/trips/:id`
- `GET /admin/trips/:id/events`
- `POST /admin/trips/:id/actions/retry-matching`
- `POST /admin/trips/:id/actions/mark-no-drivers`
- `POST /admin/trips/:id/actions/override-status`
- `POST /admin/trips/:id/actions/cancel`
- `POST /admin/trips/:id/actions/send-message`

**Capturas sugeridas:**

```md
![Monitor de viajes](./images/37-viajes-monitor.png)
![Detalle de viaje](./images/38-viajes-detalle.png)
![Timeline de eventos del viaje](./images/39-viajes-timeline.png)
![Panel de acciones administrativas del viaje](./images/40-viajes-acciones-admin.png)
```

### Acciones del usuario

En el monitor, el administrador puede:

1. Consultar viajes activos o históricos.
2. Buscar viajes.
3. Filtrar por estado.
4. Cambiar de página.
5. Ver alertas operativas.
6. Abrir detalle del viaje.
7. Reintentar matching desde la tabla cuando aplique.

En el detalle, puede:

1. Revisar datos completos del viaje.
2. Consultar pasajero, conductor, vehículo, tarifa y estado.
3. Ver eventos/timeline.
4. Reintentar asignación de conductor.
5. Marcar viaje sin conductores.
6. Sobrescribir estado.
7. Cancelar viaje.
8. Enviar mensaje administrativo a pasajero, conductor o ambos.

### Estados principales del viaje

| Estado técnico | Etiqueta funcional |
|---|---|
| `pending` | Pendiente |
| `assigning` | Buscando conductor |
| `accepted` | Aceptado |
| `arriving` | Conductor en camino |
| `in_progress` | En viaje |
| `completed` | Completado |
| `cancelled` | Cancelado |
| `no_drivers_found` | Sin conductores |

### Alertas operativas en frontend

El frontend marca advertencias cuando detecta viajes con duración anómala por estado, por ejemplo:

- Pendiente prolongado.
- Matching prolongado.
- Aceptado sin avance.
- Arribo prolongado.
- Viaje en curso excesivamente largo.
- Viaje que requiere atención administrativa por liquidación o incidencia.

### Reglas de negocio en backend

#### Reintentar matching

Permitido cuando el viaje está en:

- `pending`
- `assigning`
- `no_drivers_found`

El backend puede:

- Cambiar el viaje a estado de asignación.
- Ejecutar una ronda de matching.
- Registrar eventos administrativos.
- Volver a marcar `no_drivers_found` si no aparece conductor.

Error esperado:

- `Cannot retry matching from status=...`

#### Marcar sin conductores

Registra que no se encontraron conductores disponibles. Debe existir el viaje y no debe contradecir la asignación actual.

Errores esperados:

- `Trip not found`
- `Trip with assigned driver should be cancelled or completed, not marked as no_drivers_found`

#### Cancelar viaje

Permitido desde estados operativos:

- `pending`
- `assigning`
- `accepted`
- `arriving`
- `in_progress`

Requiere motivo administrativo.

El backend:

- Cancela ofertas activas si existen.
- Marca el viaje como cancelado.
- Registra eventos de cancelación.
- Libera disponibilidad del conductor si estaba asociado.
- Emite eventos de actualización.

Errores esperados:

- `Trip cannot be cancelled from status=...`
- `Admin cancellation reason is required`

#### Sobrescribir estado

Estados permitidos como destino:

- `assigning`
- `arriving`
- `in_progress`
- `completed`
- `cancelled`
- `no_drivers_found`

Restricciones:

- No se puede sobrescribir un viaje ya finalizado.
- No se puede mover a estados con conductor si no hay conductor asignado.
- No se debe marcar como `no_drivers_found` si ya existe conductor asignado.

Errores esperados:

- `Admin cannot override trip to status=...`
- `Trip is already final with status=...`
- `Trip cannot be moved to ... without assigned driver`

#### Enviar mensaje

El administrador puede enviar mensajes a:

- Pasajero.
- Conductor.
- Ambos.

Restricciones:

- El viaje debe existir.
- Debe existir pasajero si se envía al pasajero.
- Debe existir conductor si se envía al conductor.
- El mensaje debe tener contenido válido.

Errores esperados:

- `Trip has no passenger`
- `Trip has no driver`
- `Trip has no driver to notify`

---

## 3.11 Configuración del sistema

### Pantallas / Vistas Angular

- Listado: `/admin/system-settings`
- Crear: `/admin/system-settings/create`
- Detalle: `/admin/system-settings/:key`
- Editar: `/admin/system-settings/:key/edit`

API principal:

- `/system-settings`

**Capturas sugeridas:**

```md
![Listado de configuraciones del sistema](./images/41-configuracion-listado.png)
![Formulario de configuración](./images/42-configuracion-formulario.png)
![Detalle de configuración](./images/43-configuracion-detalle.png)
```

### Acciones del usuario

El administrador puede:

1. Ver configuraciones agrupadas.
2. Crear una nueva configuración.
3. Editar valor, descripción, estado y visibilidad.
4. Activar o desactivar configuraciones.
5. Marcar configuraciones como públicas o secretas.

### Grupos detectados

| Grupo | Uso |
|---|---|
| `GENERAL` | Parámetros generales. |
| `PRICING` | Precios, moneda, combustible, demanda. |
| `COMMISSION` | Comisiones de plataforma. |
| `TRIPS` | Parámetros de viajes. |
| `PAYMENTS` | Parámetros de pagos. |

### Tipos de valor

| Tipo | Descripción |
|---|---|
| `STRING` | Texto. |
| `NUMBER` | Número. |
| `BOOLEAN` | Verdadero/falso. |
| `JSON` | Objeto JSON estructurado. |

### Reglas de negocio en backend

La API valida:

- La clave debe ser única.
- La configuración debe existir para editar o consultar.
- El valor debe corresponder con su tipo declarado.
- Los campos numéricos deben ser números válidos.
- Los campos JSON deben ser objetos JSON válidos.
- Algunas claves específicas tienen reglas particulares, por ejemplo moneda por defecto o parámetros de precio.

Errores esperados:

- `System setting not found`
- `System setting key already exists`
- `Setting value must be a valid number`
- `Setting value must be a string`
- `Setting value must be a boolean`
- `Setting value must be a JSON object`
- `Unsupported setting value type`
- `pricing.default_currency must be STRING`
- `pricing.default_currency is invalid`

---

## 3.12 Políticas de precio y simulador

### Pantallas / Vistas Angular

- Listado de políticas: `/admin/price-policies/policies`
- Crear política: `/admin/price-policies/policies/create`
- Detalle: `/admin/price-policies/policies/:id`
- Editar: `/admin/price-policies/policies/:id/edit`
- Simulador: `/admin/price-policies/simulator`

APIs principales:

- `/price-policies`
- `/price-policies/:id/active`
- Servicios de pricing asociados.

**Capturas sugeridas:**

```md
![Listado de políticas de precio](./images/44-precios-politicas-listado.png)
![Formulario de política de precio](./images/45-precios-politicas-formulario.png)
![Detalle de política de precio](./images/46-precios-politicas-detalle.png)
![Simulador de precios](./images/47-precios-simulador.png)
```

### Acciones del usuario

El administrador puede:

1. Crear políticas globales, por ciudad o por zona.
2. Definir prioridad.
3. Definir rango de vigencia.
4. Definir zona horaria.
5. Escribir condiciones JSON.
6. Escribir reglas de precio JSON.
7. Activar o desactivar políticas.
8. Simular tarifas antes de aplicar cambios.

### Alcances de política

| Alcance | Valor técnico | Requisito |
|---|---|---|
| Global | `GLOBAL` | No requiere ciudad ni zona. |
| Ciudad | `CITY` | Requiere `cityId`. |
| Zona | `ZONE` | Requiere `zoneId`. |

### Reglas de negocio en backend

La API valida:

- La política debe existir para editar, activar o consultar.
- `effectiveTo` debe ser posterior a `effectiveFrom`.
- Si el alcance es ciudad, debe enviarse ciudad válida.
- Si el alcance es zona, debe enviarse zona válida.
- No deben existir solapamientos activos incompatibles para el mismo alcance/prioridad/ventana.
- Las condiciones y reglas de precio deben tener formato JSON válido.

Errores esperados:

- `Price policy not found`
- `effectiveTo must be > effectiveFrom`
- `cityId is required for CITY`
- `zoneId is required for ZONE`
- `City not found`
- `Zone not found`
- Conflictos por políticas activas solapadas.

### Motor de precios

El motor de precios toma en cuenta:

- Tipo de vehículo.
- Clase de servicio.
- Capacidad requerida.
- Categoría solicitada.
- Ciudad o zona resuelta por ubicación.
- Distancia estimada.
- Duración estimada.
- Tarifa base.
- Costo por kilómetro.
- Costo por minuto.
- Tarifa mínima.
- Multiplicadores.
- Combustible.
- Demanda.
- Recargos fijos.
- Booking fee.
- Reglas horarias o por condiciones.

Errores esperados del pricing:

- `Service class not found`
- `No eligible vehicle type for request`
- `Invalid GeoJSON point`

---

## 3.13 Reportes

### Pantallas / Vistas Angular

Ruta base:

- `/admin/reports`

Submódulos:

- Finanzas: `/admin/reports/finance`
- Conductores: `/admin/reports/drivers`
- Vehículos: `/admin/reports/vehicles`
- Usuarios: `/admin/reports/users`
- Operaciones: `/admin/reports/operations`
- Calidad de datos: `/admin/reports/data-quality`

APIs principales:

- `/admin/reports/overview`
- `/admin/reports/finance/summary`
- `/admin/reports/finance/timeseries`
- `/admin/reports/drivers/performance`
- `/admin/reports/drivers/quality`
- `/admin/reports/drivers/activity-hours`
- `/admin/reports/vehicles/usage`
- `/admin/reports/passengers/usage`
- `/admin/reports/trips/status-summary`
- `/admin/reports/trips/cancellations`
- `/admin/reports/data-quality/settlement`

**Capturas sugeridas:**

```md
![Reporte financiero](./images/48-reportes-finanzas.png)
![Reporte de conductores](./images/49-reportes-conductores.png)
![Reporte de vehículos](./images/50-reportes-vehiculos.png)
![Reporte de usuarios](./images/51-reportes-usuarios.png)
![Reporte operativo](./images/52-reportes-operaciones.png)
![Reporte de calidad de datos](./images/53-reportes-calidad-datos.png)
```

### Acciones del usuario

El administrador puede:

1. Seleccionar período predefinido.
2. Seleccionar rango temporal.
3. Agrupar información por día, semana, mes, trimestre o año.
4. Consultar métricas financieras.
5. Analizar rendimiento de conductores.
6. Analizar uso de vehículos.
7. Analizar actividad de pasajeros.
8. Revisar estados de viajes y cancelaciones.
9. Detectar problemas de liquidación o datos incompletos.

### Presets de rango detectados

- Hoy.
- Últimos 7 días.
- Últimos 30 días.
- Últimos 3 meses.
- Últimos 6 meses.
- Último año.

### Reglas de negocio en backend

La API valida:

- Fechas válidas.
- Rango coherente.
- Agrupación soportada.
- Límites válidos para rankings o tablas.

Errores esperados:

- `Invalid "from" date`
- `Invalid "to" date`
- `from must be before to`

---

## 3.14 Flujos móviles/API relevantes no expuestos como pantallas administrativas principales

El backend contiene módulos que forman parte del ecosistema Rodando, aunque no todos tengan una pantalla administrativa directa en el frontend analizado.

### Viajes de pasajero y conductor

Incluye:

- Estimación de viaje.
- Creación de viaje.
- Matching con conductores.
- Ofertas de viaje.
- Aceptación o rechazo por el conductor.
- Estados de llegada, inicio, finalización y cancelación.
- Eventos del viaje.
- Historial y estadísticas.

Reglas relevantes:

- El conductor debe estar online y disponible.
- El conductor no debe tener otro viaje activo.
- El conductor debe tener ubicación reciente.
- El vehículo debe coincidir con el tipo requerido.
- El viaje debe encontrarse en el estado correcto para cada transición.

Errores esperados:

- `Trip is not in assigning state`
- `Driver is offline`
- `Driver not available for trips`
- `Driver is already on a trip`
- `Driver has no current vehicle`
- `Vehicle mismatch for offer`
- `Driver has no last location`

### Ubicaciones guardadas

Permite al pasajero guardar ubicaciones frecuentes como casa, trabajo u otras. Requiere usuario autenticado.

### Calificaciones de viajes

Permite registrar rating y comentarios asociados a un viaje. Sirve para indicadores de calidad.

### Notificaciones

Permite enviar o consultar mensajes del sistema vinculados a usuarios, viajes, conductores u operaciones.

### Órdenes, transacciones y planes prepago

Permiten modelar pagos, compras de planes, cargos, comisiones, recargas, penalizaciones, reembolsos y otros movimientos financieros.

---

# 4. MENSAJES DE ERROR COMUNES

## 4.1 Autenticación y sesión

| Mensaje / Código | Significado | Acción recomendada |
|---|---|---|
| `Email o contraseña inválidos` | Las credenciales no coinciden. | Revisar usuario y contraseña. |
| `La cuenta no está activa` | El usuario existe, pero no puede operar. | Activar cuenta o revisar estado. |
| `No tienes permisos para esta aplicación` | El usuario intenta entrar por una audiencia no permitida. | Usar la aplicación correcta o revisar rol. |
| `Rol inválido para este usuario` | El rol esperado no coincide con el usuario. | Confirmar que sea administrador para el panel. |
| `Token inválido o expirado` | La sesión expiró o el token no es válido. | Iniciar sesión nuevamente. |
| `Refresh token inválido o revocado` | No se pudo renovar la sesión. | Volver a autenticarse. |
| `Account is temporarily locked` | Hubo demasiados intentos fallidos. | Esperar el tiempo de bloqueo o solicitar soporte. |
| `Admins only` | La operación requiere rol administrador. | Usar usuario administrador. |

## 4.2 Usuarios

| Mensaje / Código | Significado | Acción recomendada |
|---|---|---|
| `USER_NOT_FOUND` | No existe el usuario solicitado. | Verificar ID o actualizar listado. |
| `MISSING_CONTACT` | Falta correo o teléfono. | Informar al menos un dato de contacto. |
| `EMAIL_CONFLICT` | El correo ya está registrado. | Usar otro correo. |
| `PHONE_CONFLICT` | El teléfono ya está registrado. | Usar otro teléfono. |
| `LOCAL_CREDENTIALS_NOT_FOUND` | El usuario no tiene credenciales locales. | Revisar método de autenticación. |
| `INVALID_CURRENT_PASSWORD` | La contraseña actual no coincide. | Corregir contraseña actual. |
| `PASSWORD_REUSE_NOT_ALLOWED` | La nueva contraseña es igual a la anterior. | Usar una contraseña diferente. |
| `PROFILE_UPDATE_ERROR` | Falló la actualización de perfil. | Revisar datos y reintentar. |
| `PASSWORD_UPDATE_ERROR` | Falló el cambio de contraseña. | Reintentar o contactar soporte. |

## 4.3 Conductores y vehículos

| Mensaje / Código | Significado | Acción recomendada |
|---|---|---|
| `DRIVER_NOT_FOUND` | No existe el conductor. | Verificar conductor seleccionado. |
| `USER_IS_NOT_DRIVER` | El usuario no tiene rol de conductor. | Seleccionar o crear usuario conductor. |
| `El driver ya posee una wallet.` | Se intentó crear billetera duplicada. | Revisar conductor existente. |
| Validación de licencia | Falta o es inválida la licencia. | Completar licencia y fecha de expiración. |
| Validación de vehículo | Faltan tipo, placa, marca, modelo, año o capacidad. | Completar datos obligatorios. |
| URL inválida | Una imagen o icono no tiene URL válida. | Corregir URL. |

## 4.4 Billetera y recaudación

| Mensaje / Código | Significado | Acción recomendada |
|---|---|---|
| `WALLET_NOT_FOUND` | No existe billetera para el conductor. | Crear o revisar onboarding del conductor. |
| `WALLET_BLOCKED` | La billetera está bloqueada. | Desbloquear si procede. |
| `INVALID_AMOUNT` | El monto es inválido. | Ingresar monto mayor que cero. |
| `INVALID_COMMISSION_AMOUNT` | Comisión inválida. | Revisar cálculo de comisión. |
| `CURRENCY_MISMATCH` | La moneda no coincide con la billetera. | Usar la moneda correcta. |
| `COLLECTION_POINT_NOT_FOUND` | No existe el punto de recaudación. | Seleccionar punto válido. |
| `COLLECTION_POINT_INACTIVE` | El punto está inactivo. | Activar punto o seleccionar otro. |
| `CCR_ALREADY_EXISTS` | Ya existe registro de recaudación para la transacción. | Evitar duplicar la operación. |
| `CCR_NOT_FOUND` | No existe el registro de recaudación. | Verificar registro. |
| `CCR_WITHOUT_DRIVER` | Registro sin conductor asociado. | Revisar integridad del registro. |
| `CCR_WITHOUT_TX` | Registro sin transacción asociada. | Revisar integridad financiera. |
| `CCR_COMPLETED_NO_MOVEMENT` | Registro completado sin movimiento de billetera. | Revisar liquidación. |

## 4.5 Geografía

| Mensaje / Código | Significado | Acción recomendada |
|---|---|---|
| `City not found` | No existe la ciudad. | Seleccionar ciudad válida. |
| `City already exists (name + countryCode)` | Ciudad duplicada por nombre y país. | Usar otro nombre o país. |
| `countryCode must be ISO-3166-1 alpha-2` | Código de país inválido. | Usar código de dos letras, por ejemplo `CU`. |
| `timezone must be valid IANA` | Zona horaria inválida. | Usar formato como `America/Havana`. |
| `Zone not found` | No existe la zona. | Seleccionar zona válida. |
| `Zone already exists in this city` | Zona duplicada en la ciudad. | Cambiar nombre o ciudad. |
| `geom is required` | Falta geometría. | Informar GeoJSON válido. |
| `geom cannot be null` | La geometría no puede ser nula. | Informar MultiPolygon. |
| `geom must be valid GeoJSON MultiPolygon` | Formato GeoJSON incorrecto. | Usar GeoJSON `MultiPolygon`. |

## 4.6 Viajes

| Mensaje / Código | Significado | Acción recomendada |
|---|---|---|
| `Trip not found` | No existe el viaje. | Actualizar monitor o verificar ID. |
| `Cannot retry matching from status=...` | No se puede reintentar matching desde ese estado. | Revisar estado del viaje. |
| `Trip cannot be cancelled from status=...` | El viaje no admite cancelación administrativa. | Revisar si ya finalizó. |
| `Admin cancellation reason is required` | Falta motivo de cancelación. | Escribir motivo. |
| `Admin cannot override trip to status=...` | Estado destino no permitido. | Seleccionar estado válido. |
| `Trip is already final with status=...` | El viaje ya está finalizado. | No modificar estado final. |
| `Trip cannot be moved to ... without assigned driver` | Falta conductor para ese estado. | Asignar conductor o usar otro estado. |
| `Trip has no passenger` | No hay pasajero asociado. | Revisar viaje. |
| `Trip has no driver` | No hay conductor asociado. | Enviar solo al pasajero o revisar asignación. |
| `Trip has no driver to notify` | No se puede notificar a conductor inexistente. | Cambiar destinatario. |

## 4.7 Matching y disponibilidad

| Mensaje / Código | Significado | Acción recomendada |
|---|---|---|
| `Trip is not in assigning state` | El viaje no está listo para asignación. | Revisar estado. |
| `Driver is offline` | El conductor no está conectado. | Esperar disponibilidad o seleccionar otro. |
| `Driver not available for trips` | El conductor no acepta viajes. | Revisar disponibilidad. |
| `Driver has availability reason set` | Hay motivo de no disponibilidad. | Revisar estado operativo. |
| `Driver is already on a trip` | El conductor tiene viaje activo. | Esperar finalización. |
| `Driver has no current vehicle` | No hay vehículo actual asociado. | Asignar vehículo. |
| `Vehicle mismatch for offer` | El vehículo no coincide con la solicitud. | Revisar tipo/categoría/clase. |
| `Driver has no last location` | No hay ubicación reciente. | Esperar ping de ubicación. |

## 4.8 Políticas de precio y configuración

| Mensaje / Código | Significado | Acción recomendada |
|---|---|---|
| `Price policy not found` | No existe la política. | Verificar ID. |
| `effectiveTo must be > effectiveFrom` | La fecha final debe ser posterior. | Corregir vigencia. |
| `cityId is required for CITY` | Política de ciudad sin ciudad. | Seleccionar ciudad. |
| `zoneId is required for ZONE` | Política de zona sin zona. | Seleccionar zona. |
| `City not found` | Ciudad inexistente. | Seleccionar ciudad válida. |
| `Zone not found` | Zona inexistente. | Seleccionar zona válida. |
| `Service class not found` | Clase de servicio no existe. | Revisar clase en flota. |
| `No eligible vehicle type for request` | No hay vehículo que cumpla la solicitud. | Revisar capacidad, categoría o clase. |
| `Invalid GeoJSON point` | Punto geográfico inválido. | Corregir coordenadas. |
| `System setting not found` | Configuración inexistente. | Verificar clave. |
| `System setting key already exists` | Clave duplicada. | Usar clave única. |
| `Setting value must be a valid number` | El valor no es numérico. | Corregir tipo. |
| `Setting value must be a JSON object` | JSON inválido. | Corregir formato JSON. |

## 4.9 Reportes

| Mensaje / Código | Significado | Acción recomendada |
|---|---|---|
| `Invalid "from" date` | Fecha inicial inválida. | Corregir fecha. |
| `Invalid "to" date` | Fecha final inválida. | Corregir fecha. |
| `from must be before to` | Rango temporal invertido. | Asegurar que inicio sea anterior al fin. |

---

# 5. GLOSARIO DE TÉRMINOS

| Término | Definición |
|---|---|
| Administrador | Usuario con rol `admin` que accede al panel web. |
| Pasajero | Usuario con rol `passenger` que solicita viajes. |
| Conductor | Usuario con rol `driver` que acepta y realiza viajes. |
| Audiencia | Aplicación o contexto desde el cual se inicia sesión: panel admin, app conductor, app pasajero o API. |
| Sesión web | Sesión usada por el panel administrativo. |
| Usuario | Entidad base del sistema con nombre, contacto, tipo y estado. |
| Estado de usuario | Situación de la cuenta: `active`, `inactive`, `banned`. |
| Perfil de conductor | Datos específicos del conductor: licencia, aprobación, antecedentes, estado operativo y contacto de emergencia. |
| Estado del conductor | Estado operativo: activo, suspendido, vacaciones, pendiente de documentos o desactivado. |
| Revisión de antecedentes | Estado de validación documental o de seguridad del conductor. |
| Disponibilidad del conductor | Indica si un conductor está online, disponible, ocupado o fuera de servicio. |
| Última ubicación | Último punto geográfico reportado por el conductor. |
| Vehículo | Unidad física asociada a un conductor. |
| Categoría de vehículo | Agrupación general de vehículos, por ejemplo auto, moto, van u otra clasificación. |
| Tipo de vehículo | Configuración específica con tarifas base, capacidad y clases asociadas. |
| Clase de servicio | Nivel de servicio que aplica multiplicadores de precio y reglas de capacidad. |
| Ciudad | Área urbana de operación, asociada a país, zona horaria y geometría opcional. |
| Zona | Área geográfica dentro de una ciudad, con prioridad y geometría obligatoria. |
| GeoJSON | Formato estándar para representar geometrías geográficas. |
| MultiPolygon | Tipo de geometría GeoJSON usado para áreas compuestas por uno o más polígonos. |
| Punto de recaudación | Lugar o entidad donde se registran cobros/recargas en efectivo. |
| Registro de recaudación | Evidencia de una operación de recaudación vinculada a conductor, punto y transacción. |
| Billetera de conductor | Cuenta financiera interna donde se registran saldos, recargas, comisiones y movimientos. |
| Movimiento de billetera | Registro de crédito, débito o ajuste con saldo anterior y nuevo. |
| Saldo actual | Monto disponible en billetera. |
| Saldo retenido | Monto reservado o bloqueado temporalmente. |
| Límite negativo | Margen permitido para que un conductor opere con saldo por debajo de cero. |
| Política de precio | Regla que modifica o define componentes de tarifa según alcance, vigencia y condiciones. |
| Alcance global | Política que aplica a todo el sistema. |
| Alcance ciudad | Política que aplica a una ciudad específica. |
| Alcance zona | Política que aplica a una zona específica. |
| Prioridad de política | Valor usado para decidir qué política prevalece cuando varias podrían aplicar. |
| Vigencia | Intervalo de fechas en el que una política está activa. |
| Motor de precios | Servicio que calcula tarifa considerando vehículo, clase, distancia, tiempo, reglas y multiplicadores. |
| Tarifa base | Monto inicial de un viaje antes de sumar distancia/tiempo. |
| Costo por kilómetro | Componente variable por distancia. |
| Costo por minuto | Componente variable por duración. |
| Tarifa mínima | Monto mínimo que debe cobrarse por viaje. |
| Multiplicador | Factor que incrementa o reduce componentes de precio. |
| Demanda | Factor operativo que puede modificar precios por disponibilidad o saturación. |
| Combustible | Parámetro que puede impactar el cálculo de tarifa. |
| Viaje | Solicitud de transporte desde un origen hacia un destino, con pasajero, estado, tarifa y eventos. |
| Matching | Proceso de búsqueda y oferta de un viaje a conductores elegibles. |
| Asignación de viaje | Oferta enviada a un conductor para aceptar o rechazar un viaje. |
| Evento de viaje | Registro histórico de cambios o acciones ocurridas durante el ciclo de vida del viaje. |
| Viaje pendiente | Viaje creado pero aún sin proceso efectivo de asignación. |
| Viaje en asignación | Viaje buscando conductor. |
| Viaje aceptado | Conductor aceptó la oferta. |
| Conductor en camino | Estado previo al inicio del viaje. |
| Viaje en curso | El pasajero está siendo trasladado. |
| Viaje completado | Viaje finalizado correctamente. |
| Viaje cancelado | Viaje interrumpido antes de completarse. |
| Sin conductores | No se encontraron conductores disponibles. |
| Liquidación | Proceso financiero que distribuye ingresos, comisiones y ganancias. |
| Calidad de datos | Indicadores que detectan viajes o registros con información financiera incompleta. |
| Configuración del sistema | Parámetro clave/valor que controla comportamiento general, pricing, comisiones, pagos o viajes. |
| Configuración secreta | Parámetro sensible que no debería mostrarse completamente en pantalla. |
| Reporte financiero | Vista agregada de ingresos, ganancias, comisiones y liquidación. |
| Reporte operativo | Vista sobre estados, cancelaciones, actividad y comportamiento de la operación. |
| Plan prepago | Producto o paquete financiero adquirido por un usuario. |
| Orden | Registro de compra, pago o solicitud financiera. |
| Transacción | Movimiento económico formal: cargo, recarga, comisión, reembolso, penalización u otro. |
| Notificación | Mensaje generado por el sistema para usuario, conductor o pasajero. |
| Ubicación guardada | Dirección frecuente almacenada por el pasajero. |
| Calificación de viaje | Evaluación del servicio realizada después de un viaje. |

---

# Anexo A. Guía rápida para insertar capturas

Para completar el manual con imágenes reales del frontend, se recomienda crear una carpeta `images` junto al archivo Markdown y guardar las capturas con los nombres sugeridos.

Ejemplo de estructura:

```txt
manual_usuario_rodando.md
images/
  01-login-administrativo.png
  02-layout-admin-menu.png
  03-dashboard-general.png
  04-usuarios-listado.png
  ...
```

Recomendaciones:

1. Usar capturas limpias, sin datos sensibles reales.
2. Preferir resolución 1440px o superior para vistas de escritorio.
3. Incluir capturas móviles solo si el panel tiene diseño responsive relevante.
4. Mantener consistencia de tema visual, preferiblemente modo claro si será impreso.
5. Ocultar tokens, correos reales, teléfonos reales, direcciones y datos financieros sensibles.
6. En formularios, usar datos de prueba.
7. En reportes, usar períodos y cifras demostrativas.

---

# Anexo B. Mapa resumido de módulos frontend/backend

| Módulo frontend | Ruta Angular | Endpoints backend principales |
|---|---|---|
| Autenticación | `/auth/login` | `/auth/login`, `/auth/refresh`, `/auth/logout` |
| Dashboard | `/admin/dashboard` | `/admin/reports/*` |
| Usuarios | `/admin/users` | `/admin/users`, `/users/profile` |
| Conductores | `/admin/drivers` | `/drivers`, `/admin/users`, `/vehicles`, `/drivers-balance` |
| Billetera de conductor | `/admin/drivers/:id/wallet` | `/drivers-balance/:driverId`, `/admin/driver-wallets/:driverId/movements` |
| Vehículos | `/admin/fleet/vehicles` | `/vehicles` |
| Categorías | `/admin/fleet/categories` | `/vehicle-categories` |
| Tipos de vehículos | `/admin/fleet/vehicle-types` | `/vehicle-types` |
| Clases de servicio | `/admin/fleet/service-classes` | `/vehicle-service-classes` |
| Ciudades | `/admin/geography/cities` | `/cities` |
| Zonas | `/admin/geography/zones` | `/zones` |
| Puntos de recaudación | `/admin/cash-collection-points` | `/cash-collection-points` |
| Viajes | `/admin/trips` | `/admin/trips/*` |
| Configuración | `/admin/system-settings` | `/system-settings` |
| Políticas de precio | `/admin/price-policies` | `/price-policies` |
| Reportes | `/admin/reports` | `/admin/reports/*` |

---

# Anexo C. Recomendaciones de uso operativo

1. **Antes de activar conductores**, validar usuario base, licencia, antecedentes, vehículo inicial y billetera.
2. **Antes de activar políticas de precio**, probarlas en el simulador y verificar que no solapen indebidamente con políticas existentes.
3. **Antes de registrar recargas**, confirmar que el punto de recaudación esté activo y que la moneda coincida con la billetera.
4. **Durante monitoreo de viajes**, priorizar alertas de matching prolongado, viajes en curso excesivos y viajes con atención administrativa.
5. **En reportes financieros**, revisar periódicamente la calidad de liquidación para detectar viajes sin settlement.
6. **En configuración**, tratar parámetros secretos o financieros con control estricto y evitar cambios sin validación previa.
7. **En geografía**, validar GeoJSON antes de guardar ciudades o zonas, porque errores geométricos pueden afectar pricing, matching y resolución territorial.
8. **En seguridad**, alinear los permisos declarados en Angular con guards/decoradores efectivos en NestJS para que el backend refuerce las restricciones del panel.

---

**Fin del manual.**
