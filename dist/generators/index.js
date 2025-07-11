"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateProject = generateProject;
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const lerna_js_1 = require("./lerna.js");
const nextjs_js_1 = require("./nextjs.js");
const nestjs_js_1 = require("./nestjs.js");
const react_native_js_1 = require("./react-native.js");
const installer_js_1 = require("../utils/installer.js");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
/**
 * 生成完整项目
 */
async function generateProject(projectPath, config) {
    const spinner = (0, ora_1.default)('正在创建项目...').start();
    try {
        // 对于纯前端项目，使用简化的生成方式
        if (config.template === 'frontend-only') {
            await generateSimpleNextjsProject(projectPath, config, spinner);
            return;
        }
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
/**
 * 生成简单的NextJS项目（不使用monorepo）
 */
async function generateSimpleNextjsProject(projectPath, config, spinner) {
    const projectName = path_1.default.basename(projectPath);
    const parentDir = path_1.default.dirname(projectPath);
    // 使用create-next-app直接创建项目
    spinner.text = '正在创建NextJS项目...';
    const createCommand = [
        'npx create-next-app@latest',
        `"${projectName}"`,
        '--typescript',
        '--tailwind',
        '--eslint',
        '--app',
        '--src-dir',
        '--import-alias "@/*"',
        '--yes',
    ].join(' ');
    try {
        await execAsync(createCommand, {
            cwd: parentDir,
            env: { ...process.env, npm_config_yes: 'true' },
        });
    }
    catch (error) {
        // 如果create-next-app失败，尝试使用npm替代pnpm
        spinner.text = '正在使用npm重试创建NextJS项目...';
        const npmCommand = createCommand.replace('npx', 'npm exec --');
        await execAsync(npmCommand, {
            cwd: parentDir,
            env: {
                ...process.env,
                npm_config_yes: 'true',
                npm_config_package_manager: 'npm',
            },
        });
    }
    // 添加一些基础配置
    await addSimpleNextjsConfig(projectPath, config);
    // 如果不跳过安装，安装额外的依赖
    if (!config.skipInstall) {
        spinner.text = '正在安装额外依赖...';
        const extraPackages = [
            '@radix-ui/react-slot',
            'class-variance-authority',
            'clsx',
            'lucide-react',
            'tailwind-merge',
            'tailwindcss-animate',
        ];
        await (0, installer_js_1.installExtraDependencies)(projectPath, extraPackages, config.packageManager);
    }
    spinner.succeed(chalk_1.default.green('NextJS项目创建完成！'));
    // 显示下一步指令
    console.log();
    console.log(chalk_1.default.cyan('🚀 下一步:'));
    console.log(chalk_1.default.gray(`  cd ${projectName}`));
    console.log(chalk_1.default.gray(`  ${config.packageManager} dev`));
    console.log();
    console.log(chalk_1.default.cyan('📖 项目地址:'));
    console.log(chalk_1.default.gray('  http://localhost:3000'));
    console.log();
}
/**
 * 为简单NextJS项目添加基础配置
 */
async function addSimpleNextjsConfig(projectPath, config) {
    // 添加基础的Button组件
    const componentsDir = path_1.default.join(projectPath, 'src', 'components', 'ui');
    await fs_extra_1.default.ensureDir(componentsDir);
    const buttonContent = `import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
`;
    await fs_extra_1.default.writeFile(path_1.default.join(componentsDir, 'button.tsx'), buttonContent);
    // 添加utils函数
    const libDir = path_1.default.join(projectPath, 'src', 'lib');
    await fs_extra_1.default.ensureDir(libDir);
    const utilsContent = `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
`;
    await fs_extra_1.default.writeFile(path_1.default.join(libDir, 'utils.ts'), utilsContent);
}
//# sourceMappingURL=index.js.map