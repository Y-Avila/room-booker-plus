import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create admin user
  const passwordHash = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password_hash: passwordHash,
      email: 'admin@roombooker.com',
      is_active: true,
    },
  });
  console.log('✅ Admin created:', admin.username);

  // Create rooms
  const rooms = [
    {
      name: 'Sala de Conferencias Principal',
      capacity: 20,
      location: 'Piso 1, Torre A',
      equipment: JSON.stringify(['Proyector', 'Pantalla', 'Video Conference', 'Pizarra']),
      image_url: null,
      observations: 'Sala grande para reuniones generales',
      available_days: JSON.stringify([1, 2, 3, 4, 5]),
      available_start: '07:00',
      available_end: '20:00',
    },
    {
      name: 'Sala de Reuniones Pequeña',
      capacity: 6,
      location: 'Piso 1, Torre A',
      equipment: JSON.stringify(['Proyector', 'Pizarra']),
      image_url: null,
      observations: 'Ideal para reuniones rápidas',
      available_days: JSON.stringify([1, 2, 3, 4, 5]),
      available_start: '07:00',
      available_end: '20:00',
    },
    {
      name: 'Sala de Entrenamiento',
      capacity: 30,
      location: 'Piso 2, Torre A',
      equipment: JSON.stringify(['Proyector', 'Pantalla', 'Computadoras', 'Aire Acondicionado']),
      image_url: null,
      observations: 'Equipamiento completo para capacitaciones',
      available_days: JSON.stringify([1, 2, 3, 4, 5]),
      available_start: '08:00',
      available_end: '18:00',
    },
    {
      name: 'Sala VIP',
      capacity: 8,
      location: 'Piso 3, Torre A',
      equipment: JSON.stringify(['Proyector', 'Video Conference', 'Minibar']),
      image_url: null,
      observations: 'Sala ejecutiva con servicios premium',
      available_days: JSON.stringify([1, 2, 3, 4, 5]),
      available_start: '07:00',
      available_end: '21:00',
    },
  ];

  for (const room of rooms) {
    const created = await prisma.room.upsert({
      where: { id: room.name },
      update: room,
      create: room,
    });
    console.log('✅ Room created:', created.name);
  }

  console.log('🎉 Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
