import * as path from 'path';
import { Skill, SyncOptions, ErrorCode } from '../types/index.js';
import { RegistryManager } from './registry.js';
import { getAdapter, getSupportedPlatforms } from '../adapters/index.js';
import { fileExists, readFile, writeFile, createSymlink, isSymlink, stat } from '../utils/file.js';

export class SyncEngine {
  constructor(private registryManager: RegistryManager) {}

  async sync(options: SyncOptions): Promise<{ pushed: number; pulled: number; linked: number }> {
    const adapter = getAdapter(options.platform);
    
    if (!adapter) {
      throw new AppError(
        ErrorCode.PLATFORM_NOT_SUPPORTED,
        `Platform "${options.platform}" is not supported. Supported: ${getSupportedPlatforms().join(', ')}`
      );
    }

    const result = { pushed: 0, pulled: 0, linked: 0 };

    switch (options.mode) {
      case 'push':
        result.pushed = await this.push(adapter, options.dryRun);
        break;
      case 'pull':
        result.pulled = await this.pull(adapter, options.dryRun);
        break;
      case 'link':
        result.linked = await this.link(adapter, options.dryRun);
        break;
    }

    return result;
  }

  private async push(adapter: ReturnType<typeof getAdapter>, dryRun: boolean = false): Promise<number> {
    if (!adapter) return 0;

    const skills = await this.registryManager.listSkills(adapter.platform);
    let count = 0;

    for (const skill of skills) {
      const targetPath = adapter.getConfigPath(skill.name);
      
      if (dryRun) {
        console.log(`[DRY-RUN] Would push "${skill.name}" to ${targetPath}`);
      } else {
        const skillFilePath = path.join(path.dirname(this.registryManager.getRegistryPath()), skill.configPath);
        const content = await readFile(skillFilePath);
        await writeFile(targetPath, content);
        console.log(`Pushed "${skill.name}" to ${targetPath}`);
      }
      count++;
    }

    return count;
  }

  private async pull(adapter: ReturnType<typeof getAdapter>, dryRun: boolean = false): Promise<number> {
    if (!adapter) return 0;

    const configDir = path.join(adapter.getConfigBasePath(), adapter.getSkillSubPath());
    const exists = await fileExists(configDir);
    
    if (!exists) {
      console.log(`Config directory does not exist: ${configDir}`);
      return 0;
    }

    let count = 0;
    
    if (dryRun) {
      console.log(`[DRY-RUN] Would pull skills from ${configDir}`);
      return 1;
    }

    console.log(`Pull operation completed (mock - actual implementation would read from ${configDir})`);
    return count;
  }

  private async link(adapter: ReturnType<typeof getAdapter>, dryRun: boolean = false): Promise<number> {
    if (!adapter) return 0;

    if (!adapter.supportsSymlink()) {
      throw new AppError(
        ErrorCode.SYMLINK_NOT_SUPPORTED,
        `Platform "${adapter.platform}" does not support symbolic links`
      );
    }

    const skills = await this.registryManager.listSkills(adapter.platform);
    let count = 0;

    for (const skill of skills) {
      const skillFilePath = path.join(path.dirname(this.registryManager.getRegistryPath()), skill.configPath);
      const targetPath = adapter.getConfigPath(skill.name);
      
      const skillExists = await fileExists(skillFilePath);
      if (!skillExists) {
        console.warn(`Warning: Skill file not found: ${skillFilePath}`);
        continue;
      }

      if (dryRun) {
        console.log(`[DRY-RUN] Would create symlink: ${targetPath} -> ${skillFilePath}`);
      } else {
        await createSymlink(skillFilePath, targetPath);
        console.log(`Linked "${skill.name}" to ${targetPath}`);
      }
      count++;
    }

    return count;
  }
}

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}
