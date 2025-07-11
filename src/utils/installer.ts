import { exec } from 'child_process'
import { promisify } from 'util'
import chalk from 'chalk'
import { ProjectConfig } from '../types/index.js'
import { getPackageManager } from './package-manager.js'

const execAsync = promisify(exec)

/**
 * 安装项目依赖
 */
export async function installDependencies(
    projectPath: string,
    config: ProjectConfig
): Promise<void> {
    const packageManager = getPackageManager(config.packageManager)

    console.log(chalk.cyan(`📦 正在使用 ${packageManager.name} 安装依赖...`))

    try {
        // 安装根目录依赖
        await execAsync(packageManager.installCommand, {
            cwd: projectPath,
        })

        console.log(chalk.green('✅ 依赖安装完成！'))
    } catch (error) {
        console.error(chalk.red('❌ 依赖安装失败:'), error)
        throw error
    }
}
