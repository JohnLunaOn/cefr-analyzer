# CEFR Analyzer

[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

一个用于分析英文文本中各CEFR级别(A1-C2)单词数量的工具库。基于wink-nlp和预定义的CEFR词汇表，可以帮助语言学习者和教育工作者评估文本的语言难度。

## 特性

- 分析文本中各CEFR级别(A1-C2)单词的数量和占比
- 支持按词性分析单词
- 提供文本复杂度评分
- 生成可视化的分析结果
- 支持查找特定CEFR级别的单词
- 完全使用TypeScript编写，提供类型定义

## 安装

```bash
pnpm add cefr-analyzer
```

## 快速开始

```typescript
import cefrAnalyzer from 'cefr-analyzer';
import { formatAnalysisResult } from 'cefr-analyzer';

// 分析文本
const text = 'The ability to analyze English text is important for language learners.';
const result = cefrAnalyzer.analyze(text);

// 格式化并输出结果
console.log(formatAnalysisResult(result));
```

## API参考

### 主要类和函数

#### `cefrAnalyzer.analyze(text, options?)`

分析文本中各CEFR级别单词的分布。

```typescript
const result = cefrAnalyzer.analyze('Your text here', {
  caseSensitive: false,
  includeUnknownWords: true,
  analyzeByPartOfSpeech: false
});
```

**参数:**

- `text` (string): 要分析的文本
- `options` (object, 可选):
  - `caseSensitive` (boolean): 是否区分大小写，默认为false
  - `includeUnknownWords` (boolean): 是否包含未知单词列表，默认为true
  - `analyzeByPartOfSpeech` (boolean): 是否按词性分析，默认为false

**返回值:**

返回一个`ICEFRAnalysisResult`对象，包含以下属性：

```typescript
interface ICEFRAnalysisResult {
  totalWords: number;                    // 文本总单词数
  levelCounts: Record<CEFRLevel, number>; // 各CEFR级别单词数量
  levelPercentages: Record<CEFRLevel, number>; // 各CEFR级别单词占比
  unknownWords: number;                  // 未识别的单词数量
  unknownWordsList: string[];            // 未识别的单词列表
}
```

#### `cefrAnalyzer.getWordsAtLevel(text, level, options?)`

获取文本中指定CEFR级别的单词列表。

```typescript
const a1Words = cefrAnalyzer.getWordsAtLevel('Your text here', 'a1');
```

#### `formatAnalysisResult(result)`

将分析结果格式化为可读文本。

```typescript
const formattedResult = formatAnalysisResult(result);
console.log(formattedResult);
```

#### `calculateComplexityScore(result)`

计算文本的CEFR复杂度得分（1-6，对应A1-C2）。

```typescript
const score = calculateComplexityScore(result);
```

## 本地开发

### 环境要求

- Node.js v18+
- pnpm

### 安装依赖

```bash
pnpm install
```

### 构建项目

```bash
pnpm build
```

### 运行测试

```bash
pnpm test
```

### 代码检查

```bash
pnpm lint
```

## 贡献指南

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交你的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启一个 Pull Request

## 许可证

本项目采用 MIT 许可证 - 详情请参阅 [LICENSE](LICENSE) 文件。