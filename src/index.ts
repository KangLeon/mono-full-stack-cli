#!/usr/bin/env node

import { Command } from 'commander'
import chalk from 'chalk'
import gradient from 'gradient-string'
import { createProject } from './commands/create.js'
import { validateNodeVersion } from './utils/validation.js'
import { version } from '../package.json'

const program = new Command()

// 显示欢迎横幅
function showBanner() {
    const title = gradient.pastel.multiline(
        [
            '╔══════════════════════════════════════════════════════════════╗',
            '║                                                              ║',
            '║    🚀 Mono Full-Stack CLI - 全栈脚手架工具                   ║',
            '║                                                              ║',
            '║    快速创建 NextJS + NestJS + React Native Monorepo 项目     ║',
            '║                                                              ║',
            '╚══════════════════════════════════════════════════════════════╝',
        ].join('\n')
    )

    console.log(title)
    console.log()
}

async function main() {
    try {
        // 验证Node.js版本
        validateNodeVersion()

        // 显示横幅
        showBanner()

        program
            .name('mono-cli')
            .description('一个快速创建全栈monorepo项目的脚手架CLI工具')
            .version(version, '-v, --version', '显示版本信息')

        // 支持直接传递项目名称：create-mono-app my-app 或 mono-cli my-app
        program
            .argument('[project-name]', '项目名称')
            .option(
                '-t, --template <template>',
                '指定项目模板 (frontend-only, fullstack, mobile-app, complete)'
            )
            .option('-y, --yes', '使用默认配置，跳过交互式提示')
            .option('--skip-install', '跳过依赖安装')
            .action(async (projectName, options) => {
                if (projectName) {
                    await createProject(projectName, options)
                } else {
                    // 如果没有提供项目名称，显示帮助
                    program.outputHelp()
                    console.log()
                    console.log(chalk.cyan('💡 快速开始:'))
                    console.log(chalk.gray('  $ create-mono-app my-app'))
                    console.log(chalk.gray('  $ mono-cli my-app'))
                    console.log(chalk.gray('  $ cd my-app'))
                    console.log(chalk.gray('  $ pnpm dev'))
                    console.log()
                    console.log(chalk.cyan('🔗 更多信息:'))
                    console.log(
                        chalk.gray(
                            '  文档: https://github.com/KangLeon/mono-full-stack-cli'
                        )
                    )
                    console.log()
                }
            })

        program
            .command('create [project-name]')
            .description('创建一个新的全栈monorepo项目')
            .option(
                '-t, --template <template>',
                '指定项目模板 (frontend-only, fullstack, mobile-app, complete)'
            )
            .option('-y, --yes', '使用默认配置，跳过交互式提示')
            .option('--skip-install', '跳过依赖安装')
            .action(async (projectName, options) => {
                await createProject(projectName, options)
            })

        program
            .command('init')
            .description('在当前目录初始化monorepo项目')
            .option('-t, --template <template>', '指定项目模板')
            .option('-y, --yes', '使用默认配置')
            .option('--skip-install', '跳过依赖安装')
            .action(async (options) => {
                await createProject('.', { ...options, init: true })
            })

        // 解析命令行参数
        await program.parseAsync(process.argv)
    } catch (error) {
        console.error(
            chalk.red('❌ 错误:'),
            error instanceof Error ? error.message : String(error)
        )
        process.exit(1)
    }
}

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
    console.error(chalk.red('❌ 未捕获的异常:'), error)
    process.exit(1)
})

process.on('unhandledRejection', (reason) => {
    console.error(chalk.red('❌ 未处理的Promise拒绝:'), reason)
    process.exit(1)
})

// 优雅退出
process.on('SIGINT', () => {
    console.log(chalk.yellow('\n👋 再见！'))
    process.exit(0)
})

main().catch((error) => {
    console.error(chalk.red('❌ 启动失败:'), error)
    process.exit(1)
})
