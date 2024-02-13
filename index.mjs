#!/usr/bin/env node

import { execSync } from 'child_process';
import inquirer from 'inquirer';
import fs from 'fs/promises';
import path from 'path';

async function main() {
    try {
        const packageJson = JSON.parse(await fs.readFile('./package.json', 'utf-8'));
        const version = packageJson.version;
        // Print welcome message with version
        console.log(`Welcome to React Native Blitz v${version}`);

        // Get project name from command line arguments
        let projectName = process.argv[3]; // Get the second argument after "init"

        // If no project name is provided, ask for it
        if (!projectName) {
            const { name } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'name',
                    message: 'Enter project name:'
                }
            ]);
            projectName = name;
        }

        if (!projectName) {
            console.error('Please specify the project name.');
            return;
        }

        // Ask user for preferred package manager
        const packageManagerChoice = await askPackageManager();
        const packageManagerCommand = getPackageManagerCommand(packageManagerChoice);

        // Run initialization command with the chosen package manager
        execSync(`${packageManagerCommand} react-native@latest init ${projectName}`, { stdio: 'inherit' });

        // Update files within the created project folder
        const projectFolderPath = path.join(process.cwd(), projectName);

        // Ask user about setup options
        const setupOptions = await askSetupOptions();

        // Configure project based on user responses
        await configureProject(setupOptions, projectFolderPath);

        // Run package manager install command inside the project folder
        const installCommand = packageManagerChoice === 'bun' ? 'bun install' : `${packageManagerCommand} install`;
        execSync(installCommand, { stdio: 'inherit', cwd: projectFolderPath });

        console.log('Project setup completed successfully!');
    } catch (error) {
        console.error('Error occurred during project setup:', error);
    }
}

async function askPackageManager() {
    const { packageManager } = await inquirer.prompt([
        {
            type: 'list',
            name: 'packageManager',
            message: 'Choose your preferred package manager:',
            choices: ['npm', 'yarn', 'pnpm', 'bun'],
            default: 'npm'
        }
    ]);
    return packageManager;
}

function getPackageManagerCommand(packageManager) {
    switch (packageManager) {
        case 'yarn':
            return 'yarn';
        case 'pnpm':
            return 'pnpm';
        case 'bun':
            return 'bunx';
        default:
            return 'npm';
    }
}

async function askSetupOptions() {
    return inquirer.prompt([
        {
            type: 'confirm',
            name: 'useRecommendedLinting',
            message: 'Do you want to use recommended linting settings?'
        },
        {
            type: 'confirm',
            name: 'setupVSCodeSettings',
            message: 'Do you want to set up VSCode settings?'
        }
    ]);
}

async function configureProject(setupOptions, projectFolderPath) {
    if (setupOptions.useRecommendedLinting) {
        // Write linting configurations to package.json, .eslintrc.js, and .prettierrc.js
        const lintingConfigurations = {
            eslintConfig: {
                root: true,
                extends: '@react-native',
                parser: '@typescript-eslint/parser',
                plugins: ['@typescript-eslint'],
                overrides: [
                    {
                        files: ['*.js', '*.jsx', '*.ts', '*.tsx'],
                        rules: {
                            '@typescript-eslint/no-shadow': ['error'],
                            'no-shadow': 'off',
                            'no-undef': 'off',
                            semi: ['error', 'never'],
                        },
                    },
                ],
            },
            prettierConfig: {
                arrowParens: 'avoid',
                bracketSameLine: true,
                bracketSpacing: false,
                singleQuote: true,
                trailingComma: 'all',
                semi: false,
            },
        };
        const packageJsonPath = `${projectFolderPath}/package.json`;
        const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
        packageJson.devDependencies = {
            ...packageJson.devDependencies,
            "@babel/core": "^7.20.0",
            "@babel/preset-env": "^7.20.0",
            "@babel/runtime": "^7.20.0",
            "@react-native/babel-preset": "0.73.21",
            "@react-native/eslint-config": "0.73.2",
            "@react-native/metro-config": "0.73.5",
            "@react-native/typescript-config": "0.73.1",
            "@types/jest": "^29.2.1",
            "@typescript-eslint/eslint-plugin": "^7.0.1",
            "@typescript-eslint/parser": "^7.0.1",
            "babel-jest": "^29.6.3",
            "eslint": "^8.19.0",
            "eslint-plugin-jest": "^27.6.0",
            "jest": "^29.6.3",
            "prettier": "2.8.8",
            "react-test-renderer": "18.2.0",
            "typescript": "^5.3.2"
        };
        await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
        await fs.writeFile(`${projectFolderPath}/.eslintrc.js`, `module.exports = ${JSON.stringify(lintingConfigurations.eslintConfig, null, 2)}`, 'utf8');
        await fs.writeFile(`${projectFolderPath}/.prettierrc.js`, `module.exports = ${JSON.stringify(lintingConfigurations.prettierConfig, null, 2)}`, 'utf8');
    }

    if (setupOptions.setupVSCodeSettings) {
        // Write VSCode settings to .vscode/settings.json
        const vscodeSettings = {
            'editor.formatOnSave': true,
            '[javascript]': { 'editor.defaultFormatter': 'dbaeumer.vscode-eslint' },
            '[typescript]': { 'editor.defaultFormatter': 'dbaeumer.vscode-eslint' },
        };
        await fs.mkdir(`${projectFolderPath}/.vscode`, { recursive: true });
        await fs.writeFile(`${projectFolderPath}/.vscode/settings.json`, JSON.stringify(vscodeSettings, null, 2), 'utf8');
    }
}

main();
