"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateProject = generateProject;
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const lerna_js_1 = require("./lerna.js");
const nextjs_js_1 = require("./nextjs.js");
const nestjs_js_1 = require("./nestjs.js");
const react_native_js_1 = require("./react-native.js");
const installer_js_1 = require("../utils/installer.js");
/**
 * 生成完整项目
 */
async function generateProject(projectPath, config) {
    const spinner = (0, ora_1.default)('正在创建项目...').start();
    try {
        // 创建项目目录
        await fs_extra_1.default.ensureDir(projectPath);
        process.chdir(projectPath);
        // 生成Lerna monorepo配置
        spinner.text = '正在配置monorepo...';
        await (0, lerna_js_1.generateLernaConfig)(projectPath, config);
        // 生成各个应用
        if (config.features.frontend) {
            spinner.text = '正在创建前端应用 (NextJS)...';
            await (0, nextjs_js_1.generateNextjsApp)(projectPath, config);
        }
        if (config.features.backend) {
            spinner.text = '正在创建后端应用 (NestJS)...';
            await (0, nestjs_js_1.generateNestjsApp)(projectPath, config);
        }
        if (config.features.mobile) {
            spinner.text = '正在创建移动端应用 (React Native)...';
            await (0, react_native_js_1.generateReactNativeApp)(projectPath, config);
        }
        // 安装依赖
        if (!config.skipInstall) {
            spinner.text = '正在安装依赖...';
            await (0, installer_js_1.installDependencies)(projectPath, config);
        }
        spinner.succeed(chalk_1.default.green('项目创建完成！'));
    }
    catch (error) {
        spinner.fail(chalk_1.default.red('项目创建失败'));
        throw error;
    }
}
//# sourceMappingURL=index.js.map