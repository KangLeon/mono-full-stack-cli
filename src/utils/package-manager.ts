import { execSync } from 'child_process'
import { PackageManager } from '../types/index.js'

/**
 * 检测系统中可用的包管理器
 */
export function detectPackageManager(): 'npm' | 'pnpm' | 'yarn' {
    try {
        execSync('pnpm --version', { stdio: 'ignore' })
        return 'pnpm'
    } catch {}

    try {
        execSync('yarn --version', { stdio: 'ignore' })
        return 'yarn'
    } catch {}

    return 'npm'
}

/**
 * 获取包管理器配置
 */
export function getPackageManager(
    name: 'npm' | 'pnpm' | 'yarn'
): PackageManager {
    const managers: Record<string, PackageManager> = {
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
    }

    return managers[name]
}

/**
 * 检查包管理器是否安装
 */
export function isPackageManagerInstalled(
    name: 'npm' | 'pnpm' | 'yarn'
): boolean {
    try {
        execSync(`${name} --version`, { stdio: 'ignore' })
        return true
    } catch {
        return false
    }
}
