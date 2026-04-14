import { Command } from 'commander';
import chalk from 'chalk';
import { RegistryManager } from '../core/index.js';

export function createListCommand(): Command {
  return new Command('list')
    .description('List all registered skills')
    .option('-p, --platform <name>', 'Filter by platform')
    .option('--json', 'Output as JSON')
    .action(async (options: { platform?: string; json?: boolean }) => {
      try {
        const registryManager = new RegistryManager();
        const skills = await registryManager.listSkills(options.platform);
        
        if (options.json) {
          console.log(JSON.stringify(skills, null, 2));
          return;
        }

        if (skills.length === 0) {
          console.log(chalk.yellow('No skills found.'));
          return;
        }

        console.log(chalk.bold(`\nRegistered Skills (${skills.length})\n`));
        
        for (const skill of skills) {
          console.log(chalk.cyan(`  ${skill.name}`));
          console.log(chalk.gray(`    Platform: ${skill.platform}`));
          console.log(chalk.gray(`    ID: ${skill.id}`));
          if (skill.metadata.description) {
            console.log(chalk.gray(`    Description: ${skill.metadata.description}`));
          }
          if (skill.metadata.tags && skill.metadata.tags.length > 0) {
            console.log(chalk.gray(`    Tags: ${skill.metadata.tags.join(', ')}`));
          }
          console.log();
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
