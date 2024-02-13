import inquirer from 'inquirer'
import path from 'path'
import { execCommand } from '../utils.mjs'
import { askPackageManager, getPackageManagerCommand } from './packageManager.mjs'
import { askSetupOptions } from './askSetupOptions.mjs'
import useBlitzTemplate from './useBlitzTemplate.mjs'
import configureProject from './configureProject.mjs'

async function blitz() {
    try {
        // Welcome message
        console.log('Welcome to React Native Blitz!')

        // Get project name from command line arguments
        let projectName = process.argv[3] // Get the second argument after "init"

        // If no project name is provided, ask for it
        if (!projectName) {
            const { name } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'name',
                    message: 'Enter project name:'
                }
            ])
            projectName = name
        }

        if (!projectName) {
            console.error('Please specify the project name.')
            return
        }

        // Get project folder path
        const projectFolderPath = path.join(process.cwd(), projectName)

        // Ask user for preferred package manager
        const packageManagerChoice = await askPackageManager()
        const packageManagerCommand = getPackageManagerCommand(packageManagerChoice)

        // Run initialization command with the chosen package manager
        execCommand(`${packageManagerCommand} react-native@latest init ${projectName}`, { stdio: 'inherit' })

        // Ask user about setup options
        const setupOptions = await askSetupOptions()

        // Configure project based on user responses
        await configureProject(setupOptions, projectFolderPath, packageManagerChoice)
        await useBlitzTemplate(projectFolderPath, packageManagerChoice)

        console.log('Project setup completed successfully!\nPlease be sure to run pod install in the ios directory if you are developing for iOS as well')
    } catch (error) {
        if (error.isTtyError) {
            // Prompt was cancelled
            console.error('Operation cancelled.')
        } else {
            // Other errors
            console.error('Error occurred during project setup:', error)
        }
    }
}

export default blitz
