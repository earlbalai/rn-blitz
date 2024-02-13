#!/usr/bin/env node

const { execSync } = require('child_process');
const inquirer = require('inquirer');
const fs = require('fs');

async function main() {
    try {
        const projectName = process.argv[2]; // Get project name from command line argument

        if (!projectName) {
            console.error('Please provide a project name.');
            return;
        }

        // Run initialization command
        execSync(`npx react-native@latest init ${projectName}`, { stdio: 'inherit' });

        // Ask user about setup options
        const setupOptions = await askSetupOptions();

        // Configure project based on user responses
        await configureProject(setupOptions);

        console.log('Project setup completed successfully!');
    } catch (error) {
        console.error('Error occurred during project setup:', error);
    }
}

function askSetupOptions() {
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

async function configureProject(setupOptions) {
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
        const packageJsonPath = './package.json';
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
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
            "@types/react": "^18.2.6",
            "@types/react-test-renderer": "^18.0.0",
            "@typescript-eslint/eslint-plugin": "^7.0.1",
            "@typescript-eslint/parser": "^7.0.1",
            "babel-jest": "^29.6.3",
            "eslint": "^8.56.0",
            "eslint-plugin-jest": "^27.6.0",
            "jest": "^29.6.3",
            "prettier": "2.8.8",
            "react-test-renderer": "18.2.0",
            "typescript": "^5.3.2"
        };
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
        fs.writeFileSync('.eslintrc.js', `module.exports = ${JSON.stringify(lintingConfigurations.eslintConfig, null, 2)}`, 'utf8');
        fs.writeFileSync('.prettierrc.js', `module.exports = ${JSON.stringify(lintingConfigurations.prettierConfig, null, 2)}`, 'utf8');
    }

    if (setupOptions.setupVSCodeSettings) {
        // Write VSCode settings to .vscode/settings.json
        const vscodeSettings = {
            'editor.defaultFormatter': 'dbaeumer.vscode-eslint',
            'editor.formatOnSave': true,
            'javascript.format.semicolons': 'remove',
            'typescript.format.semicolons': 'remove',
            'typescript.preferences.quoteStyle': 'single',
            'javascript.preferences.quoteStyle': 'single',
            'typescript.updateImportsOnFileMove.enabled': 'always',
            'javascript.updateImportsOnFileMove.enabled': 'always',
            'eslint.validate': ['javascript', 'javascriptreact', 'typescript', 'typescriptreact'],
            '[javascript]': { 'editor.defaultFormatter': 'dbaeumer.vscode-eslint' },
            '[typescript]': { 'editor.defaultFormatter': 'dbaeumer.vscode-eslint' },
        };
        fs.mkdirSync('.vscode', { recursive: true });
        fs.writeFileSync('.vscode/settings.json', JSON.stringify(vscodeSettings, null, 2), 'utf8');
    }
}

main();
