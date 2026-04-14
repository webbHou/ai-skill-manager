import { describe, it, expect } from 'vitest';
import { validateSkillName, validatePlatform, validateJson, validateYaml, validateSkill } from './validation.js';

describe('validateSkillName', () => {
  it('should accept valid skill names', () => {
    const result = validateSkillName('my-skill');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should accept skill names with underscores', () => {
    const result = validateSkillName('my_skill_123');
    expect(result.valid).toBe(true);
  });

  it('should reject empty skill names', () => {
    const result = validateSkillName('');
    expect(result.valid).toBe(false);
    expect(result.errors[0].field).toBe('name');
  });

  it('should reject skill names with special characters', () => {
    const result = validateSkillName('my skill!');
    expect(result.valid).toBe(false);
  });
});

describe('validatePlatform', () => {
  const supportedPlatforms = ['claude', 'copilot', 'cursor'];

  it('should accept supported platforms', () => {
    const result = validatePlatform('claude', supportedPlatforms);
    expect(result.valid).toBe(true);
  });

  it('should reject unsupported platforms', () => {
    const result = validatePlatform('unknown', supportedPlatforms);
    expect(result.valid).toBe(false);
    expect(result.errors[0].field).toBe('platform');
  });
});

describe('validateJson', () => {
  it('should accept valid JSON', () => {
    const result = validateJson('{"name": "test"}');
    expect(result.valid).toBe(true);
  });

  it('should reject invalid JSON', () => {
    const result = validateJson('{name: test}');
    expect(result.valid).toBe(false);
    expect(result.errors[0].field).toBe('content');
  });
});

describe('validateYaml', () => {
  it('should accept valid YAML', () => {
    const result = validateYaml('name: test\nversion: 1');
    expect(result.valid).toBe(true);
  });

  it('should reject invalid YAML', () => {
    const result = validateYaml('name: [test');
    expect(result.valid).toBe(false);
  });
});

describe('validateSkill', () => {
  const supportedPlatforms = ['claude', 'copilot', 'cursor'];

  it('should accept valid skill', () => {
    const skill = {
      id: 'test-123',
      name: 'my-skill',
      platform: 'claude',
      configPath: 'skills/test.json',
      metadata: {
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    };
    const result = validateSkill(skill as any, supportedPlatforms);
    expect(result.valid).toBe(true);
  });

  it('should reject skill with invalid platform', () => {
    const skill = {
      id: 'test-123',
      name: 'my-skill',
      platform: 'unknown',
      configPath: 'skills/test.json',
      metadata: {
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    };
    const result = validateSkill(skill as any, supportedPlatforms);
    expect(result.valid).toBe(false);
  });

  it('should reject skill without id', () => {
    const skill = {
      id: '',
      name: 'my-skill',
      platform: 'claude',
      configPath: 'skills/test.json',
      metadata: {
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    };
    const result = validateSkill(skill as any, supportedPlatforms);
    expect(result.valid).toBe(false);
  });
});
