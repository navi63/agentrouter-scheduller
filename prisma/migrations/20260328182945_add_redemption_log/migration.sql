-- CreateTable
CREATE TABLE "RedemptionLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "accountDataId" INTEGER NOT NULL,
    "cookieId" INTEGER NOT NULL,
    "nominal" TEXT NOT NULL,
    "auditableData" TEXT NOT NULL,
    "previousBalance" TEXT NOT NULL,
    "newBalance" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RedemptionLog_accountDataId_fkey" FOREIGN KEY ("accountDataId") REFERENCES "AccountData" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RedemptionLog_cookieId_fkey" FOREIGN KEY ("cookieId") REFERENCES "Cookie" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
