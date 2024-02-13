import inquirer from 'inquirer'

async function askPackageManager() {
    const { packageManager } = await inquirer.prompt([
        {
            type: 'list',
            name: 'packageManager',
            message: 'Choose your preferred package manager:',
            choices: ['npm', 'yarn', 'pnpm', 'bun'],
            default: 'npm'
        }
    ])
    return packageManager
}

function getPackageManagerCommand(packageManager) {
    switch (packageManager) {
        case 'yarn':
            return 'yarn'
        case 'pnpm':
            return 'pnpm'
        case 'bun':
            return 'bunx'
        default:
            return 'npm'
    }
}

export { askPackageManager, getPackageManagerCommand }
