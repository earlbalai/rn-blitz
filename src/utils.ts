import { execSync } from "child_process"

export function execCommand(command: string): void {
  try {
    execSync(command, { stdio: "inherit" })
  } catch (error) {
    console.error("Error executing command:", error)
    process.exit(1)
  }
}
