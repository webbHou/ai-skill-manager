import * as path from 'path';
import { BaseAdapter } from './base.js';
import { Skill, SkillMetadata } from '../types/index.js';

export class ClaudeAdapter extends BaseAdapter {
  platform = 'claude';
  configPaths = ['~/.claude/skills/'];
  supportedFormats = ['json'];

  platformName(): string {
    return 'Claude';
  }

  getConfigBasePath(): string {
    return this.expandPath('~/.claude');
  }

  getSkillSubPath(): string {
    return 'skills';
  }

  getSkillFileName(skillName: string): string {
    return `${skillName}.json`;
  }

  parse(content: string): Skill {
    const data = JSON.parse(content);
    
    const now = new Date().toISOString();
    const metadata: SkillMetadata = {
      description: data.description,
      tags: data.tags,
      createdAt: data.createdAt || now,
      updatedAt: data.updatedAt || now,
      source: data.source,
    };

    return {
      id: data.id || this.generateId(),
      name: data.name,
      platform: this.platform,
      configPath: data.configPath || '',
      metadata,
    };
  }

  stringify(skill: Skill): string {
    const data = {
      id: skill.id,
      name: skill.name,
      description: skill.metadata.description,
      tags: skill.metadata.tags,
      createdAt: skill.metadata.createdAt,
      updatedAt: skill.metadata.updatedAt,
      source: skill.metadata.source,
      configPath: skill.configPath,
    };

    return JSON.stringify(data, null, 2);
  }

  private generateId(): string {
    return `claude_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}
