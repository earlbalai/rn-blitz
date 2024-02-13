// setupOptions.js
import inquirer from 'inquirer'

export async function askSetupOptions() {
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
  ])
}
