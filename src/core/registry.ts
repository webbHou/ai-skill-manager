import * as path from 'path';
import * as fs from 'fs/promises';
import { Skill, SkillRegistry, ErrorCode } from '../types/index.js';
import { readJsonFile, writeJsonFile, fileExists, ensureDir } from '../utils/file.js';
import { getSupportedPlatforms } from '../adapters/index.js';

const REGISTRY_VERSION = '1.0.0';

export class RegistryManager {
  private registryPath: string;

  constructor(registryPath?: string) {
    this.registryPath = registryPath || this.getDefaultRegistryPath();
  }

  private getDefaultRegistryPath(): string {
    return path.join(process.cwd(), '.skill-registry.json');
  }

  getRegistryPath(): string {
    return this.registryPath;
  }

  async createRegistry(force: boolean = false): Promise<SkillRegistry> {
    const exists = await fileExists(this.registryPath);
    
    if (exists && !force) {
      throw new AppError(ErrorCode.REGISTRY_ALREADY_EXISTS, `Registry already exists at ${this.registryPath}`);
    }

    const now = new Date().toISOString();
    const registry: SkillRegistry = {
      version: REGISTRY_VERSION,
      createdAt: now,
      updatedAt: now,
      skills: [],
    };

    await ensureDir(path.dirname(this.registryPath));
    await writeJsonFile(this.registryPath, registry);
    
    return registry;
  }

  async loadRegistry(): Promise<SkillRegistry> {
    const exists = await fileExists(this.registryPath);
    
    if (!exists) {
      throw new AppError(ErrorCode.REGISTRY_NOT_FOUND, `Registry not found at ${this.registryPath}. Run 'skill init' first.`);
    }

    return readJsonFile<SkillRegistry>(this.registryPath);
  }

  async saveRegistry(registry: SkillRegistry): Promise<void> {
    registry.updatedAt = new Date().toISOString();
    await writeJsonFile(this.registryPath, registry);
  }

  async listSkills(platform?: string): Promise<Skill[]> {
    const registry = await this.loadRegistry();
    
    if (platform) {
      return registry.skills.filter(s => s.platform.toLowerCase() === platform.toLowerCase());
    }
    
    return registry.skills;
  }

  async getSkill(name: string): Promise<Skill | undefined> {
    const registry = await this.loadRegistry();
    return registry.skills.find(s => s.name.toLowerCase() === name.toLowerCase());
  }

  async addSkill(skill: Omit<Skill, 'id' | 'metadata'> & { metadata?: Partial<Skill['metadata']> }): Promise<Skill> {
    const registry = await this.loadRegistry();
    
    const existing = registry.skills.find(s => s.name.toLowerCase() === skill.name.toLowerCase());
    if (existing) {
      throw new AppError(ErrorCode.SKILL_ALREADY_EXISTS, `Skill "${skill.name}" already exists. Use 'update' command instead.`);
    }

    const now = new Date().toISOString();
    const newSkill: Skill = {
      id: this.generateId(),
      name: skill.name,
      platform: skill.platform.toLowerCase(),
      configPath: skill.configPath,
      metadata: {
        description: skill.metadata?.description,
        tags: skill.metadata?.tags,
        createdAt: now,
        updatedAt: now,
        source: skill.metadata?.source,
      },
    };

    registry.skills.push(newSkill);
    await this.saveRegistry(registry);
    
    return newSkill;
  }

  async removeSkill(name: string): Promise<void> {
    const registry = await this.loadRegistry();
    
    const index = registry.skills.findIndex(s => s.name.toLowerCase() === name.toLowerCase());
    if (index === -1) {
      throw new AppError(ErrorCode.SKILL_NOT_FOUND, `Skill "${name}" not found.`);
    }

    registry.skills.splice(index, 1);
    await this.saveRegistry(registry);
  }

  async updateSkill(name: string, updates: Partial<Omit<Skill, 'id' | 'metadata'>> & { metadata?: Partial<Skill['metadata']> }): Promise<Skill> {
    const registry = await this.loadRegistry();
    
    const skill = registry.skills.find(s => s.name.toLowerCase() === name.toLowerCase());
    if (!skill) {
      throw new AppError(ErrorCode.SKILL_NOT_FOUND, `Skill "${name}" not found.`);
    }

    if (updates.name && updates.name.toLowerCase() !== name.toLowerCase()) {
      const nameExists = registry.skills.some(s => s.name.toLowerCase() === updates.name!.toLowerCase());
      if (nameExists) {
        throw new AppError(ErrorCode.SKILL_ALREADY_EXISTS, `Skill "${updates.name}" already exists.`);
      }
      skill.name = updates.name;
    }

    if (updates.platform) {
      skill.platform = updates.platform.toLowerCase();
    }

    if (updates.configPath) {
      skill.configPath = updates.configPath;
    }

    if (updates.metadata) {
      skill.metadata = {
        ...skill.metadata,
        ...updates.metadata,
        updatedAt: new Date().toISOString(),
      };
    } else {
      skill.metadata.updatedAt = new Date().toISOString();
    }

    await this.saveRegistry(registry);
    return skill;
  }

  async exportSkill(name: string, outputPath: string): Promise<string> {
    const skill = await this.getSkill(name);
    if (!skill) {
      throw new AppError(ErrorCode.SKILL_NOT_FOUND, `Skill "${name}" not found.`);
    }

    const content = JSON.stringify(skill, null, 2);
    await ensureDir(path.dirname(outputPath));
    await fs.writeFile(outputPath, content, 'utf-8');
    
    return outputPath;
  }

  async importSkill(filePath: string, overwrite: boolean = false): Promise<Skill> {
    const content = await fs.readFile(filePath, 'utf-8');
    const skill = JSON.parse(content) as Skill;
    
    const supportedPlatforms = getSupportedPlatforms();
    if (!supportedPlatforms.includes(skill.platform.toLowerCase())) {
      throw new AppError(ErrorCode.PLATFORM_NOT_SUPPORTED, `Platform "${skill.platform}" is not supported.`);
    }

    skill.platform = skill.platform.toLowerCase();
    
    const registry = await this.loadRegistry();
    const existing = registry.skills.find(s => s.name.toLowerCase() === skill.name.toLowerCase());
    
    if (existing && !overwrite) {
      throw new AppError(ErrorCode.SKILL_ALREADY_EXISTS, `Skill "${skill.name}" already exists. Use --overwrite to replace.`);
    }

    if (existing) {
      skill.id = existing.id;
      Object.assign(existing, skill);
    } else {
      skill.id = this.generateId();
      registry.skills.push(skill);
    }

    await this.saveRegistry(registry);
    return skill;
  }

  async backupAll(outputPath: string): Promise<{ count: number; path: string }> {
    const registry = await this.loadRegistry();
    
    await ensureDir(outputPath);
    
    const backupData = {
      ...registry,
      backedUpAt: new Date().toISOString(),
    };
    
    await writeJsonFile(path.join(outputPath, 'registry.json'), backupData);
    
    return {
      count: registry.skills.length,
      path: outputPath,
    };
  }

  async restoreAll(backupPath: string): Promise<{ count: number }> {
    const registryFile = path.join(backupPath, 'registry.json');
    const exists = await fileExists(registryFile);
    
    if (!exists) {
      throw new AppError(ErrorCode.FILE_SYSTEM_ERROR, `Backup registry not found at ${registryFile}`);
    }

    const backupData = await readJsonFile<SkillRegistry>(registryFile);
    
    if (!backupData.skills) {
      throw new AppError(ErrorCode.INVALID_FORMAT, 'Invalid backup format: missing skills array');
    }

    const currentRegistry = await this.loadRegistry();
    currentRegistry.skills = backupData.skills;
    currentRegistry.updatedAt = new Date().toISOString();
    
    await this.saveRegistry(currentRegistry);
    
    return { count: backupData.skills.length };
  }

  private generateId(): string {
    return `skill_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
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
