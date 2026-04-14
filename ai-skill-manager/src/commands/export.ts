import { Command } from 'commander';
import chalk from 'chalk';
import * as path from 'path';
import { RegistryManager } from '../core/index.js';

export function createExportCommand(): Command {
  return new Command('export')
    .description('Export a skill to a file')
    .argument('<name>', 'Skill name to export')
    .requiredOption('-o, --output <path>', 'Output file path')
    .action(async (name: string, options: { output: string }) => {
      try {
        const registryManager = new RegistryManager();
        const outputPath = await registryManager.exportSkill(name, options.output);
        console.log(chalk.green(`Skill "${name}" exported to ${outputPath}`));
      } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AppError') {
          console.error(chalk.red(`Error: ${error.message}`));
          process.exit(1);
        }
        throw error;
      }
    });
}
