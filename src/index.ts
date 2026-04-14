#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { createInitCommand } from './commands/init.js';
import { createListCommand } from './commands/list.js';
import { createAddCommand } from './commands/add.js';
import { createRemoveCommand } from './commands/remove.js';
import { createUpdateCommand } from './commands/update.js';
import { createExportCommand } from './commands/export.js';
import { createImportCommand } from './commands/import.js';
import { createSyncCommand } from './commands/sync.js';
import { createValidateCommand } from './commands/validate.js';
import { createBackupCommand } from './commands/backup.js';
import { createRestoreCommand } from './commands/restore.js';

const program = new Command();

program
  .name('skill')
  .description('CLI tool for managing and syncing AI tool skills')
  .version('1.0.0');

program.addCommand(createInitCommand());
program.addCommand(createListCommand());
program.addCommand(createAddCommand());
program.addCommand(createRemoveCommand());
program.addCommand(createUpdateCommand());
program.addCommand(createExportCommand());
program.addCommand(createImportCommand());
program.addCommand(createSyncCommand());
program.addCommand(createValidateCommand());
program.addCommand(createBackupCommand());
program.addCommand(createRestoreCommand());

program.on('command:*', () => {
  console.error(chalk.red(`Invalid command: ${program.args.join(' ')}`));
  console.log(chalk.gray(`Run 'skill --help' for available commands.`));
  process.exit(1);
});

program.parse();
