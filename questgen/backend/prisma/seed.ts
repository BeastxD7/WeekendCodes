import { PrismaClient, UserRole, QuestionType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Seeding database...');

    // Create admin user
    const adminPassword = await bcrypt.hash('Admin123!', 10);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@questgen.com' },
      update: {},
      create: {
        email: 'admin@questgen.com',
        name: 'Admin User',
        password: adminPassword,
        role: UserRole.ADMIN,
      },
    });
    console.log('Admin user created:', admin.email);

    // Create regular user
    const userPassword = await bcrypt.hash('User123!', 10);
    const user = await prisma.user.upsert({
      where: { email: 'user@questgen.com' },
      update: {},
      create: {
        email: 'user@questgen.com',
        name: 'Regular User',
        password: userPassword,
        role: UserRole.USER,
      },
    });
    console.log('Regular user created:', user.email);

    // Create a sample quiz
    const quiz = await prisma.quiz.create({
      data: {
        title: 'Sample Programming Quiz',
        description: 'Test your knowledge of programming concepts',
        timeLimit: 15,
        published: true,
        creator: {
          connect: { id: admin.id },
        },
      },
    });
    console.log('Sample quiz created:', quiz.title);

    // Create questions for the quiz
    const question1 = await prisma.question.create({
      data: {
        content: 'What is JavaScript?',
        type: QuestionType.MULTIPLE_CHOICE,
        points: 10,
        order: 1,
        quiz: {
          connect: { id: quiz.id },
        },
        options: {
          create: [
            {
              content: 'A programming language',
              isCorrect: true,
            },
            {
              content: 'A markup language',
              isCorrect: false,
            },
            {
              content: 'A database',
              isCorrect: false,
            },
            {
              content: 'An operating system',
              isCorrect: false,
            },
          ],
        },
      },
    });
    console.log('Question 1 created:', question1.content);

    const question2 = await prisma.question.create({
      data: {
        content: 'What does HTML stand for?',
        type: QuestionType.MULTIPLE_CHOICE,
        points: 10,
        order: 2,
        quiz: {
          connect: { id: quiz.id },
        },
        options: {
          create: [
            {
              content: 'Hyper Text Markup Language',
              isCorrect: true,
            },
            {
              content: 'High Tech Modern Language',
              isCorrect: false,
            },
            {
              content: 'Hyper Transfer Markup Language',
              isCorrect: false,
            },
            {
              content: 'Home Tool Markup Language',
              isCorrect: false,
            },
          ],
        },
      },
    });
    console.log('Question 2 created:', question2.content);

    const question3 = await prisma.question.create({
      data: {
        content: 'Explain the concept of closures in JavaScript.',
        type: QuestionType.SHORT_ANSWER,
        points: 20,
        order: 3,
        quiz: {
          connect: { id: quiz.id },
        },
      },
    });
    console.log('Question 3 created:', question3.content);

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();