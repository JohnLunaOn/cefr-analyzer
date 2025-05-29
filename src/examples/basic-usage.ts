/**
 * CEFR Analyzer 基本使用示例
 */

import cefrAnalyzer from '../index';
import {
  formatAnalysisResult,
  generateSimpleVisualization,
  calculateComplexityScore,
  getComplexityLevel,
} from '../utils';

/**
 * 分析文本示例
 * @param text 要分析的文本
 */
export function analyzeTextExample(text: string): void {
  console.log('输入文本:');
  console.log('-----------------------------------');
  console.log(text);
  console.log('-----------------------------------\n');

  // 分析文本
  const result = cefrAnalyzer.analyze(text);

  // 格式化并输出结果
  const formattedResult = formatAnalysisResult(result);
  console.log(formattedResult);

  // 生成并输出可视化
  const visualization = generateSimpleVisualization(result);
  console.log(visualization);

  // 计算复杂度得分
  const complexityScore = calculateComplexityScore(result);
  const complexityLevel = getComplexityLevel(complexityScore);

  console.log(`\n文本复杂度得分: ${complexityScore.toFixed(2)}`);
  console.log(`对应CEFR级别: ${complexityLevel.toUpperCase()}`);

  // 输出各级别的单词示例
  console.log('\n各级别单词示例:');
  const levels = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'] as const;

  for (const level of levels) {
    const words = cefrAnalyzer.getWordsAtLevel(text, level);
    const exampleWords = words.slice(0, 5).join(', '); // 最多显示5个单词
    console.log(`${level.toUpperCase()}: ${exampleWords}${words.length > 5 ? '...' : ''}`);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  // 示例文本
  const sampleText = `
    The ability to analyze English text and determine the CEFR levels of vocabulary 
    is a sophisticated tool for language learners. This computer program can help 
    students understand the complexity of the texts they are reading and identify 
    words they need to learn to progress to higher levels. The paradigm of language 
    learning has evolved significantly with technology.
  `;

  analyzeTextExample(sampleText);
}
