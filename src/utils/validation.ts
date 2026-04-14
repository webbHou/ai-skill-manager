import yaml from 'js-yaml';
import { Skill, ErrorCode } from '../types/index.js';

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export function validateSkillName(name: string): ValidationResult {
  const errors: ValidationError[] = [];
  
  if (!name || name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Skill name cannot be empty' });
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
    errors.push({ field: 'name', message: 'Skill name can only contain letters, numbers, hyphens and underscores' });
  }
  
  return { valid: errors.length === 0, errors };
}

export function validatePlatform(platform: string, supportedPlatforms: string[]): ValidationResult {
  const errors: ValidationError[] = [];
  
  if (!supportedPlatforms.includes(platform)) {
    errors.push({ 
      field: 'platform', 
      message: `Platform "${platform}" is not supported. Supported platforms: ${supportedPlatforms.join(', ')}` 
    });
  }
  
  return { valid: errors.length === 0, errors };
}

export function validateJson(content: string): ValidationResult {
  const errors: ValidationError[] = [];
  
  try {
    JSON.parse(content);
  } catch (error: unknown) {
    errors.push({ 
      field: 'content', 
      message: `Invalid JSON: ${(error as Error).message}` 
    });
  }
  
  return { valid: errors.length === 0, errors };
}

export function validateYaml(content: string): ValidationResult {
  const errors: ValidationError[] = [];
  
  try {
    yaml.load(content);
  } catch (error: unknown) {
    errors.push({ 
      field: 'content', 
      message: `Invalid YAML: ${(error as Error).message}` 
    });
  }
  
  return { valid: errors.length === 0, errors };
}

export function validateSkill(skill: Skill, supportedPlatforms: string[]): ValidationResult {
  const errors: ValidationError[] = [];
  
  const nameResult = validateSkillName(skill.name);
  errors.push(...nameResult.errors);
  
  const platformResult = validatePlatform(skill.platform, supportedPlatforms);
  errors.push(...platformResult.errors);
  
  if (!skill.id) {
    errors.push({ field: 'id', message: 'Skill ID is required' });
  }
  
  if (!skill.configPath) {
    errors.push({ field: 'configPath', message: 'Skill config path is required' });
  }
  
  return { valid: errors.length === 0, errors };
}

export function isValidFileFormat(filePath: string, supportedFormats: string[]): boolean {
  const ext = filePath.toLowerCase().split('.').pop();
  return ext !== undefined && supportedFormats.includes(ext);
}
