"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateNodeVersion = validateNodeVersion;
exports.validateProjectName = validateProjectName;
exports.isDirectoryEmpty = isDirectoryEmpty;
exports.isInGitRepository = isInGitRepository;
const semver_1 = __importDefault(require("semver"));
const chalk_1 = __importDefault(require("chalk"));
const validate_npm_package_name_1 = __importDefault(require("validate-npm-package-name"));
/**
 * 验证Node.js版本
 */
function validateNodeVersion() {
    const currentVersion = process.version;
    const requiredVersion = '18.0.0';
    if (!semver_1.default.gte(currentVersion, requiredVersion)) {
        console.error(chalk_1.default.red(`❌ 需要 Node.js ${requiredVersion} 或更高版本，当前版本: ${currentVersion}`));
        console.error(chalk_1.default.gray('请升级 Node.js: https://nodejs.org/'));
        process.exit(1);
    }
}
/**
 * 验证项目名称
 */
function validateProjectName(name) {
    const validation = (0, validate_npm_package_name_1.default)(name);
    if (!validation.validForNewPackages) {
        return {
            valid: false,
            problems: [
                ...(validation.errors || []),
                ...(validation.warnings || []),
            ],
        };
    }
    return { valid: true };
}
/**
 * 检查目录是否为空
 */
function isDirectoryEmpty(path) {
    const fs = require('fs');
    if (!fs.existsSync(path)) {
        return true;
    }
    const files = fs.readdirSync(path);
    return files.length === 0 || (files.length === 1 && files[0] === '.git');
}
/**
 * 检查是否在Git仓库中
 */
function isInGitRepository() {
    const fs = require('fs');
    const path = require('path');
    let dir = process.cwd();
    do {
        if (fs.existsSync(path.join(dir, '.git'))) {
            return true;
        }
        dir = path.dirname(dir);
    } while (dir !== path.dirname(dir));
    return false;
}
//# sourceMappingURL=validation.js.map