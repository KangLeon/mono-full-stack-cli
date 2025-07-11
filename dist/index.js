#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const gradient_string_1 = __importDefault(require("gradient-string"));
const create_js_1 = require("./commands/create.js");
const validation_js_1 = require("./utils/validation.js");
const package_json_1 = require("../package.json");
const program = new commander_1.Command();
// 显示欢迎横幅
function showBanner() {
    const title = gradient_string_1.default.pastel.multiline([
        '╔══════════════════════════════════════════════════════════════╗',
        '║                                                              ║',
        '║    🚀 Mono Full-Stack CLI - 全栈脚手架工具                   ║',
        '║                                                              ║',
        '║    快速创建 NextJS + NestJS + React Native Monorepo 项目     ║',
        '║                                                              ║',
        '╚══════════════════════════════════════════════════════════════╝',
    ].join('\n'));
    console.log(title);
    console.log();
}
async function main() {
    try {
        // 验证Node.js版本
        (0, validation_js_1.validateNodeVersion)();
        // 显示横幅
        showBanner();
        program
            .name('mono-cli')
            .description('一个快速创建全栈monorepo项目的脚手架CLI工具')
            .version(package_json_1.version, '-v, --version', '显示版本信息');
        program
            .command('create [project-name]')
            .description('创建一个新的全栈monorepo项目')
            .option('-t, --template <template>', '指定项目模板 (frontend-only, fullstack, mobile-app, complete)')
            .option('-y, --yes', '使用默认配置，跳过交互式提示')
            .option('--skip-install', '跳过依赖安装')
            .action(async (projectName, options) => {
            await (0, create_js_1.createProject)(projectName, options);
        });
        program
            .command('init')
            .description('在当前目录初始化monorepo项目')
            .option('-t, --template <template>', '指定项目模板')
            .option('-y, --yes', '使用默认配置')
            .option('--skip-install', '跳过依赖安装')
            .action(async (options) => {
            await (0, create_js_1.createProject)('.', { ...options, init: true });
        });
        // 解析命令行参数
        await program.parseAsync(process.argv);
        // 如果没有提供任何参数，显示帮助信息
        if (!process.argv.slice(2).length) {
            program.outputHelp();
            console.log();
            console.log(chalk_1.default.cyan('💡 快速开始:'));
            console.log(chalk_1.default.gray('  $ mono-cli create my-app'));
            console.log(chalk_1.default.gray('  $ cd my-app'));
            console.log(chalk_1.default.gray('  $ pnpm dev'));
            console.log();
            console.log(chalk_1.default.cyan('🔗 更多信息:'));
            console.log(chalk_1.default.gray('  文档: https://github.com/leona-team/mono-full-stack-cli'));
            console.log();
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('❌ 错误:'), error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}
// 处理未捕获的异常
process.on('uncaughtException', (error) => {
    console.error(chalk_1.default.red('❌ 未捕获的异常:'), error);
    process.exit(1);
});
process.on('unhandledRejection', (reason) => {
    console.error(chalk_1.default.red('❌ 未处理的Promise拒绝:'), reason);
    process.exit(1);
});
// 优雅退出
process.on('SIGINT', () => {
    console.log(chalk_1.default.yellow('\n👋 再见！'));
    process.exit(0);
});
main().catch((error) => {
    console.error(chalk_1.default.red('❌ 启动失败:'), error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map