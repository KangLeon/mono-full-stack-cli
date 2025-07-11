import semver from 'semver'
import chalk from 'chalk'
import validateNpmPackageName from 'validate-npm-package-name'

/**
 * 验证Node.js版本
 */
export function validateNodeVersion(): void {
    const currentVersion = process.version
    const requiredVersion = '18.0.0'

    if (!semver.gte(currentVersion, requiredVersion)) {
        console.error(
            chalk.red(
                `❌ 需要 Node.js ${requiredVersion} 或更高版本，当前版本: ${currentVersion}`
            )
        )
        console.error(chalk.gray('请升级 Node.js: https://nodejs.org/'))
        process.exit(1)
    }
}

/**
 * 验证项目名称
 */
export function validateProjectName(name: string): {
    valid: boolean
    problems?: string[]
} {
    const validation = validateNpmPackageName(name)

    if (!validation.validForNewPackages) {
        return {
            valid: false,
            problems: [
                ...(validation.errors || []),
                ...(validation.warnings || []),
            ],
        }
    }

    return { valid: true }
}

/**
 * 检查目录是否为空
 */
export function isDirectoryEmpty(path: string): boolean {
    const fs = require('fs')

    if (!fs.existsSync(path)) {
        return true
    }

    const files = fs.readdirSync(path)
    return files.length === 0 || (files.length === 1 && files[0] === '.git')
}

/**
 * 检查是否在Git仓库中
 */
export function isInGitRepository(): boolean {
    const fs = require('fs')
    const path = require('path')

    let dir = process.cwd()

    do {
        if (fs.existsSync(path.join(dir, '.git'))) {
            return true
        }
        dir = path.dirname(dir)
    } while (dir !== path.dirname(dir))

    return false
}
