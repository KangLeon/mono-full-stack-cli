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
    // 针对pnpm的优化方案
    if (config.packageManager === 'pnpm') {
        const pnpmMethods = [
            // 方案1: 标准pnpm安装
            {
                name: 'pnpm (标准)',
                command: 'pnpm install',
                description: '使用标准pnpm安装',
            },
            // 方案2: pnpm关闭严格检查
            {
                name: 'pnpm (宽松模式)',
                command: 'pnpm install --no-strict-peer-deps --shamefully-hoist',
                description: '使用pnpm宽松模式',
            },
            // 方案3: pnpm清除缓存后安装
            {
                name: 'pnpm (清除缓存)',
                command: 'pnpm store prune && pnpm install --force',
                description: '清除pnpm缓存后重新安装',
            },
            // 方案4: pnpm使用npm模式
            {
                name: 'pnpm (npm模式)',
                command: 'pnpm install --config.node-linker=hoisted --config.package-import-method=copy',
                description: '使用pnpm的npm兼容模式',
            },
            // 最后方案: 使用npm作为备用
            {
                name: 'npm (备用)',
                command: 'npm install --legacy-peer-deps',
                description: '使用npm作为备用方案',
            },
        ];
        await tryInstallMethods(pnpmMethods, projectPath, packageManager);
    }
    else {
        // 非pnpm的安装方案
        const otherMethods = [
            // 方案1: 标准安装
            {
                name: packageManager.name,
                command: packageManager.installCommand,
                description: `使用 ${packageManager.name}`,
            },
            // 方案2: 使用legacy模式（针对npm/yarn）
            {
                name: `${packageManager.name} (legacy)`,
                command: config.packageManager === 'npm'
                    ? 'npm install --legacy-peer-deps'
                    : packageManager.installCommand + ' --ignore-engines',
                description: `使用 ${packageManager.name} 兼容模式`,
            },
        ];
        await tryInstallMethods(otherMethods, projectPath, packageManager);
    }
}
/**
 * 尝试多种安装方法
 */
async function tryInstallMethods(methods, projectPath, packageManager) {
    for (let i = 0; i < methods.length; i++) {
        const method = methods[i];
        try {
            console.log(chalk_1.default.blue(`正在${method.description}...`));
            await execAsync(method.command, {
                cwd: projectPath,
                timeout: 300000, // 5分钟超时
                env: {
                    ...process.env,
                    // 禁用一些可能导致问题的特性
                    PNPM_DISABLE_WRITE_LOCK: 'false',
                    NPM_CONFIG_FUND: 'false',
                    NPM_CONFIG_AUDIT: 'false',
                },
            });
            console.log(chalk_1.default.green('✅ 依赖安装完成！'));
            return;
        }
        catch (error) {
            console.log(chalk_1.default.yellow(`⚠️  ${method.description}失败`));
            // 显示错误信息（仅显示关键部分）
            if (error instanceof Error && error.message) {
                const errorLines = error.message.split('\n');
                const relevantError = errorLines.find((line) => line.includes('ERR_') ||
                    line.includes('ENOENT') ||
                    line.includes('EACCES') ||
                    line.includes('timeout'));
                if (relevantError) {
                    console.log(chalk_1.default.gray(`   ${relevantError.trim()}`));
                }
            }
            // 如果不是最后一个方案，继续尝试下一个
            if (i < methods.length - 1) {
                console.log(chalk_1.default.blue('正在尝试其他安装方案...'));
                continue;
            }
            else {
                // 所有方案都失败了
                console.error(chalk_1.default.red('❌ 所有依赖安装方案都失败了'));
                console.log();
                console.log(chalk_1.default.yellow('💡 解决建议:'));
                console.log(chalk_1.default.gray('1. 检查Node.js版本是否兼容 (建议 Node.js 18+)'));
                console.log(chalk_1.default.gray('2. 尝试升级pnpm: npm install -g pnpm@latest'));
                console.log(chalk_1.default.gray('3. 清除所有缓存:'));
                console.log(chalk_1.default.white(`   pnpm store prune`));
                console.log(chalk_1.default.white(`   npm cache clean --force`));
                console.log(chalk_1.default.gray('4. 手动安装依赖:'));
                console.log(chalk_1.default.white(`   cd ${projectPath}`));
                console.log(chalk_1.default.white(`   ${packageManager.installCommand}`));
                console.log();
                console.log(chalk_1.default.yellow('项目结构已创建，可以手动安装依赖后继续开发'));
                return; // 不抛出错误，让项目创建成功
            }
        }
    }
}
/**
 * 安装额外依赖（用于简单项目）
 */
async function installExtraDependencies(projectPath, packages, packageManager = 'pnpm') {
    const commands = {
        npm: `npm install ${packages.join(' ')} --legacy-peer-deps`,
        pnpm: `pnpm add ${packages.join(' ')} --no-strict-peer-deps`,
        yarn: `yarn add ${packages.join(' ')}`,
    };
    const command = commands[packageManager] || commands.pnpm;
    try {
        console.log(chalk_1.default.blue('正在安装UI组件依赖...'));
        await execAsync(command, {
            cwd: projectPath,
            timeout: 120000, // 2分钟超时
        });
        console.log(chalk_1.default.green('✅ UI组件依赖安装完成'));
    }
    catch (error) {
        // 尝试使用更宽松的安装方式
        try {
            const fallbackCommand = packageManager === 'pnpm'
                ? `pnpm add ${packages.join(' ')} --shamefully-hoist --force`
                : `npm install ${packages.join(' ')} --force`;
            console.log(chalk_1.default.blue('正在使用宽松模式重试...'));
            await execAsync(fallbackCommand, { cwd: projectPath });
            console.log(chalk_1.default.green('✅ UI组件依赖安装完成（宽松模式）'));
        }
        catch (retryError) {
            console.log(chalk_1.default.yellow('⚠️  UI组件依赖安装失败，但项目已创建成功'));
            console.log(chalk_1.default.gray('手动安装UI组件:'));
            console.log(chalk_1.default.white(`  cd ${projectPath}`));
            console.log(chalk_1.default.white(`  ${command}`));
        }
    }
}
//# sourceMappingURL=installer.js.map