import { CEFRLevel, ICEFRAnalysisResult } from '../types';

/**
 * 格式化CEFR分析结果为可读文本
 * @param result CEFR分析结果
 * @returns 格式化后的文本
 */
export function formatAnalysisResult(result: ICEFRAnalysisResult): string {
  const { totalWords, levelCounts, levelPercentages, unknownWords } = result;

  // 构建结果字符串
  let formattedResult = '## CEFR 词汇分析结果\n\n';

  // 添加总览信息
  formattedResult += `总单词数: ${totalWords}\n`;
  formattedResult += `已识别单词: ${totalWords - unknownWords} (${(
    ((totalWords - unknownWords) / totalWords) *
    100
  ).toFixed(2)}%)\n`;
  formattedResult += `未识别单词: ${unknownWords} (${((unknownWords / totalWords) * 100).toFixed(
    2
  )}%)\n\n`;

  // 添加各级别统计
  formattedResult += '### 各CEFR级别单词分布\n\n';
  formattedResult += '| 级别 | 单词数 | 百分比 |\n';
  formattedResult += '|------|--------|--------|\n';

  const levels: CEFRLevel[] = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];

  levels.forEach(level => {
    const count = levelCounts[level];
    const percentage = levelPercentages[level].toFixed(2);
    formattedResult += `| ${level.toUpperCase()} | ${count} | ${percentage}% |\n`;
  });

  return formattedResult;
}

/**
 * 计算文本的CEFR复杂度得分
 * 基于各级别单词的加权平均值
 * @param result CEFR分析结果
 * @returns 复杂度得分（1-6，对应A1-C2）
 */
export function calculateComplexityScore(result: ICEFRAnalysisResult): number {
  const { levelCounts, totalWords } = result;

  // 如果没有识别到任何单词，返回0
  if (totalWords === 0) {
    return 0;
  }

  // 各级别的权重
  const levelWeights: Record<CEFRLevel, number> = {
    a1: 1,
    a2: 2,
    b1: 3,
    b2: 4,
    c1: 5,
    c2: 6,
  };

  // 计算加权和
  let weightedSum = 0;
  let recognizedWords = 0;

  Object.entries(levelCounts).forEach(([level, count]) => {
    const cefrLevel = level as CEFRLevel;
    weightedSum += levelWeights[cefrLevel] * count;
    recognizedWords += count;
  });

  // 计算加权平均值
  return recognizedWords > 0 ? weightedSum / recognizedWords : 0;
}

/**
 * 根据复杂度得分获取对应的CEFR级别
 * @param score 复杂度得分（1-6）
 * @returns 对应的CEFR级别
 */
export function getComplexityLevel(score: number): CEFRLevel {
  if (score < 1.5) return 'a1';
  if (score < 2.5) return 'a2';
  if (score < 3.5) return 'b1';
  if (score < 4.5) return 'b2';
  if (score < 5.5) return 'c1';
  return 'c2';
}

/**
 * 生成CEFR级别分布的简单可视化
 * @param result CEFR分析结果
 * @returns ASCII图表字符串
 */
export function generateSimpleVisualization(result: ICEFRAnalysisResult): string {
  const { levelPercentages } = result;
  const levels: CEFRLevel[] = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];

  let visualization = '### CEFR级别分布可视化\n\n';

  levels.forEach(level => {
    const percentage = levelPercentages[level];
    const barLength = Math.round(percentage / 2); // 每2%对应1个字符
    const bar = '█'.repeat(barLength);

    visualization += `${level.toUpperCase()}: ${bar} ${percentage.toFixed(2)}%\n`;
  });

  return visualization;
}
