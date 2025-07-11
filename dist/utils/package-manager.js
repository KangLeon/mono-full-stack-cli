"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectPackageManager = detectPackageManager;
exports.getPackageManager = getPackageManager;
exports.isPackageManagerInstalled = isPackageManagerInstalled;
const child_process_1 = require("child_process");
/**
 * 检测系统中可用的包管理器
 */
function detectPackageManager() {
    try {
        (0, child_process_1.execSync)('pnpm --version', { stdio: 'ignore' });
        return 'pnpm';
    }
    catch { }
    try {
        (0, child_process_1.execSync)('yarn --version', { stdio: 'ignore' });
        return 'yarn';
    }
    catch { }
    return 'npm';
}
/**
 * 获取包管理器配置
 */
function getPackageManager(name) {
    const managers = {
        npm: {
            name: 'npm',
            installCommand: 'npm install',
            devCommand: 'npm run dev',
            buildCommand: 'npm run build',
        },
        pnpm: {
            name: 'pnpm',
            installCommand: 'pnpm install',
            devCommand: 'pnpm dev',
            buildCommand: 'pnpm build',
        },
        yarn: {
            name: 'yarn',
            installCommand: 'yarn',
            devCommand: 'yarn dev',
            buildCommand: 'yarn build',
        },
    };
    return managers[name];
}
/**
 * 检查包管理器是否安装
 */
function isPackageManagerInstalled(name) {
    try {
        (0, child_process_1.execSync)(`${name} --version`, { stdio: 'ignore' });
        return true;
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=package-manager.js.map