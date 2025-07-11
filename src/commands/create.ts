import inquirer from 'inquirer'
import chalk from 'chalk'
import ora from 'ora'
import path from 'path'
import fs from 'fs-extra'
import {
    CreateOptions,
    ProjectConfig,
    ProjectTemplate,
} from '../types/index.js'
import { validateProjectName, isDirectoryEmpty } from '../utils/validation.js'
import {
    getPackageManager,
    detectPackageManager,
} from '../utils/package-manager.js'
import { generateProject } from '../generators/index.js'

/**
 * 创建项目主函数
 */
export async function createProject(
    projectName: string | undefined,
    options: CreateOptions
): Promise<void> {
    let projectPath: string
    let finalProjectName: string

    // 处理项目名称和路径
    if (options.init) {
        projectPath = process.cwd()
        finalProjectName = path.basename(projectPath)

        // 检查当前目录是否为空
        if (!isDirectoryEmpty(projectPath)) {
            const { proceed } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'proceed',
                    message: '当前目录不为空，是否继续初始化？',
                    default: false,
                },
            ])

            if (!proceed) {
                console.log(chalk.yellow('已取消初始化'))
                return
            }
        }
    } else {
        // 获取项目名称
        if (!projectName) {
            const { name } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'name',
                    message: '请输入项目名称:',
                    default: 'my-mono-app',
                    validate: (input: string) => {
                        const validation = validateProjectName(input)
                        if (!validation.valid && validation.problems) {
                            return `项目名称无效:\n${validation.problems
                                .map((p) => `  - ${p}`)
                                .join('\n')}`
                        }
                        return true
                    },
                },
            ])
            finalProjectName = name
        } else {
            finalProjectName = projectName

            // 验证项目名称
            const validation = validateProjectName(finalProjectName)
            if (!validation.valid && validation.problems) {
                console.error(chalk.red('❌ 项目名称无效:'))
                validation.problems.forEach((problem) => {
                    console.error(chalk.red(`  - ${problem}`))
                })
                process.exit(1)
            }
        }

        projectPath = path.resolve(finalProjectName)

        // 检查目录是否存在
        if (fs.existsSync(projectPath)) {
            if (!isDirectoryEmpty(projectPath)) {
                console.error(
                    chalk.red(`❌ 目录 "${finalProjectName}" 已存在且不为空`)
                )
                process.exit(1)
            }
        }
    }

    console.log()
    console.log(chalk.cyan(`📁 项目路径: ${projectPath}`))
    console.log()

    // 获取项目配置
    const config = await getProjectConfig(finalProjectName, options)

    // 创建项目
    await generateProject(projectPath, config)

    // 显示完成信息
    showCompletionMessage(projectPath, config)
}

/**
 * 获取项目配置
 */
async function getProjectConfig(
    projectName: string,
    options: CreateOptions
): Promise<ProjectConfig> {
    let template: ProjectTemplate
    let packageManager = detectPackageManager()

    if (options.yes || options.template) {
        // 使用指定的模板或默认配置
        template = options.template || 'fullstack'
        // 如果指定了模板但没有-y，仍需要选择包管理器
        if (!options.yes && options.template) {
            const answers = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'packageManager',
                    message: '选择包管理器:',
                    choices: [
                        { name: 'pnpm (推荐)', value: 'pnpm' },
                        { name: 'npm', value: 'npm' },
                        { name: 'yarn', value: 'yarn' },
                    ],
                    default: packageManager,
                },
            ])
            packageManager = answers.packageManager
        }
    } else {
        // 交互式配置
        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'template',
                message: '选择项目模板:',
                choices: [
                    {
                        name: '🌐 仅前端 (NextJS)',
                        value: 'frontend-only',
                        short: '前端',
                    },
                    {
                        name: '🔥 全栈 (NextJS + NestJS)',
                        value: 'fullstack',
                        short: '全栈',
                    },
                    {
                        name: '📱 移动端 (React Native + NestJS)',
                        value: 'mobile-app',
                        short: '移动端',
                    },
                    {
                        name: '🚀 完整版 (NextJS + NestJS + React Native)',
                        value: 'complete',
                        short: '完整版',
                    },
                ],
                default: 'fullstack',
            },
            {
                type: 'list',
                name: 'packageManager',
                message: '选择包管理器:',
                choices: [
                    { name: 'pnpm (推荐)', value: 'pnpm' },
                    { name: 'npm', value: 'npm' },
                    { name: 'yarn', value: 'yarn' },
                ],
                default: packageManager,
            },
        ])

        template = answers.template
        packageManager = answers.packageManager
    }

    // 根据模板确定功能特性
    const features = {
        frontend:
            template === 'frontend-only' ||
            template === 'fullstack' ||
            template === 'complete',
        backend:
            template === 'fullstack' ||
            template === 'mobile-app' ||
            template === 'complete',
        mobile: template === 'mobile-app' || template === 'complete',
    }

    return {
        name: projectName,
        template,
        features,
        packageManager,
        skipInstall: options.skipInstall || false,
    }
}

/**
 * 显示完成信息
 */
function showCompletionMessage(
    projectPath: string,
    config: ProjectConfig
): void {
    const projectName = path.basename(projectPath)
    const packageManager = getPackageManager(config.packageManager)

    console.log()
    console.log(chalk.green('🎉 项目创建成功！'))
    console.log()

    // 显示项目信息
    console.log(chalk.cyan('📋 项目信息:'))
    console.log(chalk.gray(`  名称: ${config.name}`))
    console.log(
        chalk.gray(`  模板: ${getTemplateDisplayName(config.template)}`)
    )
    console.log(chalk.gray(`  路径: ${projectPath}`))

    if (config.features.frontend) {
        console.log(chalk.gray('  ✅ 前端 (NextJS)'))
    }
    if (config.features.backend) {
        console.log(chalk.gray('  ✅ 后端 (NestJS + Drizzle ORM + PostgreSQL)'))
    }
    if (config.features.mobile) {
        console.log(chalk.gray('  ✅ 移动端 (React Native Expo)'))
    }

    console.log()

    // 显示后续步骤
    console.log(chalk.cyan('🚀 开始开发:'))

    if (projectName !== '.') {
        console.log(chalk.white(`  cd ${projectName}`))
    }

    if (config.skipInstall) {
        console.log(chalk.white(`  ${packageManager.installCommand}`))
    }

    console.log(chalk.white(`  ${packageManager.devCommand}`))
    console.log()

    // 显示相关链接
    console.log(chalk.cyan('📚 文档链接:'))
    console.log(chalk.gray('  NextJS: https://nextjs.org/docs'))

    if (config.features.backend) {
        console.log(chalk.gray('  NestJS: https://docs.nestjs.com'))
        console.log(chalk.gray('  Drizzle ORM: https://orm.drizzle.team'))
    }

    if (config.features.mobile) {
        console.log(chalk.gray('  Expo: https://docs.expo.dev'))
    }

    console.log(chalk.gray('  Lerna: https://lerna.js.org/docs'))
    console.log()
}

/**
 * 获取模板显示名称
 */
function getTemplateDisplayName(template: ProjectTemplate): string {
    const names = {
        'frontend-only': '仅前端',
        fullstack: '全栈',
        'mobile-app': '移动端',
        complete: '完整版',
    }

    return names[template]
}
