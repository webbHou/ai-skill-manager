import { Command } from 'commander';
import chalk from 'chalk';
import { RegistryManager } from '../core/index.js';

export function createUpdateCommand(): Command {
  return new Command('update')
    .description('Update an existing skill')
    .argument('<name>', 'Skill name to update')
    .option('-f, --file <path>', 'Path to new skill config file')
    .option('-d, --description <desc>', 'New description')
    .option('-t, --tags <tags...>', 'New tags')
    .action(async (name: string, options: { file?: string; description?: string; tags?: string[] }) => {
      try {
        const registryManager = new RegistryManager();
        
        const updates: { configPath?: string; metadata?: { description?: string; tags?: string[] } } = {};
        
        if (options.file) {
          updates.configPath = options.file;
        }
        
        if (options.description || options.tags) {
          updates.metadata = {};
          if (options.description) {
            updates.metadata.description = options.description;
          }
          if (options.tags) {
            updates.metadata.tags = options.tags;
          }
        }

        if (Object.keys(updates).length === 0) {
          console.error(chalk.red('Error: At least one update option is required'));
          process.exit(1);
        }

        const skill = await registryManager.updateSkill(name, updates);
        console.log(chalk.green(`Skill "${name}" updated successfully!`));
        console.log(chalk.gray(`  ID: ${skill.id}`));
      } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AppError') {
          console.error(chalk.red(`Error: ${error.message}`));
          process.exit(1);
        }
        throw error;
      }
    });
}
