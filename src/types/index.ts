/**
 * 项目模板类型
 */
export type ProjectTemplate =
    | 'frontend-only' // 仅前端 (NextJS)
    | 'fullstack' // 全栈 (NextJS + NestJS)
    | 'mobile-app' // 移动端 (NestJS + React Native)
    | 'complete' // 完整版 (NextJS + NestJS + React Native)

/**
 * CLI选项接口
 */
export interface CreateOptions {
    template?: ProjectTemplate
    yes?: boolean
    skipInstall?: boolean
    init?: boolean
}

/**
 * 项目配置接口
 */
export interface ProjectConfig {
    name: string
    template: ProjectTemplate
    features: {
        frontend: boolean
        backend: boolean
        mobile: boolean
    }
    packageManager: 'npm' | 'pnpm' | 'yarn'
    skipInstall: boolean
}

/**
 * 包管理器信息
 */
export interface PackageManager {
    name: 'npm' | 'pnpm' | 'yarn'
    installCommand: string
    devCommand: string
    buildCommand: string
}

/**
 * 生成器选项
 */
export interface GeneratorOptions {
    projectPath: string
    config: ProjectConfig
    packageManager: PackageManager
}
