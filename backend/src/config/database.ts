import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  // Construir URL de conexión SQL Server desde variables individuales
  const server = process.env.DB_SERVER || 'localhost';
  const port = process.env.DB_PORT || '1433';
  const database = process.env.DB_NAME || 'Reserva_salas';
  const user = process.env.DB_USER || 'sa';
  const password = process.env.DB_PASSWORD || '';
  
  // Si ya tiene DATABASE_URL, usarla directamente
  let url = process.env.DATABASE_URL;
  
  if (!url) {
    // Construir URL para SQL Server
    url = `sqlserver://${server}:${port};database=${database};user=${user};password=${password};encrypt=false;trustServerCertificate=true`;
  }

  return new PrismaClient({
    datasources: {
      db: {
        url: url,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
