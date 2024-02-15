import path from "path";
import inquirer from "inquirer";
import { execCommand } from "../utils.js";
import { askSetupOptions } from "./askSetupOptions.js";
import configureProject from "./configureProject.js";
import {
  askPackageManager,
  getPackageManagerCommand,
} from "./packageManager.js";
import useBlitzTemplate from "./useBlitzTemplate.js";

async function blitz() {
  try {
    // Welcome message
    console.log("Welcome to React Native Blitz!");

    // Get project name from command line arguments
    let projectName = process.argv[3];

    // If no project name is provided, ask for it
    if (!projectName) {
      const { name } = await inquirer.prompt([
        {
          type: "input",
          name: "name",
          message: "Enter project name:",
        },
      ]);
      projectName = name;
    }

    if (!projectName) {
      console.error("Please specify the project name.");
      return;
    }

    // Get project folder path
    const projectFolderPath = path.join(process.cwd(), projectName);

    // Ask user for preferred package manager
    const packageManagerChoice = await askPackageManager();
    const packageManagerCommand = getPackageManagerCommand(packageManagerChoice);

    // Define the command based on the chosen package manager
    let initializationCommand;
    switch (packageManagerChoice) {
      case "npm":
        initializationCommand = "npx";
        break;
      case "yarn":
        initializationCommand = "yarn";
        break;
      case "pnpm":
        initializationCommand = "pnpx";
        break;
      case "bun":
        initializationCommand = "bunx";
        break;
      default:
        console.error("Invalid package manager choice:", packageManagerChoice);
        return;
    }

    // Run initialization command with the chosen package manager
    execCommand(`${initializationCommand} react-native@latest init ${projectName}`);

    // Ask user about setup options
    const setupOptions = await askSetupOptions();

    // Configure project based on user responses
    await configureProject(setupOptions, projectFolderPath, packageManagerChoice);
    await useBlitzTemplate(projectFolderPath, packageManagerChoice);

    console.log(
      "Project setup completed successfully!\nPlease be sure to run pod install in the ios directory if you are developing for iOS as well"
    );
  } catch (error) {
    console.error("Error occurred during project setup:", error);
  }
}

export default blitz;
