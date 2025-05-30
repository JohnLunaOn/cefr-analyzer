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
import { CEFRLevel, IWordWithPos } from '../types';

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
  const result = cefrAnalyzer.analyze(text, {
    includeUnknownWords: true,
    analyzeByPartOfSpeech: true,
  });

  // 格式化并输出结果
  const formattedResult = formatAnalysisResult(result);
  console.log(formattedResult);

  // 生成并输出可视化
  const visualization = generateSimpleVisualization(result);
  console.log(visualization);

  // 计算复杂度得分
  const complexityScore = calculateComplexityScore(result);

  console.log(`\n文本复杂度得分: ${complexityScore.score.toFixed(2)}`);
  console.log(`对应CEFR级别: ${complexityScore.level.toUpperCase()}`);
  if (complexityScore.note) {
    console.log(`注意: ${complexityScore.note}`);
  }

  // 输出各级别的单词示例
  console.log('\n各级别单词示例:');
  const levels = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'] as const;

  for (const level of levels) {
    // 方法1: 通过分析结果获取特定级别的单词
    const wordsFromResult = result.wordsAtLevel[level];

    // 方法2: 直接通过分析器获取特定级别的单词
    const wordsFromAnalyzer = cefrAnalyzer.getWordsAtLevel(text, level);

    // 两种方法结果应该一致
    const words = wordsFromResult;

    if (words.length > 0) {
      // 显示单词及其词性
      const exampleWords = words
        .slice(0, 5)
        .map((wordObj: IWordWithPos) => {
          return `${wordObj.word}(${wordObj.pos})`;
        })
        .join(', ');

      console.log(`${level.toUpperCase()}: ${exampleWords}${words.length > 5 ? '...' : ''}`);
    } else {
      console.log(`${level.toUpperCase()}: 无单词`);
    }
  }

  // 演示如何使用 getComplexityLevel 函数
  console.log('\n不同得分对应的CEFR级别:');
  const scores = [1.2, 2.3, 3.4, 4.5, 5.6];
  for (const score of scores) {
    const level = getComplexityLevel(score);
    console.log(`得分 ${score.toFixed(1)} -> ${level.toUpperCase()}`);
  }

  // 演示按词性分析
  console.log('\n按词性分析示例:');
  const resultWithPOS = cefrAnalyzer.analyze(text, { analyzeByPartOfSpeech: true });
  console.log(`总单词数: ${resultWithPOS.totalWords}`);
  console.log(`已识别单词: ${resultWithPOS.totalWords - resultWithPOS.unknownWords}`);
}

// 如果直接运行此文件
if (require.main === module || require.main?.path === '/usr/local/lib/node_modules/jiti/bin') {
  // 示例文本
  const sampleText = `
# 🌷 The Subtle Power of Spring
Spring is not merely a change in weather; it is a profound transformation that touches every corner of life. As winter’s grip gradually loosens, nature awakens with a quiet determination. Buds swell on tree branches, birds return with songs of renewal, and the earth itself seems to exhale after months of silence.

What makes spring so remarkable is not just the blossoming of flowers or the soft warmth of the sun, but the emotional shift it brings. There’s a sense of optimism in the air—an invitation to begin again. People walk a little slower, smile more often, and spend longer moments outdoors, soaking in the season’s gentle energy.

In many cultures, spring symbolizes rebirth and hope. It’s the time when plans take root, both literally and metaphorically. Farmers sow their fields with care, while students prepare for exams or transitions. Spring encourages growth, not only in nature, but within ourselves. We feel inspired to declutter our homes, refresh our goals, and reconnect with forgotten dreams.

Yet, spring’s beauty lies in its subtlety. It doesn’t shout—it whispers. It unfolds gradually, rewarding patience and mindfulness. And in this fast-paced world, perhaps that is its greatest gift: a reminder to slow down, breathe deeply, and notice the delicate miracles blooming around us.
  `;

  analyzeTextExample(sampleText);

  // 短文本示例
  console.log('\n\n短文本示例:');
  const shortText = 'This is a very short text example.';
  analyzeTextExample(shortText);
}
