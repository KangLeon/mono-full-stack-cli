"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReactNativeApp = generateReactNativeApp;
const child_process_1 = require("child_process");
const util_1 = require("util");
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
/**
 * 生成React Native Expo应用
 */
async function generateReactNativeApp(projectPath, config) {
    const mobilePath = path_1.default.join(projectPath, 'apps', 'mobile');
    // 在移动端项目中使用npm而非pnpm（Expo推荐）
    const packageManager = 'npm';
    // 使用create-expo-app创建项目
    const createCommand = [
        'npx create-expo-app@latest',
        'mobile',
        '--template',
        'tabs',
        '--no-install',
    ].join(' ');
    // 在apps目录中执行
    const appsDir = path_1.default.join(projectPath, 'apps');
    await fs_extra_1.default.ensureDir(appsDir);
    await execAsync(createCommand, { cwd: appsDir });
    // 修改package.json
    await updateExpoPackageJson(mobilePath, config);
    // 添加自定义配置
    await addExpoConfig(mobilePath, config);
    // 创建基础组件和页面
    await createBaseComponents(mobilePath, config);
}
/**
 * 更新Expo package.json
 */
async function updateExpoPackageJson(mobilePath, config) {
    const packageJsonPath = path_1.default.join(mobilePath, 'package.json');
    const packageJson = await fs_extra_1.default.readJson(packageJsonPath);
    // 更新项目信息
    packageJson.name = `@${config.name}/mobile`;
    packageJson.private = true;
    // 添加额外的依赖
    packageJson.dependencies = {
        ...packageJson.dependencies,
        // UI组件库
        '@expo/vector-icons': '^14.0.0',
        'react-native-elements': '^3.4.3',
        'react-native-vector-icons': '^10.0.0',
        // 导航
        '@react-navigation/native': '^6.1.0',
        '@react-navigation/stack': '^6.3.0',
        '@react-navigation/bottom-tabs': '^6.5.0',
        // 状态管理
        zustand: '^4.4.0',
        // 网络请求
        axios: '^1.6.0',
        // 工具库
        'date-fns': '^3.0.0',
        'react-native-safe-area-context': '^4.7.0',
        'react-native-screens': '^3.25.0',
    };
    packageJson.devDependencies = {
        ...packageJson.devDependencies,
        '@types/react': '^18.2.0',
        '@types/react-native': '^0.72.0',
    };
    // 更新scripts
    packageJson.scripts = {
        ...packageJson.scripts,
        start: 'expo start',
        android: 'expo start --android',
        ios: 'expo start --ios',
        web: 'expo start --web',
        'build:android': 'expo build:android',
        'build:ios': 'expo build:ios',
        eject: 'expo eject',
        lint: 'eslint . --ext .js,.jsx,.ts,.tsx',
    };
    await fs_extra_1.default.writeJson(packageJsonPath, packageJson, { spaces: 2 });
}
/**
 * 添加Expo配置
 */
async function addExpoConfig(mobilePath, config) {
    // 更新app.json
    const appJsonPath = path_1.default.join(mobilePath, 'app.json');
    const appJson = await fs_extra_1.default.readJson(appJsonPath);
    appJson.expo = {
        ...appJson.expo,
        name: config.name,
        slug: config.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        description: `${config.name} mobile application`,
        orientation: 'portrait',
        icon: './assets/images/icon.png',
        userInterfaceStyle: 'automatic',
        splash: {
            image: './assets/images/splash.png',
            resizeMode: 'contain',
            backgroundColor: '#ffffff',
        },
        assetBundlePatterns: ['**/*'],
        ios: {
            supportsTablet: true,
            bundleIdentifier: `com.${config.name.toLowerCase()}.app`,
        },
        android: {
            adaptiveIcon: {
                foregroundImage: './assets/images/adaptive-icon.png',
                backgroundColor: '#ffffff',
            },
            package: `com.${config.name.toLowerCase()}.app`,
        },
        web: {
            bundler: 'metro',
            output: 'static',
            favicon: './assets/images/favicon.png',
        },
        plugins: ['expo-router'],
        experiments: {
            typedRoutes: true,
        },
    };
    await fs_extra_1.default.writeJson(appJsonPath, appJson, { spaces: 2 });
    // 创建Metro配置
    const metroConfigContent = `const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// 添加monorepo支持
config.watchFolders = [
  // 监听共享包
  require('path').join(__dirname, '../../packages'),
];

config.resolver.nodeModulesPaths = [
  // 解析共享依赖
  require('path').join(__dirname, '../../node_modules'),
  require('path').join(__dirname, 'node_modules'),
];

module.exports = config;
`;
    await fs_extra_1.default.writeFile(path_1.default.join(mobilePath, 'metro.config.js'), metroConfigContent);
}
/**
 * 创建基础组件
 */
async function createBaseComponents(mobilePath, config) {
    // 创建组件目录结构
    const componentsDir = path_1.default.join(mobilePath, 'components');
    await fs_extra_1.default.ensureDir(componentsDir);
    // 创建通用Button组件
    const buttonComponentContent = `import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const buttonStyle = [
    styles.button,
    styles[\`button\${variant.charAt(0).toUpperCase() + variant.slice(1)}\`],
    styles[\`button\${size.charAt(0).toUpperCase() + size.slice(1)}\`],
    disabled && styles.buttonDisabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[\`text\${variant.charAt(0).toUpperCase() + variant.slice(1)}\`],
    styles[\`text\${size.charAt(0).toUpperCase() + size.slice(1)}\`],
    disabled && styles.textDisabled,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' ? '#fff' : '#007AFF'} 
          size="small" 
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonPrimary: {
    backgroundColor: '#007AFF',
  },
  buttonSecondary: {
    backgroundColor: '#E5E5EA',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  buttonSmall: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 32,
  },
  buttonMedium: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  buttonLarge: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    minHeight: 56,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  textPrimary: {
    color: '#fff',
  },
  textSecondary: {
    color: '#000',
  },
  textOutline: {
    color: '#007AFF',
  },
  textSmall: {
    fontSize: 14,
  },
  textMedium: {
    fontSize: 16,
  },
  textLarge: {
    fontSize: 18,
  },
  textDisabled: {
    opacity: 0.6,
  },
});
`;
    await fs_extra_1.default.writeFile(path_1.default.join(componentsDir, 'Button.tsx'), buttonComponentContent);
    // 创建状态管理store
    const storeDir = path_1.default.join(mobilePath, 'store');
    await fs_extra_1.default.ensureDir(storeDir);
    const storeContent = `import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AppState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  isLoading: false,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
}));
`;
    await fs_extra_1.default.writeFile(path_1.default.join(storeDir, 'index.ts'), storeContent);
    // 创建API服务
    const servicesDir = path_1.default.join(mobilePath, 'services');
    await fs_extra_1.default.ensureDir(servicesDir);
    const apiServiceContent = `import axios from 'axios';

 // 根据运行环境设置基础URL
 const baseURL = __DEV__ 
   ? 'http://localhost:3001' // 开发环境 - 直接连接NestJS后端
   : 'https://your-production-api.com'; // 生产环境

export const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证token
    // const token = await getAuthToken();
    // if (token) {
    //   config.headers.Authorization = \`Bearer \${token}\`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 处理错误响应
    if (error.response?.status === 401) {
      // 处理未授权错误
    }
    return Promise.reject(error);
  }
);

// API服务
export const apiService = {
  // 用户相关
  async getUsers() {
    const response = await api.get('/users');
    return response.data;
  },

  async createUser(userData: { name: string; email: string }) {
    const response = await api.post('/users', userData);
    return response.data;
  },

  async getUser(id: string) {
    const response = await api.get(\`/users/\${id}\`);
    return response.data;
  },
};
`;
    await fs_extra_1.default.writeFile(path_1.default.join(servicesDir, 'api.ts'), apiServiceContent);
    // 更新主页面
    await updateMainScreen(mobilePath, config);
}
/**
 * 更新主页面
 */
async function updateMainScreen(mobilePath, config) {
    const appDir = path_1.default.join(mobilePath, 'app');
    // 更新index页面
    const indexPageContent = `import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button } from '../components/Button';
import { useAppStore } from '../store';
import { apiService } from '../services/api';

export default function HomeScreen() {
  const { user, isLoading, setUser, setLoading } = useAppStore();

  const handleTestApi = async () => {
    try {
      setLoading(true);
      const users = await apiService.getUsers();
      console.log('Users:', users);
    } catch (error) {
      console.error('API Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>欢迎使用 ${config.name}</Text>
                 <Text style={styles.subtitle}>
           基于 React Native Expo + NestJS 的移动应用
         </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>功能特性</Text>
        <View style={styles.featureList}>
          <Text style={styles.feature}>✅ React Navigation 导航</Text>
          <Text style={styles.feature}>✅ Zustand 状态管理</Text>
          <Text style={styles.feature}>✅ Axios 网络请求</Text>
          <Text style={styles.feature}>✅ TypeScript 支持</Text>
          <Text style={styles.feature}>✅ 跨平台兼容</Text>
        </View>
      </View>

      <View style={styles.buttonSection}>
        <Button
          title="测试API连接"
          onPress={handleTestApi}
          loading={isLoading}
          style={styles.button}
        />
        
        <Button
          title="查看文档"
          onPress={() => console.log('Documentation')}
          variant="outline"
          style={styles.button}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    lineHeight: 24,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  featureList: {
    gap: 8,
  },
  feature: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
  buttonSection: {
    gap: 12,
  },
  button: {
    marginBottom: 8,
  },
});
`;
    await fs_extra_1.default.writeFile(path_1.default.join(appDir, 'index.tsx'), indexPageContent);
}
//# sourceMappingURL=react-native.js.map