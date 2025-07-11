import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs-extra'
import { ProjectConfig } from '../types/index.js'

const execAsync = promisify(exec)

/**
 * 生成NextJS应用
 */
export async function generateNextjsApp(
    projectPath: string,
    config: ProjectConfig
): Promise<void> {
    const frontendPath = path.join(projectPath, 'apps', 'frontend')

    // 使用create-next-app创建项目
    const createCommand = [
        'npx create-next-app@latest',
        'frontend',
        '--typescript',
        '--tailwind',
        '--eslint',
        '--app',
        '--src-dir',
        '--import-alias "@/*"',
        '--yes',
    ].join(' ')

    // 在apps目录中执行
    const appsDir = path.join(projectPath, 'apps')
    await fs.ensureDir(appsDir)

    await execAsync(createCommand, { cwd: appsDir })

    // 修改package.json
    await updateNextjsPackageJson(frontendPath, config)

    // 添加自定义配置
    await addNextjsConfig(frontendPath, config)
}

/**
 * 更新NextJS package.json
 */
async function updateNextjsPackageJson(
    frontendPath: string,
    config: ProjectConfig
): Promise<void> {
    const packageJsonPath = path.join(frontendPath, 'package.json')
    const packageJson = await fs.readJson(packageJsonPath)

    // 更新项目信息
    packageJson.name = `@${config.name}/frontend`
    packageJson.private = true

    // 添加额外的依赖
    packageJson.dependencies = {
        ...packageJson.dependencies,
        '@radix-ui/react-slot': '^1.0.2',
        'class-variance-authority': '^0.7.0',
        clsx: '^2.0.0',
        'lucide-react': '^0.288.0',
        'tailwind-merge': '^2.0.0',
        'tailwindcss-animate': '^1.0.7',
    }

    packageJson.devDependencies = {
        ...packageJson.devDependencies,
        '@types/node': '^20.0.0',
    }

    // 更新scripts
    packageJson.scripts = {
        ...packageJson.scripts,
        dev: 'next dev -p 3000',
        build: 'next build',
        start: 'next start -p 3000',
        lint: 'next lint',
        'type-check': 'tsc --noEmit',
    }

    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 })
}

/**
 * 添加NextJS配置文件
 */
async function addNextjsConfig(
    frontendPath: string,
    config: ProjectConfig
): Promise<void> {
    // 更新next.config.js
    const nextConfigContent = `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    transpilePackages: ['@${config.name}/shared']
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
`

    await fs.writeFile(
        path.join(frontendPath, 'next.config.js'),
        nextConfigContent
    )

    // 添加组件库基础结构
    await addComponentsStructure(frontendPath)

    // 添加基础页面
    await addBasicPages(frontendPath, config)
}

/**
 * 添加组件库结构
 */
async function addComponentsStructure(frontendPath: string): Promise<void> {
    const componentsDir = path.join(frontendPath, 'src', 'components')
    const uiDir = path.join(componentsDir, 'ui')

    await fs.ensureDir(uiDir)

    // 创建基础UI组件 - Button
    const buttonContent = `import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
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
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
`

    await fs.writeFile(path.join(uiDir, 'button.tsx'), buttonContent)

    // 创建utils
    const libDir = path.join(frontendPath, 'src', 'lib')
    await fs.ensureDir(libDir)

    const utilsContent = `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
`

    await fs.writeFile(path.join(libDir, 'utils.ts'), utilsContent)
}

/**
 * 添加基础页面
 */
async function addBasicPages(
    frontendPath: string,
    config: ProjectConfig
): Promise<void> {
    const appDir = path.join(frontendPath, 'src', 'app')

    // 更新主页
    const pageContent = `import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">
          欢迎使用 ${config.name}
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          基于 NextJS + ${config.features.backend ? 'NestJS + ' : ''}${
        config.features.mobile ? 'React Native + ' : ''
    }Lerna 的全栈 monorepo 项目
        </p>
        <div className="flex gap-4 justify-center">
          <Button>开始使用</Button>
          <Button variant="outline">查看文档</Button>
        </div>
      </div>
    </main>
  )
}
`

    await fs.writeFile(path.join(appDir, 'page.tsx'), pageContent)

    // 更新layout
    const layoutContent = `import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '${config.name}',
  description: '全栈 monorepo 项目',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
`

    await fs.writeFile(path.join(appDir, 'layout.tsx'), layoutContent)
}
