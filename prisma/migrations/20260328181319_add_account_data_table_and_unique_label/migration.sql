/*
  Warnings:

  - You are about to drop the column `value` on the `Cookie` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "LogEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "logId" INTEGER NOT NULL,
    "step" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LogEntry_logId_fkey" FOREIGN KEY ("logId") REFERENCES "Log" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AccountData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cookieId" INTEGER NOT NULL,
    "currentBalance" TEXT,
    "consumption" TEXT,
    "lastUpdated" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AccountData_cookieId_fkey" FOREIGN KEY ("cookieId") REFERENCES "Cookie" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Cookie" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "label" TEXT NOT NULL,
    "agentRouterCookie" TEXT,
    "githubCookie" TEXT,
    "status" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Cookie" ("createdAt", "id", "label", "status", "updatedAt") SELECT "createdAt", "id", "label", "status", "updatedAt" FROM "Cookie";
DROP TABLE "Cookie";
ALTER TABLE "new_Cookie" RENAME TO "Cookie";
CREATE UNIQUE INDEX "Cookie_label_key" ON "Cookie"("label");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "AccountData_cookieId_key" ON "AccountData"("cookieId");
