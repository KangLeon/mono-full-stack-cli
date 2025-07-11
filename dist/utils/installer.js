"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.installDependencies = installDependencies;
exports.installExtraDependencies = installExtraDependencies;
const child_process_1 = require("child_process");
const util_1 = require("util");
const chalk_1 = __importDefault(require("chalk"));
const package_manager_js_1 = require("./package-manager.js");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
/**
 * 安装项目依赖
 */
async function installDependencies(projectPath, config) {
    const packageManager = (0, package_manager_js_1.getPackageManager)(config.packageManager);
    console.log(chalk_1.default.cyan(`📦 正在使用 ${packageManager.name} 安装依赖...`));
    // 尝试多种安装方案
    const installMethods = [
        // 方案1: 使用用户选择的包管理器
        {
            name: packageManager.name,
            command: packageManager.installCommand,
            description: `使用 ${packageManager.name}`,
        },
        // 方案2: 如果是pnpm，尝试使用npm
        ...(config.packageManager === 'pnpm'
            ? [
                {
                    name: 'npm',
                    command: 'npm install',
                    description: '使用 npm 替代 pnpm',
                },
            ]
            : []),
        // 方案3: 使用淘宝镜像
        {
            name: `${packageManager.name} (淘宝镜像)`,
            command: getInstallCommandWithRegistry(packageManager.installCommand, 'https://registry.npmmirror.com'),
            description: '使用淘宝镜像源',
        },
        // 方案4: 跳过安装，让用户手动安装
        {
            name: '跳过安装',
            command: null,
            description: '跳过依赖安装，稍后手动安装',
        },
    ];
    for (let i = 0; i < installMethods.length; i++) {
        const method = installMethods[i];
        if (method.command === null) {
            // 跳过安装
            console.log(chalk_1.default.yellow('⚠️  跳过依赖安装'));
            console.log(chalk_1.default.gray('请稍后手动运行以下命令安装依赖:'));
            console.log(chalk_1.default.white(`  cd ${projectPath}`));
            console.log(chalk_1.default.white(`  ${packageManager.installCommand}`));
            return;
        }
        try {
            console.log(chalk_1.default.blue(`正在${method.description}...`));
            await execAsync(method.command, {
                cwd: projectPath,
                timeout: 300000, // 5分钟超时
                env: {
                    ...process.env,
                    // 禁用一些可能导致问题的pnpm特性
                    PNPM_DISABLE_WRITE_LOCK: 'true',
                },
            });
            console.log(chalk_1.default.green('✅ 依赖安装完成！'));
            return;
        }
        catch (error) {
            console.log(chalk_1.default.yellow(`⚠️  ${method.description}失败`));
            // 如果不是最后一个方案，继续尝试下一个
            if (i < installMethods.length - 1) {
                console.log(chalk_1.default.blue('正在尝试其他安装方案...'));
                continue;
            }
            else {
                // 所有方案都失败了
                console.error(chalk_1.default.red('❌ 所有依赖安装方案都失败了'));
                console.log();
                console.log(chalk_1.default.yellow('💡 解决建议:'));
                console.log(chalk_1.default.gray('1. 检查网络连接'));
                console.log(chalk_1.default.gray('2. 尝试使用VPN或更换网络'));
                console.log(chalk_1.default.gray('3. 手动安装依赖:'));
                console.log(chalk_1.default.white(`   cd ${projectPath}`));
                console.log(chalk_1.default.white(`   npm install --registry https://registry.npmmirror.com`));
                console.log();
                console.log(chalk_1.default.yellow('项目结构已创建，可以手动安装依赖后继续开发'));
                return; // 不抛出错误，让项目创建成功
            }
        }
    }
}
/**
 * 为安装命令添加registry参数
 */
function getInstallCommandWithRegistry(baseCommand, registry) {
    if (baseCommand.includes('pnpm')) {
        return `${baseCommand} --registry ${registry}`;
    }
    else if (baseCommand.includes('npm')) {
        return `${baseCommand} --registry ${registry}`;
    }
    else if (baseCommand.includes('yarn')) {
        return `${baseCommand} --registry ${registry}`;
    }
    return baseCommand;
}
/**
 * 安装额外依赖（用于简单项目）
 */
async function installExtraDependencies(projectPath, packages, packageManager = 'npm') {
    const commands = {
        npm: `npm install ${packages.join(' ')}`,
        pnpm: `pnpm add ${packages.join(' ')}`,
        yarn: `yarn add ${packages.join(' ')}`,
    };
    const command = commands[packageManager] || commands.npm;
    try {
        await execAsync(command, { cwd: projectPath });
        console.log(chalk_1.default.green('✅ 额外依赖安装完成'));
    }
    catch (error) {
        // 尝试使用镜像源
        try {
            const commandWithRegistry = getInstallCommandWithRegistry(command, 'https://registry.npmmirror.com');
            await execAsync(commandWithRegistry, { cwd: projectPath });
            console.log(chalk_1.default.green('✅ 额外依赖安装完成（使用镜像源）'));
        }
        catch (retryError) {
            console.log(chalk_1.default.yellow('⚠️  额外依赖安装失败，但项目已创建成功'));
            console.log(chalk_1.default.gray(`手动安装: ${command}`));
        }
    }
}
//# sourceMappingURL=installer.js.map