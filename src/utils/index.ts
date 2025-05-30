import { CEFRLevel, ICEFRAnalysisResult } from '../types';
import { DifficultyScoreResult } from './types';

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
 * @returns ICEFRAnalysisResult score得分1～6，level对应等级
 */
export function calculateComplexityScore(result: ICEFRAnalysisResult): DifficultyScoreResult {
  const { totalWords, levelPercentages } = result;

  // ✅ 1. 权重设定
  const weights: Record<CEFRLevel, number> = {
    a1: 1,
    a2: 2,
    b1: 3,
    b2: 4,
    c1: 5,
    c2: 6,
  };

  // ✅ 2. 基础难度得分（加权平均）
  let baseScore = 0;
  for (const level of Object.keys(weights) as CEFRLevel[]) {
    baseScore += (levelPercentages[level] || 0) * weights[level];
  }
  baseScore /= 100;

  // ✅ 3. 超短文本特殊处理
  if (totalWords < 30) {
    return {
      score: baseScore,
      level: getComplexityLevel(baseScore),
      note: 'Too short to evaluate CEFR level reliably.',
    };
  }

  // ✅ 4. 惩罚短文本，奖励长文本
  const shortPenalty = totalWords < 100 ? ((100 - totalWords) / 100) * 0.5 : 0;
  // 奖励长文本,（上限1.0分）
  const longBonus = Math.min(1.0, Math.log(Math.max(1, totalWords - 100)) / 10);

  const adjustedScore = Math.max(0, baseScore + longBonus - shortPenalty);

  return {
    score: parseFloat(adjustedScore.toFixed(2)),
    level: getComplexityLevel(adjustedScore),
  };
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
    const barLength = Math.floor(percentage / 2); // 每2%对应1个字符
    const bar = '█'.repeat(barLength);

    visualization += `${level.toUpperCase()}: ${bar} ${percentage.toFixed(2)}%\n`;
  });

  return visualization;
}
