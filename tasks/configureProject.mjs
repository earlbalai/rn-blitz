import fs from 'fs/promises'

async function configureProject(setupOptions, projectFolderPath, packageManagerChoice) {
    if (setupOptions.useRecommendedLinting) {
        await writeEslintrc(projectFolderPath)
        await writePrettierrc(projectFolderPath)
    }

    if (setupOptions.setupVSCodeSettings) {
        await writeVscodeSettings(projectFolderPath)
    }

    await updatePackageJson(projectFolderPath, packageManagerChoice)
}

async function writeEslintrc(projectFolderPath) {
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
}      
`
    await writeFile(projectFolderPath, '.eslintrc.js', eslintConfig)
}

async function writePrettierrc(projectFolderPath) {
    const prettierConfig = `module.exports = {
  arrowParens: 'avoid',
  bracketSameLine: true,
  bracketSpacing: false,
  singleQuote: true,
  trailingComma: 'all',
  semi: false,
}`
    await writeFile(projectFolderPath, '.prettierrc.js', prettierConfig)
}

async function writeVscodeSettings(projectFolderPath) {
    const vscodeSettings = {
        'editor.formatOnSave': true,
        '[javascript]': { 'editor.defaultFormatter': 'dbaeumer.vscode-eslint' },
        '[typescript]': { 'editor.defaultFormatter': 'dbaeumer.vscode-eslint' },
    }
    await fs.mkdir(`${projectFolderPath}/.vscode`, { recursive: true })
    await fs.writeFile(`${projectFolderPath}/.vscode/settings.json`, JSON.stringify(vscodeSettings, null, 2), 'utf8')
}

async function updatePackageJson(projectFolderPath, packageManagerChoice) {
    const packageJsonPath = `${projectFolderPath}/package.json`
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'))
    const devDependencies = {
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
    }

    packageJson.devDependencies = devDependencies

    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8')
}

async function writeFile(folderPath, fileName, content) {
    await fs.writeFile(`${folderPath}/${fileName}`, content, 'utf8')
}

export default configureProject
