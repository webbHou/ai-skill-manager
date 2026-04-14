import * as os from 'os';
import * as path from 'path';
import { PlatformConfig, Skill } from '../types/index.js';

export abstract class BaseAdapter {
  abstract platform: string;
  abstract configPaths: string[];
  abstract supportedFormats: string[];

  abstract parse(content: string): Skill;
  abstract stringify(skill: Skill): string;

  getPlatformConfig(): PlatformConfig {
    return {
      platform: this.platform,
      name: this.platformName(),
      configBasePath: this.getConfigBasePath(),
      skillSubPath: this.getSkillSubPath(),
      supportedFormats: this.supportedFormats,
      supportsSymlink: this.supportsSymlink(),
    };
  }

  abstract platformName(): string;
  abstract getConfigBasePath(): string;
  abstract getSkillSubPath(): string;

  supportsSymlink(): boolean {
    return true;
  }

  getConfigPath(skillName: string): string {
    return path.join(this.getConfigBasePath(), this.getSkillSubPath(), this.getSkillFileName(skillName));
  }

  abstract getSkillFileName(skillName: string): string;

  expandPath(platformPath: string): string {
    if (platformPath.startsWith('~')) {
      return path.join(os.homedir(), platformPath.slice(1));
    }
    return platformPath;
  }
}
