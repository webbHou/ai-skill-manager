import { describe, it, expect } from 'vitest';
import { ClaudeAdapter } from './claude.js';
import { CopilotAdapter } from './copilot.js';
import { CursorAdapter } from './cursor.js';
import { getAdapter, getSupportedPlatforms, adapters } from './index.js';

describe('ClaudeAdapter', () => {
  const adapter = new ClaudeAdapter();

  it('should have correct platform name', () => {
    expect(adapter.platform).toBe('claude');
    expect(adapter.platformName()).toBe('Claude');
  });

  it('should parse valid skill JSON', () => {
    const content = JSON.stringify({
      id: 'test-123',
      name: 'test-skill',
      description: 'A test skill',
      tags: ['test'],
    });
    const skill = adapter.parse(content);
    expect(skill.name).toBe('test-skill');
    expect(skill.platform).toBe('claude');
    expect(skill.metadata.description).toBe('A test skill');
  });

  it('should stringify skill to JSON', () => {
    const skill = {
      id: 'test-123',
      name: 'test-skill',
      platform: 'claude',
      configPath: 'skills/test.json',
      metadata: {
        description: 'A test skill',
        tags: ['test'],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    };
    const content = adapter.stringify(skill);
    const parsed = JSON.parse(content);
    expect(parsed.name).toBe('test-skill');
  });

  it('should generate skill file name', () => {
    const fileName = adapter.getSkillFileName('my-skill');
    expect(fileName).toBe('my-skill.json');
  });
});

describe('CopilotAdapter', () => {
  const adapter = new CopilotAdapter();

  it('should have correct platform name', () => {
    expect(adapter.platform).toBe('copilot');
    expect(adapter.platformName()).toBe('GitHub Copilot');
  });

  it('should parse valid skill JSON', () => {
    const content = JSON.stringify({
      id: 'copilot-123',
      name: 'copilot-skill',
    });
    const skill = adapter.parse(content);
    expect(skill.name).toBe('copilot-skill');
    expect(skill.platform).toBe('copilot');
  });
});

describe('CursorAdapter', () => {
  const adapter = new CursorAdapter();

  it('should have correct platform name', () => {
    expect(adapter.platform).toBe('cursor');
    expect(adapter.platformName()).toBe('Cursor');
  });

  it('should get correct config path', () => {
    const configPath = adapter.getConfigPath('my-skill');
    expect(configPath).toContain('cursor');
    expect(configPath).toContain('my-skill.json');
  });
});

describe('getAdapter', () => {
  it('should return adapter for supported platform', () => {
    const adapter = getAdapter('claude');
    expect(adapter).toBeDefined();
    expect(adapter!.platform).toBe('claude');
  });

  it('should return undefined for unsupported platform', () => {
    const adapter = getAdapter('unknown');
    expect(adapter).toBeUndefined();
  });

  it('should be case insensitive', () => {
    const adapter = getAdapter('COPILOT');
    expect(adapter).toBeDefined();
    expect(adapter!.platform).toBe('copilot');
  });
});

describe('getSupportedPlatforms', () => {
  it('should return list of supported platforms', () => {
    const platforms = getSupportedPlatforms();
    expect(platforms).toContain('claude');
    expect(platforms).toContain('copilot');
    expect(platforms).toContain('cursor');
  });
});
