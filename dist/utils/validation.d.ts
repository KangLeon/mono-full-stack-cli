/**
 * 验证Node.js版本
 */
export declare function validateNodeVersion(): void;
/**
 * 验证项目名称
 */
export declare function validateProjectName(name: string): {
    valid: boolean;
    problems?: string[];
};
/**
 * 检查目录是否为空
 */
export declare function isDirectoryEmpty(path: string): boolean;
/**
 * 检查是否在Git仓库中
 */
export declare function isInGitRepository(): boolean;
//# sourceMappingURL=validation.d.ts.map