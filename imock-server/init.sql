-- iMock 开源版数据库初始化脚本
-- 只包含核心功能表，不包含商业化功能

-- 设置字符集
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- 用户表
-- ----------------------------
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(16) NOT NULL,
    `nickname` VARCHAR(64) NULL,
    `avatar` VARCHAR(255) NULL,
    `email` VARCHAR(64) NULL,
    `createdAt` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `openId` VARCHAR(32) NULL,
    `cancelled` BOOLEAN NULL DEFAULT false,
    `verified` BOOLEAN NULL DEFAULT false,
    `password` VARCHAR(128) NULL,

    UNIQUE INDEX `userId`(`userId`),
    UNIQUE INDEX `email`(`email`),
    INDEX `openId`(`openId`),
    INDEX `email_2`(`email`),
    INDEX `userId_2`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ----------------------------
-- 用户认证 Token 表
-- ----------------------------
CREATE TABLE `authToken` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(16) NOT NULL,
    `token` VARCHAR(128) NOT NULL,
    `deviceId` VARCHAR(128) NOT NULL,
    `source` VARCHAR(16) NOT NULL DEFAULT 'PC',
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `expiresAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `token`(`token`),
    INDEX `token_2`(`token`),
    INDEX `userId`(`userId`, `deviceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ----------------------------
-- 邮箱验证码表
-- ----------------------------
CREATE TABLE `emailCode` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(64) NOT NULL,
    `code` VARCHAR(6) NOT NULL,
    `createdAt` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `email`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ----------------------------
-- 用户 Mock API 表
-- ----------------------------
CREATE TABLE `userMocks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(16) NOT NULL,
    `urlHash` VARCHAR(32) NOT NULL,
    `url` TEXT NOT NULL,
    `name` VARCHAR(64) NULL,
    `headers` TEXT NULL,
    `body` TEXT NULL,
    `statusCode` VARCHAR(3) NULL,
    `method` VARCHAR(12) NULL,
    `createdAt` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `running` BOOLEAN NULL DEFAULT false,
    `deleted` BOOLEAN NULL DEFAULT false,
    `delay` INTEGER NULL DEFAULT 0,
    
    -- OpenAPI 导入相关字段
    `description` TEXT NULL,
    `requestSchema` TEXT NULL,
    `responseSchema` TEXT NULL,
    `source` VARCHAR(16) NULL DEFAULT 'manual',
    `sourceVersion` VARCHAR(16) NULL,
    
    -- AI Mock 相关字段
    `aiMockBody` TEXT NULL,
    `aiMockRunning` BOOLEAN NULL DEFAULT false,
    `aiOverride` BOOLEAN NULL DEFAULT false,

    INDEX `userId`(`userId`, `urlHash`, `method`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ----------------------------
-- Mock URL 环境配置表
-- ----------------------------
CREATE TABLE `mockUrls` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(16) NOT NULL,
    `url` TEXT NOT NULL,
    `env` VARCHAR(16) NOT NULL DEFAULT 'test',
    `running` BOOLEAN NULL DEFAULT false,
    `createdAt` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `userId`(`userId`),
    UNIQUE INDEX `userId_env`(`userId`, `env`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ----------------------------
-- 请求分享表
-- ----------------------------
CREATE TABLE `request_shares` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `shareId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `data` TEXT NOT NULL,
    `expiredAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `request_shares_shareId_key`(`shareId`),
    INDEX `request_shares_expiredAt_idx`(`expiredAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ----------------------------
-- 外键约束
-- ----------------------------
ALTER TABLE `authToken` ADD CONSTRAINT `authtoken_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user`(`userId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

SET FOREIGN_KEY_CHECKS = 1;
