# CEFR Analyzer API 设计

## 核心类和接口

### CEFRTextAnalyzer

主要分析器类，用于分析文本中的CEFR级别单词分布。

```typescript
class CEFRTextAnalyzer implements ITextAnalyzer {
  constructor();
  
  // 分析文本中的CEFR级别单词分布
  analyze(text: string, options?: IAnalyzerOptions): ICEFRAnalysisResult;
  
  // 获取文本中指定CEFR级别的单词列表
  getWordsAtLevel(text: string, level: CEFRLevel, options?: IAnalyzerOptions): string[];
  
  // 获取文本的CEFR级别分布统计
  getLevelDistribution(text: string, options?: IAnalyzerOptions): Record<CEFRLevel, number>;
}
```

### VocabularyManager

词汇表管理类，提供加载和查询CEFR词汇的功能。

```typescript
class VocabularyManager {
  // 初始化词汇表
  initialize(): void;
  
  // 查询单词的CEFR级别
  getCEFRLevel(word: string, pos?: PartOfSpeech): CEFRLevel | undefined;
  
  // 获取单词的所有CEFR级别和词性信息
  getWordInfo(word: string): IVocabularyItem[];
  
  // 检查单词是否在词汇表中
  hasWord(word: string): boolean;
  
  // 获取词汇表中的单词总数
  getTotalWords(): number;
}
```

## 工具函数

```typescript
// 格式化CEFR分析结果为可读文本
function formatAnalysisResult(result: ICEFRAnalysisResult): string;

// 计算文本的CEFR复杂度得分
function calculateComplexityScore(result: ICEFRAnalysisResult): number;

// 根据复杂度得分获取对应的CEFR级别
function getComplexityLevel(score: number): CEFRLevel;

// 生成CEFR级别分布的简单可视化
function generateSimpleVisualization(result: ICEFRAnalysisResult): string;
```

## 类型定义

```typescript
// CEFR语言能力等级
type CEFRLevel = 'a1' | 'a2' | 'b1' | 'b2' | 'c1' | 'c2';

// 词性类型
type PartOfSpeech =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'determiner'
  | 'pronoun'
  | 'preposition'
  | 'conjunction'
  | 'interjection';

// 词汇表中的单词条目
interface IVocabularyItem {
  word: string;
  cefr: CEFRLevel;
  pos: PartOfSpeech;
}

// 分析结果统计
interface ICEFRAnalysisResult {
  totalWords: number;
  levelCounts: Record<CEFRLevel, number>;
  levelPercentages: Record<CEFRLevel, number>;
  unknownWords: number;
  unknownWordsList: string[];
}

// 分析器配置选项
interface IAnalyzerOptions {
  caseSensitive?: boolean;
  includeUnknownWords?: boolean;
  analyzeByPartOfSpeech?: boolean;
}
```

## 使用示例

### 基本分析

```typescript
import cefrAnalyzer from 'cefr-analyzer';

const text = 'The ability to analyze English text is important for language learners.';
const result = cefrAnalyzer.analyze(text);

console.log(`总单词数: ${result.totalWords}`);
console.log(`A1级别单词数: ${result.levelCounts.a1}`);
console.log(`A1级别单词占比: ${result.levelPercentages.a1.toFixed(2)}%`);
```

### 格式化输出

```typescript
import cefrAnalyzer, { formatAnalysisResult } from 'cefr-analyzer';

const text = 'The ability to analyze English text is important for language learners.';
const result = cefrAnalyzer.analyze(text);

const formattedResult = formatAnalysisResult(result);
console.log(formattedResult);
```

### 获取特定级别的单词

```typescript
import cefrAnalyzer from 'cefr-analyzer';

const text = 'The computer is on the table. It is a sophisticated device.';

// 获取B2级别的单词
const b2Words = cefrAnalyzer.getWordsAtLevel(text, 'b2');
console.log('B2级别单词:', b2Words);
```

### 计算复杂度得分

```typescript
import cefrAnalyzer, { calculateComplexityScore, getComplexityLevel } from 'cefr-analyzer';

const text = 'The ability to analyze English text is important for language learners.';
const result = cefrAnalyzer.analyze(text);

const score = calculateComplexityScore(result);
const level = getComplexityLevel(score);

console.log(`文本复杂度得分: ${score.toFixed(2)}`);
console.log(`对应CEFR级别: ${level.toUpperCase()}`);
```