import { ProjectConfig } from '../types/index.js';
/**
 * 安装项目依赖
 */
export declare function installDependencies(projectPath: string, config: ProjectConfig): Promise<void>;
/**
 * 安装额外依赖（用于简单项目）
 */
export declare function installExtraDependencies(projectPath: string, packages: string[], packageManager?: string): Promise<void>;
//# sourceMappingURL=installer.d.ts.map