"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.installDependencies = installDependencies;
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
    try {
        // 安装根目录依赖
        await execAsync(packageManager.installCommand, {
            cwd: projectPath,
        });
        console.log(chalk_1.default.green('✅ 依赖安装完成！'));
    }
    catch (error) {
        console.error(chalk_1.default.red('❌ 依赖安装失败:'), error);
        throw error;
    }
}
//# sourceMappingURL=installer.js.map