import fs from "fs/promises"

interface SetupOptions {
  useRecommendedLinting: boolean
  setupVSCodeSettings: boolean
}

type PackageManagerChoice = string // Change this to a more specific type if possible

async function configureProject(
  setupOptions: SetupOptions,
  projectFolderPath: string,
  packageManagerChoice: PackageManagerChoice,
): Promise<void> {
  if (setupOptions.useRecommendedLinting) {
    await writeEslintrc(projectFolderPath)
    await writePrettierrc(projectFolderPath)
  }

  if (setupOptions.setupVSCodeSettings) {
    await writeVscodeSettings(projectFolderPath)
  }

  await updatePackageJson(projectFolderPath, packageManagerChoice)
}

async function writeEslintrc(projectFolderPath: string): Promise<void> {
  const eslintConfig = `module.exports = {
    root: true,
    extends: '@react-native',
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    overrides: [
        {
        files: ['*.js', '*.jsx', '*.ts', '*.tsx'],
        rules: {
            'react-native/no-inline-styles': 'off',
            '@typescript-eslint/no-shadow': ['error'],
            'no-shadow': 'off',
            'no-undef': 'off',
            semi: ['error', 'never'],
        },
        },
    ],
}`
  await writeFile(projectFolderPath, ".eslintrc.js", eslintConfig)
}

async function writePrettierrc(projectFolderPath: string): Promise<void> {
  const prettierConfig = `module.exports = {
  arrowParens: 'avoid',
  bracketSameLine: true,
  bracketSpacing: false,
  singleQuote: true,
  trailingComma: 'all',
  semi: false,
}`
  await writeFile(projectFolderPath, ".prettierrc.js", prettierConfig)
}

async function writeVscodeSettings(projectFolderPath: string): Promise<void> {
  const vscodeSettings = {
    "editor.formatOnSave": true,
    "[javascript]": { "editor.defaultFormatter": "dbaeumer.vscode-eslint" },
    "[typescript]": { "editor.defaultFormatter": "dbaeumer.vscode-eslint" },
  }
  await fs.mkdir(`${projectFolderPath}/.vscode`, { recursive: true })
  await fs.writeFile(
    `${projectFolderPath}/.vscode/settings.json`,
    JSON.stringify(vscodeSettings, null, 2),
    "utf8",
  )
}

async function updatePackageJson(
  projectFolderPath: string,
  packageManagerChoice: PackageManagerChoice,
): Promise<void> {
  const packageJsonPath = `${projectFolderPath}/package.json`
  const packageJsonString = await fs.readFile(packageJsonPath, "utf8")
  const packageJson = JSON.parse(packageJsonString)

  const devDependencies = {
    ...packageJson.devDependencies,
    "@babel/core": "^7.20.0",
    // Add other dependencies here
  }

  packageJson.devDependencies = devDependencies

  await fs.writeFile(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2),
    "utf8",
  )
}

async function writeFile(
  folderPath: string,
  fileName: string,
  content: string,
): Promise<void> {
  await fs.writeFile(`${folderPath}/${fileName}`, content, "utf8")
}

export default configureProject
