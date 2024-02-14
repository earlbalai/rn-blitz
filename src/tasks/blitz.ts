import path from "path"
import inquirer from "inquirer"
import { execCommand } from "../utils.js"
import { askSetupOptions } from "./askSetupOptions.js" // Import missing function
import configureProject from "./configureProject.js" // Import missing function
import {
  askPackageManager,
  getPackageManagerCommand,
} from "./packageManager.js" // Import missing functions
import useBlitzTemplate from "./useBlitzTemplate.js" // Import missing function

async function blitz() {
  try {
    // Welcome message
    console.log("Welcome to React Native Blitz!")

    // Get project name from command line arguments
    let projectName = process.argv[3] // Get the second argument after "init"

    // If no project name is provided, ask for it
    if (!projectName) {
      const { name } = await inquirer.prompt([
        {
          type: "input",
          name: "name",
          message: "Enter project name:",
        },
      ])
      projectName = name
    }

    if (!projectName) {
      console.error("Please specify the project name.")
      return
    }

    // Get project folder path
    const projectFolderPath = path.join(process.cwd(), projectName)

    // Ask user for preferred package manager
    const packageManagerChoice = await askPackageManager()
    const packageManagerCommand = getPackageManagerCommand(packageManagerChoice)

    // Run initialization command with the chosen package manager
    execCommand(
      `${packageManagerCommand} react-native@latest init ${projectName}`,
    )

    // Ask user about setup options
    const setupOptions = await askSetupOptions()

    // Configure project based on user responses
    await configureProject(
      setupOptions,
      projectFolderPath,
      packageManagerChoice,
    )
    await useBlitzTemplate(projectFolderPath, packageManagerChoice)

    console.log(
      "Project setup completed successfully!\nPlease be sure to run pod install in the ios directory if you are developing for iOS as well",
    )
  } catch (error) {
    // Other errors
    console.error("Error occurred during project setup:", error)
  }
}

export default blitz
