import chalk from 'chalk'
import ora from 'ora'
import path from 'path'
import fs from 'fs-extra'
import { ProjectConfig } from '../types/index.js'
import { generateLernaConfig } from './lerna.js'
import { generateNextjsApp } from './nextjs.js'
import { generateNestjsApp } from './nestjs.js'
import { generateReactNativeApp } from './react-native.js'
import { installDependencies } from '../utils/installer.js'

/**
 * 生成完整项目
 */
export async function generateProject(
    projectPath: string,
    config: ProjectConfig
): Promise<void> {
    const spinner = ora('正在创建项目...').start()

    try {
        // 创建项目目录
        await fs.ensureDir(projectPath)
        process.chdir(projectPath)

        // 生成Lerna monorepo配置
        spinner.text = '正在配置monorepo...'
        await generateLernaConfig(projectPath, config)

        // 生成各个应用
        if (config.features.frontend) {
            spinner.text = '正在创建前端应用 (NextJS)...'
            await generateNextjsApp(projectPath, config)
        }

        if (config.features.backend) {
            spinner.text = '正在创建后端应用 (NestJS)...'
            await generateNestjsApp(projectPath, config)
        }

        if (config.features.mobile) {
            spinner.text = '正在创建移动端应用 (React Native)...'
            await generateReactNativeApp(projectPath, config)
        }

        // 安装依赖
        if (!config.skipInstall) {
            spinner.text = '正在安装依赖...'
            await installDependencies(projectPath, config)
        }

        spinner.succeed(chalk.green('项目创建完成！'))
    } catch (error) {
        spinner.fail(chalk.red('项目创建失败'))
        throw error
    }
}
