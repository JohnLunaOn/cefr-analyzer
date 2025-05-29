# CEFR Analyzer 项目状态

## 当前状态

项目初始化阶段，已有词汇表文件，需要集成wink-nlp进行CEFR级别分析。

## 现有资源

- **词汇表**: `src/vocabulary/dict.ts` - 包含单词、CEFR级别和词性的JSON数组
  - 格式: `{ word: string, cefr: string, pos: string }`
  - CEFR级别: a1, a2, b1, b2, c1, c2
  - 词性: noun, verb, adjective, adverb等

## 功能需求

1. 使用wink-nlp和wink-eng-lite-web-model处理英文文本
2. 分析文本中的单词，匹配CEFR级别
3. 统计各CEFR级别(A1~C2)的单词数量
4. 提供分析结果的可视化或格式化输出

## 技术栈

- TypeScript
- wink-nlp
- wink-eng-lite-web-model

## 待实现功能

- [ ] 项目基础结构搭建
- [ ] 依赖安装配置
- [ ] 词汇表数据结构优化
- [ ] 文本分析器实现
- [ ] CEFR级别统计功能
- [ ] 单元测试
- [ ] 使用示例