export interface SkillMetadata {
  description?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  source?: string;
}

export interface Skill {
  id: string;
  name: string;
  platform: string;
  configPath: string;
  metadata: SkillMetadata;
}

export interface SkillRegistry {
  version: string;
  createdAt: string;
  updatedAt: string;
  skills: Skill[];
}

export interface PlatformConfig {
  platform: string;
  name: string;
  configBasePath: string;
  skillSubPath: string;
  supportedFormats: string[];
  supportsSymlink: boolean;
}

export enum ErrorCode {
  REGISTRY_NOT_FOUND = 'REGISTRY_NOT_FOUND',
  REGISTRY_ALREADY_EXISTS = 'REGISTRY_ALREADY_EXISTS',
  SKILL_NOT_FOUND = 'SKILL_NOT_FOUND',
  SKILL_ALREADY_EXISTS = 'SKILL_ALREADY_EXISTS',
  INVALID_FORMAT = 'INVALID_FORMAT',
  PLATFORM_NOT_SUPPORTED = 'PLATFORM_NOT_SUPPORTED',
  FILE_SYSTEM_ERROR = 'FILE_SYSTEM_ERROR',
  SYMLINK_NOT_SUPPORTED = 'SYMLINK_NOT_SUPPORTED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
}

export interface CommandResult {
  success: boolean;
  message?: string;
  data?: unknown;
}

export interface SyncOptions {
  platform: string;
  mode: 'push' | 'pull' | 'link';
  dryRun?: boolean;
}

export interface BackupOptions {
  outputPath: string;
}

export interface RestoreOptions {
  backupPath: string;
}
