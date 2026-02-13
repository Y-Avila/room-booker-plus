# Room Booker Plus - Backend

API REST para el sistema de reservación de salas de reuniones.

## Requisitos

- Node.js 18+
- SQL Server (servidor propio o Azure SQL)

## Configuración

1. Clonar el repositorio y entrar al directorio del backend:
   ```bash
   cd backend
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Copiar el archivo de variables de entorno:
   ```bash
   cp .env.example .env
   ```

4. Editar `.env` con tus configuraciones de base de datos y otros secrets

5. Generar el cliente de Prisma:
   ```bash
   npm run prisma:generate
   ```

6. Ejecutar migraciones (crear tablas):
   ```bash
   npm run prisma:migrate dev --name init
   ```

7. Poblar datos iniciales:
   ```bash
   npm run seed
   ```

## Desarrollo

Iniciar el servidor en modo desarrollo:
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

## Deployment

### Servidor Propio
1. Instalar Node.js en el servidor
2. Clonar el repositorio
3. Configurar `.env` con la IP del servidor SQL
4. Ejecutar migraciones
5. Usar PM2 para mantener el servicio:
   ```bash
   npm install -g pm2
   pm2 start dist/index.js --name room-booker
   ```

### Railway/Render
1. Configurar las variables de entorno en el hosting
2. Conectar repositorio GitHub

## Usuarios por defecto

Después de ejecutar el seed:
- **Usuario**: admin
- **Contraseña**: admin123

## API Endpoints

### Salas
- `GET /api/rooms` - Listar todas las salas
- `GET /api/rooms/:id` - Detalle de una sala
- `POST /api/rooms` - Crear sala
- `PUT /api/rooms/:id` - Actualizar sala
- `PUT /api/rooms/:id/block` - Bloquear sala
- `PUT /api/rooms/:id/unblock` - Desbloquear sala

### Reservas
- `GET /api/bookings` - Listar reservas (con filtros)
- `GET /api/bookings/calendar` - Calendario por semana
- `POST /api/bookings` - Crear reserva
- `GET /api/bookings/:id` - Detalle de reserva
- `PUT /api/bookings/:id/approve` - Aprobar reserva
- `PUT /api/bookings/:id/reject` - Rechazar reserva
- `PUT /api/bookings/:id/cancel` - Cancelar reserva (admin)
- `POST /api/bookings/:id/cancel-user` - Cancelar reserva (usuario)

### Autenticación
- `POST /api/auth/login` - Login de administrador
- `POST /api/auth/verify` - Verificar token JWT

## Tecnologías

- Node.js + Express
- TypeScript
- Prisma ORM
- SQL Server
- JWT para autenticación
- Nodemailer para emails

## Seguridad

⚠️ **Importante**: El archivo `.env` contiene información sensible y NO debe subirse al repositorio. El archivo `.gitignore` ya está configurado para excluirlo.
