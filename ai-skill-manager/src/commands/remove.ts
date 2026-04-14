import { Command } from 'commander';
import chalk from 'chalk';
import { RegistryManager } from '../core/index.js';

export function createRemoveCommand(): Command {
  return new Command('remove')
    .description('Remove a skill from the registry')
    .argument('<name>', 'Skill name to remove')
    .action(async (name: string) => {
      try {
        const registryManager = new RegistryManager();
        await registryManager.removeSkill(name);
        console.log(chalk.green(`Skill "${name}" removed successfully!`));
      } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AppError') {
          console.error(chalk.red(`Error: ${error.message}`));
          process.exit(1);
        }
        throw error;
      }
    });
}
