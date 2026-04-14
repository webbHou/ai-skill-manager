import { Command } from 'commander';
import chalk from 'chalk';
import { RegistryManager } from '../core/index.js';

export function createImportCommand(): Command {
  return new Command('import')
    .description('Import a skill from a file')
    .argument('<path>', 'Path to skill file')
    .option('-o, --overwrite', 'Overwrite if skill already exists')
    .action(async (filePath: string, options: { overwrite?: boolean }) => {
      try {
        const registryManager = new RegistryManager();
        const skill = await registryManager.importSkill(filePath, options.overwrite);
        console.log(chalk.green(`Skill "${skill.name}" imported successfully!`));
        console.log(chalk.gray(`  Platform: ${skill.platform}`));
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
