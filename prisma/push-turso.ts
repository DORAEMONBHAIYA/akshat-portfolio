import { createClient } from "@libsql/client";

async function pushSchema() {
  const url = process.env.TURSO_URL;
  const token = process.env.DATABASE_AUTH_TOKEN;

  if (!url) {
    console.error("❌ TURSO_URL not set. Run:");
    console.error('$env:TURSO_URL = "libsql://your-db.turso.io"');
    process.exit(1);
  }

  console.log("🔄 Connecting to Turso...");
  const client = createClient({ url, authToken: token });

  const statements = [
    `CREATE TABLE IF NOT EXISTS "Profile" ("id" TEXT NOT NULL PRIMARY KEY, "name" TEXT NOT NULL DEFAULT 'Developer', "title" TEXT NOT NULL DEFAULT 'AI/ML Engineer', "tagline" TEXT NOT NULL DEFAULT 'Building intelligent systems', "bio" TEXT NOT NULL DEFAULT '', "avatar" TEXT NOT NULL DEFAULT '', "email" TEXT NOT NULL DEFAULT '', "phone" TEXT NOT NULL DEFAULT '', "location" TEXT NOT NULL DEFAULT '', "website" TEXT NOT NULL DEFAULT '', "github" TEXT NOT NULL DEFAULT '', "linkedin" TEXT NOT NULL DEFAULT '', "twitter" TEXT NOT NULL DEFAULT '', "resume" TEXT NOT NULL DEFAULT '', "leetcode" TEXT NOT NULL DEFAULT '', "heroImage" TEXT NOT NULL DEFAULT '', "titles" TEXT NOT NULL DEFAULT 'AI/ML Engineer,Full-Stack Developer,Deep Learning Researcher', "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS "SkillCategory" ("id" TEXT NOT NULL PRIMARY KEY, "name" TEXT NOT NULL, "order" INTEGER NOT NULL DEFAULT 0, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "SkillCategory_name_key" ON "SkillCategory"("name")`,
    `CREATE TABLE IF NOT EXISTS "Skill" ("id" TEXT NOT NULL PRIMARY KEY, "name" TEXT NOT NULL, "level" INTEGER NOT NULL DEFAULT 80, "category" TEXT NOT NULL DEFAULT 'Programming', "icon" TEXT NOT NULL DEFAULT '', "order" INTEGER NOT NULL DEFAULT 0, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS "ProjectCategory" ("id" TEXT NOT NULL PRIMARY KEY, "name" TEXT NOT NULL, "slug" TEXT NOT NULL, "description" TEXT NOT NULL DEFAULT '', "order" INTEGER NOT NULL DEFAULT 0, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "ProjectCategory_name_key" ON "ProjectCategory"("name")`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "ProjectCategory_slug_key" ON "ProjectCategory"("slug")`,
    `CREATE TABLE IF NOT EXISTS "Project" ("id" TEXT NOT NULL PRIMARY KEY, "title" TEXT NOT NULL, "description" TEXT NOT NULL DEFAULT '', "longDesc" TEXT NOT NULL DEFAULT '', "image" TEXT NOT NULL DEFAULT '', "techStack" TEXT NOT NULL DEFAULT '', "github" TEXT NOT NULL DEFAULT '', "liveUrl" TEXT NOT NULL DEFAULT '', "featured" BOOLEAN NOT NULL DEFAULT false, "order" INTEGER NOT NULL DEFAULT 0, "categoryId" TEXT, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL, FOREIGN KEY ("categoryId") REFERENCES "ProjectCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE)`,
    `CREATE TABLE IF NOT EXISTS "Experience" ("id" TEXT NOT NULL PRIMARY KEY, "company" TEXT NOT NULL, "role" TEXT NOT NULL, "description" TEXT NOT NULL DEFAULT '', "startDate" TEXT NOT NULL DEFAULT '', "endDate" TEXT NOT NULL DEFAULT '', "current" BOOLEAN NOT NULL DEFAULT false, "techStack" TEXT NOT NULL DEFAULT '', "order" INTEGER NOT NULL DEFAULT 0, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS "Education" ("id" TEXT NOT NULL PRIMARY KEY, "institution" TEXT NOT NULL, "degree" TEXT NOT NULL, "field" TEXT NOT NULL DEFAULT '', "description" TEXT NOT NULL DEFAULT '', "startDate" TEXT NOT NULL DEFAULT '', "endDate" TEXT NOT NULL DEFAULT '', "gpa" TEXT NOT NULL DEFAULT '', "order" INTEGER NOT NULL DEFAULT 0, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS "BlogPost" ("id" TEXT NOT NULL PRIMARY KEY, "title" TEXT NOT NULL, "slug" TEXT NOT NULL, "content" TEXT NOT NULL DEFAULT '', "excerpt" TEXT NOT NULL DEFAULT '', "coverImage" TEXT NOT NULL DEFAULT '', "tags" TEXT NOT NULL DEFAULT '', "published" BOOLEAN NOT NULL DEFAULT false, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "BlogPost_slug_key" ON "BlogPost"("slug")`,
    `CREATE TABLE IF NOT EXISTS "Achievement" ("id" TEXT NOT NULL PRIMARY KEY, "title" TEXT NOT NULL, "description" TEXT NOT NULL DEFAULT '', "date" TEXT NOT NULL DEFAULT '', "techStack" TEXT NOT NULL DEFAULT '', "order" INTEGER NOT NULL DEFAULT 0, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS "ContactMessage" ("id" TEXT NOT NULL PRIMARY KEY, "name" TEXT NOT NULL, "email" TEXT NOT NULL, "subject" TEXT NOT NULL DEFAULT '', "message" TEXT NOT NULL, "read" BOOLEAN NOT NULL DEFAULT false, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS "HeroStat" ("id" TEXT NOT NULL PRIMARY KEY, "label" TEXT NOT NULL DEFAULT '', "value" TEXT NOT NULL DEFAULT '', "icon" TEXT NOT NULL DEFAULT '', "order" INTEGER NOT NULL DEFAULT 0, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS "AdminUser" ("id" TEXT NOT NULL PRIMARY KEY, "username" TEXT NOT NULL, "password" TEXT NOT NULL, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "AdminUser_username_key" ON "AdminUser"("username")`,
  ];

  for (const sql of statements) {
    try {
      await client.execute(sql);
    } catch (e: any) {
      console.error("❌ Error:", e.message);
    }
  }

  console.log("✅ All tables created in Turso!");
  await client.close();
}

pushSchema().catch(console.error);
