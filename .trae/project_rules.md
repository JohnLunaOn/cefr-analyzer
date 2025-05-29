# CEFR Analyzer 项目规则

## 技术选型

- **Node.js**: v18+
- **编程语言**: TypeScript
- **输出格式**: CommonJS (cjs)
- **包管理工具**: pnpm (禁止使用npm/yarn)
- **单元测试框架**: Jest
- **代码规范工具**: ESLint + Prettier
- **类型检查**: 严格模式 (启用 `strict`)
- **NLP处理库**: wink-nlp + wink-eng-lite-web-model

## 命名规范

- **文件命名**: 小写，单词间用连字符分隔 (kebab-case)
- **变量/函数命名**: 驼峰式 (camelCase)
- **类命名**: 帕斯卡式 (PascalCase)
- **常量命名**: 全大写，单词间用下划线分隔 (SNAKE_CASE)
- **接口/类型命名**: 帕斯卡式，接口以 `I` 开头，类型以 `T` 开头

## 模块结构

```
📁 src/                 # 核心源码
├── index.ts           # 模块入口
├── vocabulary/        # 词汇表相关
│   └── dict.ts        # CEFR词汇字典
├── analyzer/          # 分析器模块
│   ├── index.ts       # 分析器入口
│   └── types.ts       # 分析器类型定义
├── utils/             # 工具函数
├── services/          # 外部服务封装
└── types/             # 全局类型定义
📁 tests/              # 单元测试文件夹
├── analyzer.test.ts   # 分析器测试
└── utils.test.ts      # 工具函数测试
📁 .trae/              # 项目配置和记忆
├── project_rules.md   # 项目规则
└── memory_bank/       # 项目记忆库
```

## 代码风格

- 使用2个空格缩进
- 行尾使用分号
- 字符串使用单引号
- 每个文件末尾保留一个空行
- 最大行长度为100字符
- 使用ES6+特性
- 禁止使用`any`类型，除非绝对必要

## 文档规范

- 所有函数、类、接口必须有JSDoc注释
- 复杂逻辑必须有行内注释说明
- README.md必须包含项目说明、安装方法、使用示例

## 测试规范

- 所有核心逻辑必须有单元测试
- 测试覆盖率要求90%以上
- 测试文件与源文件结构对应
- 使用Jest的describe/it/expect语法

## 提交规范

- 提交信息使用英文
- 遵循Conventional Commits规范
- 提交前运行lint和测试

## 远程仓库信息

- **仓库地址**: git@github.com:liubei-ai/cefr-analyzer.git
- **远程名称**: origin
- **主分支**: main