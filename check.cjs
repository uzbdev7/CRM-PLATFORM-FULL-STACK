const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const teachers = await prisma.teacher.findMany();
    console.log("=== TEACHERS ===");
    console.log(teachers.map(t => ({email: t.email, pass: t.password})));

    const users = await prisma.user.findMany();
    console.log("=== USERS ===");
    console.log(users.map(u => ({email: u.email, pass: u.password})));
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
