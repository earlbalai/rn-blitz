// tasks/utils.js
import { execSync } from 'child_process'

export function execCommand(command) {
  try {
    execSync(command, { stdio: 'inherit' })
  } catch (error) {
    console.error('Error executing command:', error)
    process.exit(1)
  }
}
