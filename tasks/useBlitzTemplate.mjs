import fs from 'fs/promises'
import path from 'path'
import inquirer from 'inquirer'
import { execCommand } from '../utils.mjs'

async function useBlitzTemplate(projectFolderPath, packageManagerChoice) {
  try {
    const { useBlitzTemplate } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'useBlitzTemplate',
        message: 'Do you want to use the React Native Blitz template? This will set up the project with recommended folder structure and unistyles package.'
      }
    ])

    if (!useBlitzTemplate) {
      console.log('Skipping React Native Blitz template setup.')
      return
    }

    const srcFolderPath = path.join(projectFolderPath, 'src')
    const stylesFolderPath = path.join(srcFolderPath, 'styles')

    // Move App.tsx to src folder
    await fs.mkdir(srcFolderPath)
    await fs.rename(`${projectFolderPath}/App.tsx`, `${srcFolderPath}/App.tsx`)

    // Create styles folder and add themes.ts and unistyles.ts
    await fs.mkdir(stylesFolderPath)
    await fs.writeFile(`${stylesFolderPath}/themes.ts`, themesContent)
    await fs.writeFile(`${stylesFolderPath}/unistyles.ts`, unistylesContent)
    await fs.writeFile(`${srcFolderPath}/App.tsx`, appTsContent)
    await fs.writeFile(`${projectFolderPath}/index.js`, indexJsContent)

    console.log('Setting up unistyles...')
    await updatePackageScripts(projectFolderPath, packageManagerChoice)
    execCommand(`cd ${projectFolderPath} && ${packageManagerChoice} install react-native-unistyles && eslint . --ext .js,.jsx,.ts,.tsx --fix && cd ../`)
  } catch (error) {
    console.error('Error occurred while setting up React Native Blitz template:', error)
  }
}

async function updatePackageScripts(projectFolderPath, packageManagerChoice) {
  const packageJsonPath = path.join(projectFolderPath, 'package.json')
  try {
    const packageJsonData = await fs.readFile(packageJsonPath, 'utf-8')
    const packageJson = JSON.parse(packageJsonData)

    packageJson.scripts = {
      "android": "react-native run-android",
      "ios": "react-native run-ios",
      "start": "react-native start",
      "tsc": "tsc",
      "test": "jest",
      "test:watch": "jest --watch",
      "lint": "eslint src --ext .js,.jsx,.ts,.tsx",
      "lint:fix": `${packageManagerChoice} run lint -- --fix`
    }

    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2))
    console.log('Updated package.json with new scripts.')
  } catch (error) {
    console.error('Error occurred while updating package.json:', error)
  }
}

// Define content for indexJsContent, appTsContent, themesContent, and unistylesContent here

const indexJsContent = `
/**
 * @format
 */

import {AppRegistry} from 'react-native'
import App from './src/App'
import {name as appName} from './app.json'

AppRegistry.registerComponent(appName, () => App)
`

const appTsContent = `
import './styles/unistyles';
import {createStyleSheet, useStyles} from 'react-native-unistyles'
import {View, Text} from 'react-native'
import React from 'react'
const App = () => {
  const {styles} = useStyles(stylesheet)

  return (
    <View style={styles.container}>
      <Text style={[styles.text, {fontSize: 14}]}>Welcome to</Text>
      <Text style={styles.text}>React Native (Blitz Edition)</Text>
    </View>
  )
}

export default App;

const stylesheet = createStyleSheet(theme => ({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  text: {
    color: theme.colors.typography,
    fontWeight: 'bold',
    fontSize: 24,
  },
}))
`

const themesContent = `export const lightTheme = {
    colors: {
        typography: '#000000',
        background: '#ffffff'
    }
} as const

export const darkTheme = {
    colors: {
        typography: '#ffffff',
        background: '#000000'
    }
} as const
`

const unistylesContent = `
import { UnistylesRegistry } from 'react-native-unistyles'
import { lightTheme, darkTheme } from './themes'

type AppThemes = {
    light: typeof lightTheme,
    dark: typeof darkTheme
}

declare module 'react-native-unistyles' {
    export interface UnistylesThemes extends AppThemes {}
}

UnistylesRegistry
    .addThemes({
        light: lightTheme,
        dark: darkTheme,
    })
    .addConfig({
        adaptiveThemes: true
    })
`

export default useBlitzTemplate
