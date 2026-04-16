import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { hashSync } from "bcryptjs";

function createDb() {
  const tursoUrl = process.env.TURSO_URL;

  if (tursoUrl) {
    const adapter = new PrismaLibSql({
      url: tursoUrl,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    });
    return new PrismaClient({ adapter });
  }

  return new PrismaClient();
}

const db = createDb();

async function seed() {
  console.log("🌱 Seeding database with your portfolio data...");

  const adminPassword = hashSync("admin123", 10);
  await db.adminUser.upsert({
    where: { username: "admin" },
    update: {},
    create: { username: "admin", password: adminPassword },
  });
  console.log("✅ Admin user created (admin / admin123)");

  await db.profile.upsert({
    where: { id: "main-profile" },
    update: {},
    create: {
      id: "main-profile",
      name: "Akshat Gupta",
      title: "AI & ML Engineer",
      tagline: "B.Tech AI/ML | Computer Vision, NLP & LLM Applications",
      bio: "AI/ML undergraduate with hands-on experience in building real-world AI systems across Computer Vision and Natural Language Processing.",
      email: "akshatgarg876@gmail.com",
      phone: "+91 97181 83307",
      location: "Delhi, India",
      github: "https://github.com/DORAEMONBHAIYA",
      linkedin: "https://www.linkedin.com/in/akshat-gupta001",
      resume: "/resume.pdf",
      leetcode: "https://leetcode.com/u/Akshat_Gupta01",
      titles: "AI/ML Engineer,Full-Stack Developer,Deep Learning Researcher",
    },
  });
  console.log("✅ Profile created");

  const categories = [
    { name: "Languages", order: 0 },
    { name: "Machine Learning", order: 1 },
    { name: "Deep Learning", order: 2 },
    { name: "Libraries & Frameworks", order: 3 },
    { name: "Computer Vision", order: 4 },
    { name: "NLP", order: 5 },
    { name: "AI & LLM", order: 6 },
    { name: "Databases & Tools", order: 7 },
  ];
  for (const cat of categories) {
    await db.skillCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }
  console.log("✅ Skill categories created");

  const skills = [
    { name: "Python", level: 92, category: "Languages", order: 1 },
    { name: "C", level: 75, category: "Languages", order: 2 },
    { name: "C++", level: 78, category: "Languages", order: 3 },
    {
      name: "Supervised Learning",
      level: 85,
      category: "Machine Learning",
      order: 1,
    },
    {
      name: "Unsupervised Learning",
      level: 78,
      category: "Machine Learning",
      order: 2,
    },
    { name: "Regression", level: 82, category: "Machine Learning", order: 3 },
    {
      name: "Classification",
      level: 85,
      category: "Machine Learning",
      order: 4,
    },
    {
      name: "Feature Engineering",
      level: 80,
      category: "Machine Learning",
      order: 5,
    },
    { name: "Neural Networks", level: 82, category: "Deep Learning", order: 1 },
    { name: "CNN", level: 90, category: "Deep Learning", order: 2 },
    { name: "RNN", level: 72, category: "Deep Learning", order: 3 },
    { name: "LSTM", level: 70, category: "Deep Learning", order: 4 },
    { name: "NumPy", level: 88, category: "Libraries & Frameworks", order: 1 },
    { name: "Pandas", level: 85, category: "Libraries & Frameworks", order: 2 },
    {
      name: "Scikit-learn",
      level: 85,
      category: "Libraries & Frameworks",
      order: 3,
    },
    {
      name: "TensorFlow",
      level: 75,
      category: "Libraries & Frameworks",
      order: 4,
    },
    { name: "OpenCV", level: 90, category: "Computer Vision", order: 1 },
    {
      name: "Image Processing",
      level: 85,
      category: "Computer Vision",
      order: 2,
    },
    {
      name: "Face Recognition",
      level: 88,
      category: "Computer Vision",
      order: 3,
    },
    { name: "TF-IDF", level: 80, category: "NLP", order: 1 },
    { name: "Bag of Words", level: 78, category: "NLP", order: 2 },
    { name: "CBoW", level: 75, category: "NLP", order: 3 },
    { name: "N-grams", level: 78, category: "NLP", order: 4 },
    { name: "Text Preprocessing", level: 85, category: "NLP", order: 5 },
    { name: "LLM APIs", level: 82, category: "AI & LLM", order: 1 },
    { name: "Prompt Engineering", level: 80, category: "AI & LLM", order: 2 },
    { name: "AI Agents", level: 78, category: "AI & LLM", order: 3 },
    { name: "MongoDB", level: 75, category: "Databases & Tools", order: 1 },
    { name: "MySQL", level: 72, category: "Databases & Tools", order: 2 },
    { name: "Git", level: 80, category: "Databases & Tools", order: 3 },
    { name: "GitHub", level: 82, category: "Databases & Tools", order: 4 },
    {
      name: "Jupyter Notebook",
      level: 88,
      category: "Databases & Tools",
      order: 5,
    },
    { name: "VS Code", level: 90, category: "Databases & Tools", order: 6 },
  ];
  for (const skill of skills) {
    await db.skill.create({ data: skill });
  }
  console.log("✅ Skills created");

  const projects = [
    {
      title: "AI-Powered FAQ Generator (Multi-Agent System)",
      description:
        "Multi-agent AI system that automatically generates FAQs from user-uploaded documents using LLM APIs, with MongoDB caching and PDF/DOCX export.",
      techStack: "Python, LLM APIs (DeepSeek), MongoDB, Multi-Agent Systems",
      github: "https://github.com/DORAEMONBHAIYA",
      featured: true,
      order: 1,
    },
    {
      title: "Smart Student Identification System",
      description:
        "CNN-based face recognition system for automated student attendance marking, achieving ~91% accuracy on 500+ images.",
      techStack: "Python, CNN, OpenCV, MongoDB",
      github: "https://github.com/DORAEMONBHAIYA",
      featured: true,
      order: 2,
    },
    {
      title: "Virtual AI Voice Assistant",
      description:
        "AI-powered voice assistant with speech-to-text, text-to-speech, NLP command processing, and integrated API functionalities.",
      techStack: "Python, Speech Recognition, NLP, Text-to-Speech, APIs",
      github: "https://github.com/DORAEMONBHAIYA",
      featured: true,
      order: 3,
    },
  ];
  for (const project of projects) {
    await db.project.create({ data: project });
  }
  console.log("✅ Projects created");

  const experiences = [
    {
      company: "Anveshan — AIU-Level Student Research Competition",
      role: "Presenter",
      description:
        "Presented a Multilingual Text Summarization project at Anveshan.",
      startDate: "2024",
      endDate: "2024",
      current: false,
      techStack: "NLP, Python",
      order: 1,
    },
    {
      company: "KRAFTON x TGELF — All-India Competition",
      role: "Finalist",
      description:
        "Selected as a finalist in an All-India Game Development Competition.",
      startDate: "2024",
      endDate: "2024",
      current: false,
      techStack: "Game Development",
      order: 2,
    },
  ];
  for (const exp of experiences) {
    await db.experience.create({ data: exp });
  }
  console.log("✅ Experience created");

  const educations = [
    {
      institution: "Manav Rachna University, Faridabad",
      degree: "B.Tech",
      field: "Artificial Intelligence & Machine Learning",
      startDate: "Aug 2023",
      endDate: "Present",
      order: 1,
    },
    {
      institution: "Coding Blocks",
      degree: "Certification",
      field: "Full Stack Web Development",
      startDate: "2023",
      endDate: "2023",
      order: 2,
    },
  ];
  for (const edu of educations) {
    await db.education.create({ data: edu });
  }
  console.log("✅ Education created");

  const achievements = [
    {
      title: "Anveshan — AIU-Level Research Competition",
      date: "2024",
      techStack: "NLP, Python",
      order: 0,
    },
    {
      title: "KRAFTON x TGELF — Game Dev Finalist",
      date: "2024",
      techStack: "Game Development",
      order: 1,
    },
  ];
  for (const ach of achievements) {
    await db.achievement.create({ data: ach });
  }
  console.log("✅ Achievements created");

  const heroStats = [
    { label: "Years Experience", value: "3+", icon: "briefcase", order: 0 },
    { label: "Projects", value: "6+", icon: "folder", order: 1 },
    { label: "Technologies", value: "5+", icon: "cpu", order: 2 },
    { label: "Publications", value: "3+", icon: "book", order: 3 },
  ];
  for (const stat of heroStats) {
    await db.heroStat.create({ data: stat });
  }
  console.log("✅ Hero stats created");

  console.log("");
  console.log("🎉 All data seeded successfully!");
  console.log("🔐 Admin: admin / admin123");
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
