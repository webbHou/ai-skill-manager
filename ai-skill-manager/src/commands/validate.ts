import { Command } from 'commander';
import chalk from 'chalk';
import { RegistryManager } from '../core/index.js';
import { getSupportedPlatforms } from '../adapters/index.js';
import { validateSkill, validateJson } from '../utils/validation.js';

export function createValidateCommand(): Command {
  return new Command('validate')
    .description('Validate skill configuration format')
    .argument('[name]', 'Skill name to validate (or --all for all skills)')
    .option('--all', 'Validate all skills')
    .action(async (name: string | undefined, options: { all?: boolean }) => {
      try {
        const registryManager = new RegistryManager();
        const supportedPlatforms = getSupportedPlatforms();
        
        let skillsToValidate;
        
        if (options.all || !name) {
          skillsToValidate = await registryManager.listSkills();
        } else {
          const skill = await registryManager.getSkill(name);
          if (!skill) {
            console.error(chalk.red(`Error: Skill "${name}" not found.`));
            process.exit(1);
          }
          skillsToValidate = [skill];
        }

        let validCount = 0;
        let invalidCount = 0;

        for (const skill of skillsToValidate) {
          const result = validateSkill(skill, supportedPlatforms);
          
          if (result.valid) {
            console.log(chalk.green(`✓ ${skill.name}`));
            validCount++;
          } else {
            console.log(chalk.red(`✗ ${skill.name}`));
            for (const error of result.errors) {
              console.log(chalk.gray(`  - ${error.field}: ${error.message}`));
            }
            invalidCount++;
          }
        }

        console.log(chalk.gray(`\nTotal: ${skillsToValidate.length}, Valid: ${validCount}, Invalid: ${invalidCount}`));
        
        if (invalidCount > 0) {
          process.exit(1);
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AppError') {
          console.error(chalk.red(`Error: ${error.message}`));
          process.exit(1);
        }
        throw error;
      }
    });
}
