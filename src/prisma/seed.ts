import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') }); // root .env ni topadi

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'mengilovahrorbek5@gmail.com' },
  });

  if (existingAdmin) {
    console.log('⚠️ Admin allaqachon mavjud!');
    return;
  }

  const hashedPassword = await bcrypt.hash('Axrorbek123!', 10);

  const admin = await prisma.user.create({
    data: {
      fullName: 'Axrorbek Mengilov',
      email: 'mengilovahrorbek5@gmail.com',
      password: hashedPassword,
      role: 'ADMIN',
      hire_date: new Date(),
    },
  });

  console.log('✅ Admin yaratildi:', admin.email);
}

