-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('IDLE', 'SYNCING', 'ERROR');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('GITHUB', 'WAKATIME', 'LEETCODE', 'CODEFORCES');

-- CreateEnum
CREATE TYPE "AggregatePeriod" AS ENUM ('WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "SyncJobStatus" AS ENUM ('QUEUED', 'RUNNING', 'SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "username" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "github_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "githubId" TEXT NOT NULL,
    "login" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "encryptedToken" TEXT NOT NULL,
    "scopes" TEXT NOT NULL,
    "includePrivate" BOOLEAN NOT NULL DEFAULT false,
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'IDLE',
    "lastSyncedAt" TIMESTAMP(3),
    "lastSyncError" TEXT,
    "consecutiveErrors" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "github_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wakatime_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "wakatimeId" TEXT NOT NULL,
    "displayName" TEXT,
    "encryptedAccessToken" TEXT NOT NULL,
    "encryptedRefreshToken" TEXT NOT NULL,
    "tokenExpiresAt" TIMESTAMP(3) NOT NULL,
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'IDLE',
    "lastSyncedAt" TIMESTAMP(3),
    "lastSyncError" TEXT,
    "consecutiveErrors" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wakatime_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leetcode_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verificationCode" TEXT,
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'IDLE',
    "lastSyncedAt" TIMESTAMP(3),
    "lastSyncError" TEXT,
    "consecutiveErrors" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leetcode_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "codeforces_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verificationCode" TEXT,
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'IDLE',
    "lastSyncedAt" TIMESTAMP(3),
    "lastSyncError" TEXT,
    "consecutiveErrors" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "codeforces_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_snapshots" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "date" DATE NOT NULL,
    "commits" INTEGER,
    "pullRequests" INTEGER,
    "prsMerged" INTEGER,
    "issuesOpened" INTEGER,
    "reviews" INTEGER,
    "starsReceived" INTEGER,
    "totalRepos" INTEGER,
    "codingSeconds" INTEGER,
    "topLanguage" TEXT,
    "languages" JSONB,
    "problemsSolvedTotal" INTEGER,
    "solvedEasy" INTEGER,
    "solvedMedium" INTEGER,
    "solvedHard" INTEGER,
    "contestRating" INTEGER,
    "cfRating" INTEGER,
    "cfMaxRating" INTEGER,
    "cfRank" TEXT,
    "cfProblemsSolvedTotal" INTEGER,
    "cfSubmissions" INTEGER,
    "raw" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metric_aggregates" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "period" "AggregatePeriod" NOT NULL,
    "periodStart" DATE NOT NULL,
    "commits" INTEGER NOT NULL DEFAULT 0,
    "prsMerged" INTEGER NOT NULL DEFAULT 0,
    "issuesOpened" INTEGER NOT NULL DEFAULT 0,
    "codingSeconds" INTEGER NOT NULL DEFAULT 0,
    "problemsSolved" INTEGER NOT NULL DEFAULT 0,
    "activeDays" INTEGER NOT NULL DEFAULT 0,
    "topLanguages" JSONB,

    CONSTRAINT "metric_aggregates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scores" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "breakdown" JSONB NOT NULL,
    "formulaVersion" INTEGER NOT NULL DEFAULT 1,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_jobs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "status" "SyncJobStatus" NOT NULL DEFAULT 'QUEUED',
    "trigger" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "error" TEXT,
    "itemsSynced" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sync_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "bio" TEXT,
    "showGithub" BOOLEAN NOT NULL DEFAULT true,
    "showWakatime" BOOLEAN NOT NULL DEFAULT true,
    "showLeetcode" BOOLEAN NOT NULL DEFAULT true,
    "showCodeforces" BOOLEAN NOT NULL DEFAULT true,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "public_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "share_cards" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'dark',
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "share_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "github_accounts_userId_key" ON "github_accounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "github_accounts_githubId_key" ON "github_accounts"("githubId");

-- CreateIndex
CREATE INDEX "github_accounts_lastSyncedAt_idx" ON "github_accounts"("lastSyncedAt");

-- CreateIndex
CREATE UNIQUE INDEX "wakatime_accounts_userId_key" ON "wakatime_accounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "wakatime_accounts_wakatimeId_key" ON "wakatime_accounts"("wakatimeId");

-- CreateIndex
CREATE INDEX "wakatime_accounts_lastSyncedAt_idx" ON "wakatime_accounts"("lastSyncedAt");

-- CreateIndex
CREATE UNIQUE INDEX "leetcode_accounts_userId_key" ON "leetcode_accounts"("userId");

-- CreateIndex
CREATE INDEX "leetcode_accounts_lastSyncedAt_idx" ON "leetcode_accounts"("lastSyncedAt");

-- CreateIndex
CREATE UNIQUE INDEX "codeforces_accounts_userId_key" ON "codeforces_accounts"("userId");

-- CreateIndex
CREATE INDEX "codeforces_accounts_lastSyncedAt_idx" ON "codeforces_accounts"("lastSyncedAt");

-- CreateIndex
CREATE INDEX "daily_snapshots_userId_date_idx" ON "daily_snapshots"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_snapshots_userId_platform_date_key" ON "daily_snapshots"("userId", "platform", "date");

-- CreateIndex
CREATE UNIQUE INDEX "metric_aggregates_userId_period_periodStart_key" ON "metric_aggregates"("userId", "period", "periodStart");

-- CreateIndex
CREATE UNIQUE INDEX "scores_userId_kind_key" ON "scores"("userId", "kind");

-- CreateIndex
CREATE INDEX "sync_jobs_userId_createdAt_idx" ON "sync_jobs"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "sync_jobs_status_createdAt_idx" ON "sync_jobs"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "public_profiles_userId_key" ON "public_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "public_profiles_slug_key" ON "public_profiles"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "share_cards_userId_kind_theme_key" ON "share_cards"("userId", "kind", "theme");

-- CreateIndex
CREATE UNIQUE INDEX "achievements_code_key" ON "achievements"("code");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "github_accounts" ADD CONSTRAINT "github_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wakatime_accounts" ADD CONSTRAINT "wakatime_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leetcode_accounts" ADD CONSTRAINT "leetcode_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "codeforces_accounts" ADD CONSTRAINT "codeforces_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_snapshots" ADD CONSTRAINT "daily_snapshots_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metric_aggregates" ADD CONSTRAINT "metric_aggregates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scores" ADD CONSTRAINT "scores_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sync_jobs" ADD CONSTRAINT "sync_jobs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public_profiles" ADD CONSTRAINT "public_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "share_cards" ADD CONSTRAINT "share_cards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
