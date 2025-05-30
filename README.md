# CEFR Analyzer

[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-0.1.1-orange.svg)](https://www.npmjs.com/package/cefr-analyzer)

一个用于分析英文文本中各CEFR级别(A1-C2)单词数量的工具库。基于wink-nlp和预定义的CEFR词汇表，可以帮助语言学习者和教育工作者评估文本的语言难度。

## 特性

- 分析文本中各CEFR级别(A1-C2)单词的数量和占比
- 支持按词性分析单词（名词、动词、形容词等）
- 提供文本复杂度评分和级别判定
- 生成可视化的分析结果
- 支持查找特定CEFR级别的单词
- 完全使用TypeScript编写，提供完整类型定义
- 支持长文本分析，针对不同长度文本的特殊处理

## 安装

```bash
pnpm add cefr-analyzer
```

或者使用npm：

```bash
npm install cefr-analyzer
```

## 快速开始

```typescript
import cefrAnalyzer from 'cefr-analyzer';
import { formatAnalysisResult, generateSimpleVisualization, calculateComplexityScore } from 'cefr-analyzer';

// 分析文本
const text = 'The ability to analyze English text is important for language learners.';
const result = cefrAnalyzer.analyze(text);

// 格式化并输出结果
console.log(formatAnalysisResult(result));

// 生成可视化
console.log(generateSimpleVisualization(result));

// 获取特定级别的单词（包含词性信息）
const a1Words = result.wordsAtLevel.a1;
console.log('A1级别单词:', a1Words);
// 输出: A1级别单词: [{ word: 'the', pos: 'DET', lemma: 'the' }, { word: 'to', pos: 'PART', lemma: 'to' }, ...]

// 计算文本复杂度
const complexityResult = calculateComplexityScore(result);
console.log('文本复杂度:', complexityResult);
// 输出: 文本复杂度: { score: 2.45, level: 'a2' }

// 也可以直接通过分析器获取特定级别的单词
const b1Words = cefrAnalyzer.getWordsAtLevel(text, 'b1');
console.log('B1级别单词:', b1Words);
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
  wordsAtLevel: Record<CEFRLevel, IWordWithPos[]>; // 各CEFR级别的单词列表（包含词性）
}

interface IWordWithPos {
  word: string;       // 单词原形
  lemma: string;     // 单词词元（基本形式）
  pos: PartOfSpeech; // 词性（如 'noun', 'verb', 'adjective' 等）
}
```

#### `cefrAnalyzer.getWordsAtLevel(text, level, options?)`

获取文本中指定CEFR级别的单词列表（包含词性信息）。

```typescript
const a1Words = cefrAnalyzer.getWordsAtLevel('Your text here', 'a1');
// 返回: [{ word: 'the', pos: 'DET', lemma: 'the' }, { word: 'is', pos: 'AUX', lemma: 'be' }, ...]
```

**参数:**

- `text` (string): 要分析的文本
- `level` (CEFRLevel): CEFR级别 ('a1'|'a2'|'b1'|'b2'|'c1'|'c2')
- `options` (object, 可选):
  - `caseSensitive` (boolean): 是否区分大小写，默认为false
  - `analyzeByPartOfSpeech` (boolean): 是否按词性分析，默认为false

**返回值:**

返回一个`IWordWithPos[]`数组，每个元素包含单词、词元和词性。

#### `formatAnalysisResult(result)`

将分析结果格式化为可读文本。

```typescript
const formattedResult = formatAnalysisResult(result);
console.log(formattedResult);
// 输出:
// ## CEFR 词汇分析结果
//
// 总单词数: 12
// 已识别单词: 10 (83.33%)
// 未识别单词: 2 (16.67%)
//
// ### 各CEFR级别单词分布
//
// | 级别 | 单词数 | 百分比 |
// |------|--------|--------|
// | A1 | 6 | 50.00% |
// | A2 | 2 | 16.67% |
// ...
```

#### `calculateComplexityScore(result)`

计算文本的CEFR复杂度得分（1-6，对应A1-C2），并返回包含得分、级别和可选说明的结果对象。

```typescript
const complexityResult = calculateComplexityScore(result);
console.log(complexityResult);
// 输出: { score: 2.37, level: 'a2', note?: string }
```

**参数:**
- `result` (ICEFRAnalysisResult): 文本分析结果

**返回值:**
返回一个`DifficultyScoreResult`对象，包含以下属性：
- `score` (number): 复杂度得分（1-6，对应A1-C2）
- `level` (CEFRLevel): 对应的CEFR级别
- `note` (string, 可选): 特殊情况下的说明信息

**算法特点:**
- 基于各CEFR级别单词占比的加权平均计算基础得分
- 对超短文本（少于10词）提供特殊处理和提示
- 对短文本（少于30词）应用惩罚系数
- 对长文本（超过50词）应用奖励系数

#### `getComplexityLevel(score)`

根据复杂度得分获取对应的CEFR级别。

```typescript
const level = getComplexityLevel(score);
// 例如: 'a2'
```

**得分与级别对应关系:**
- 小于1.2: A1
- 1.2-1.7: A2
- 1.7-2.2: B1
- 2.2-2.8: B2
- 2.8-3.5: C1
- 3.5以上: C2

#### `generateSimpleVisualization(result)`

生成CEFR级别分布的简单ASCII可视化图表。

```typescript
const visualization = generateSimpleVisualization(result);
console.log(visualization);
// 输出:
// ### CEFR级别分布可视化
//
// A1: ███████████████ 30.00%
// A2: ████████████ 25.00%
// B1: ██████████ 20.00%
// B2: ███████ 15.00%
// C1: ██ 5.00%
// C2:  0.00%
```

## 高级用法

### 按词性分析

```typescript
// 启用按词性分析选项
const result = cefrAnalyzer.analyze(text, { analyzeByPartOfSpeech: true });

// 这样相同单词但不同词性会被视为不同单词
// 例如 "book" 作为名词和动词会被分别计数
```

### 处理大型文本

```typescript
// 对于大型文本，可以禁用未知单词列表以提高性能
const result = cefrAnalyzer.analyze(longText, { includeUnknownWords: false });

// 仍然可以获取未知单词的数量
console.log(`未知单词数量: ${result.unknownWords}`);
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