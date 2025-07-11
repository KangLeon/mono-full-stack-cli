import { PackageManager } from '../types/index.js';
/**
 * 检测系统中可用的包管理器
 */
export declare function detectPackageManager(): 'npm' | 'pnpm' | 'yarn';
/**
 * 获取包管理器配置
 */
export declare function getPackageManager(name: 'npm' | 'pnpm' | 'yarn'): PackageManager;
/**
 * 检查包管理器是否安装
 */
export declare function isPackageManagerInstalled(name: 'npm' | 'pnpm' | 'yarn'): boolean;
//# sourceMappingURL=package-manager.d.ts.map