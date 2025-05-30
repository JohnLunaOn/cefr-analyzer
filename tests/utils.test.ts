import {
  formatAnalysisResult,
  calculateComplexityScore,
  getComplexityLevel,
  generateSimpleVisualization,
} from '../src/utils';
import { ICEFRAnalysisResult } from '../src/types';

// 更新权重系数以匹配 utils.ts 中的实现
const factors = {
  a1: 1,
  a2: 2.0,
  b1: 3.5,
  b2: 5,
  c1: 7,
  c2: 9.5,
};

describe('Utils', () => {
  // 创建一个模拟的分析结果
  const mockResult: ICEFRAnalysisResult = {
    totalWords: 40,
    levelCounts: {
      a1: 30,
      a2: 25,
      b1: 20,
      b2: 15,
      c1: 5,
      c2: 0,
    },
    levelPercentages: {
      a1: 30,
      a2: 25,
      b1: 20,
      b2: 15,
      c1: 5,
      c2: 0,
    },
    unknownWords: 5,
    unknownWordsList: ['unknown1', 'unknown2', 'unknown3', 'unknown4', 'unknown5'],
    wordsAtLevel: {
      a1: [
        { word: 'word1', pos: 'NN', lemma: 'word1' },
        { word: 'word2', pos: 'NN', lemma: 'word2' },
        { word: 'word3', pos: 'NN', lemma: 'word3' },
        { word: 'word4', pos: 'NN', lemma: 'word4' },
        { word: 'word5', pos: 'NN', lemma: 'word5' },
        { word: 'word6', pos: 'NN', lemma: 'word6' },
        { word: 'word7', pos: 'NN', lemma: 'word7' },
        { word: 'word8', pos: 'NN', lemma: 'word8' },
        { word: 'word9', pos: 'NN', lemma: 'word9' },
        { word: 'word10', pos: 'NN', lemma: 'word10' },
      ],
      a2: [
        { word: 'word11', pos: 'NN', lemma: 'word11' },
        { word: 'word12', pos: 'NN', lemma: 'word12' },
        { word: 'word13', pos: 'NN', lemma: 'word13' },
        { word: 'word14', pos: 'NN', lemma: 'word14' },
        { word: 'word15', pos: 'NN', lemma: 'word15' },
      ],
      b1: [
        { word: 'word16', pos: 'NN', lemma: 'word16' },
        { word: 'word17', pos: 'NN', lemma: 'word17' },
        { word: 'word18', pos: 'NN', lemma: 'word18' },
        { word: 'word19', pos: 'NN', lemma: 'word19' },
        { word: 'word20', pos: 'NN', lemma: 'word20' },
      ],
      b2: [
        { word: 'word21', pos: 'NN', lemma: 'word21' },
        { word: 'word22', pos: 'NN', lemma: 'word22' },
        { word: 'word23', pos: 'NN', lemma: 'word23' },
        { word: 'word24', pos: 'NN', lemma: 'word24' },
        { word: 'word25', pos: 'NN', lemma: 'word25' },
      ],
      c1: [
        { word: 'word26', pos: 'NN', lemma: 'word26' },
        { word: 'word27', pos: 'NN', lemma: 'word27' },
        { word: 'word28', pos: 'NN', lemma: 'word28' },
        { word: 'word29', pos: 'NN', lemma: 'word29' },
        { word: 'word30', pos: 'NN', lemma: 'word30' },
      ],
      c2: [
        { word: 'word31', pos: 'NN', lemma: 'word31' },
        { word: 'word32', pos: 'NN', lemma: 'word32' },
        { word: 'word33', pos: 'NN', lemma: 'word33' },
        { word: 'word34', pos: 'NN', lemma: 'word34' },
        { word: 'word35', pos: 'NN', lemma: 'word35' },
      ],
    },
  };

  describe('formatAnalysisResult', () => {
    test('should format analysis result correctly', () => {
      const formatted = formatAnalysisResult(mockResult);

      // 检查格式化结果是否包含预期的内容
      expect(formatted).toContain('总单词数: 40');
      expect(formatted).toContain('已识别单词: 35');
      expect(formatted).toContain('未识别单词: 5');

      // 检查表格标题
      expect(formatted).toContain('| 级别 | 单词数 | 百分比 |');

      // 检查各级别数据
      expect(formatted).toContain('| A1 | 30 | 30.00% |');
      expect(formatted).toContain('| A2 | 25 | 25.00% |');
      expect(formatted).toContain('| B1 | 20 | 20.00% |');
      expect(formatted).toContain('| B2 | 15 | 15.00% |');
      expect(formatted).toContain('| C1 | 5 | 5.00% |');
      expect(formatted).toContain('| C2 | 0 | 0.00% |');
    });
  });

  describe('calculateComplexityScore', () => {
    test('should calculate complexity score correctly for standard text (40 words)', () => {
      const result = calculateComplexityScore(mockResult);

      // 基础得分计算：(30*1 + 25*2 + 20*3.5 + 15*5 + 5*7 + 0*9.5) / 100 = 2.75
      // 40词需要考虑长文本奖励：Math.min(1.0, Math.log(Math.max(1, 40 - 50)) / 10) = 0
      const baseScore =
        (30 * factors.a1 +
          25 * factors.a2 +
          20 * factors.b1 +
          15 * factors.b2 +
          5 * factors.c1 +
          0 * factors.c2) /
        100;

      // 没有短文本惩罚和长文本奖励
      expect(result.score).toBeCloseTo(baseScore, 2);
      expect(result.level).toBe(getComplexityLevel(baseScore));
      expect(result.note).toBeUndefined();
    });

    test('should handle very short text (less than 10 words) with special note', () => {
      const veryShortResult: ICEFRAnalysisResult = {
        ...mockResult,
        totalWords: 8,
        levelPercentages: {
          a1: 40,
          a2: 30,
          b1: 20,
          b2: 10,
          c1: 0,
          c2: 0,
        },
      };

      const result = calculateComplexityScore(veryShortResult);

      // 基础得分计算：(40*1 + 30*2 + 20*3.5 + 10*5 + 0*7 + 0*9.5) / 100 = 2.2
      const baseScore =
        (40 * factors.a1 +
          30 * factors.a2 +
          20 * factors.b1 +
          10 * factors.b2 +
          0 * factors.c1 +
          0 * factors.c2) /
        100;

      const totalWords = veryShortResult.totalWords;
      const shortPenalty = totalWords < 30 ? ((30 - totalWords) / 30) * 0.5 : 0;

      expect(result.score).toBeCloseTo(baseScore - shortPenalty, 2);
      expect(result.level).toBe(getComplexityLevel(baseScore - shortPenalty));
      expect(result.note).toBe('Too short to evaluate CEFR level reliably.');
    });

    test('should apply short text penalty (less than 30 words)', () => {
      const shortResult: ICEFRAnalysisResult = {
        ...mockResult,
        totalWords: 25,
        levelPercentages: {
          a1: 30,
          a2: 25,
          b1: 20,
          b2: 15,
          c1: 10,
          c2: 0,
        },
      };

      const result = calculateComplexityScore(shortResult);

      // 基础得分：(30*1 + 25*2 + 20*3.5 + 15*5 + 10*7 + 0*9.5) / 100 = 3.05
      const baseScore =
        (30 * factors.a1 +
          25 * factors.a2 +
          20 * factors.b1 +
          15 * factors.b2 +
          10 * factors.c1 +
          0 * factors.c2) /
        100;

      // 短文本惩罚：((30 - 25) / 30) * 0.5 = 0.083
      const shortPenalty = ((30 - 25) / 30) * 0.5;

      // 调整后得分：3.05 - 0.083 = 2.967
      const adjustedScore = baseScore - shortPenalty;

      expect(result.score).toBeCloseTo(adjustedScore, 2);
      expect(result.level).toBe(getComplexityLevel(adjustedScore));
      expect(result.note).toBeUndefined();
    });

    test('should apply long text bonus (more than 50 words)', () => {
      const longResult: ICEFRAnalysisResult = {
        ...mockResult,
        totalWords: 500,
        levelPercentages: {
          a1: 20,
          a2: 20,
          b1: 20,
          b2: 20,
          c1: 15,
          c2: 5,
        },
      };

      const result = calculateComplexityScore(longResult);

      // 基础得分：(20*1 + 20*2 + 20*3.5 + 20*5 + 15*7 + 5*9.5) / 100 = 3.775
      const baseScore =
        (20 * factors.a1 +
          20 * factors.a2 +
          20 * factors.b1 +
          20 * factors.b2 +
          15 * factors.c1 +
          5 * factors.c2) /
        100;

      // 长文本奖励：Math.min(1.0, Math.log(Math.max(1, 500 - 50)) / 10) ≈ 0.6
      const longBonus = Math.min(1.0, Math.log(Math.max(1, 500 - 50)) / 10);

      // 调整后得分：3.775 + 0.6 = 4.375
      const adjustedScore = baseScore + longBonus;

      expect(result.score).toBeCloseTo(adjustedScore, 2);
      expect(result.level).toBe(getComplexityLevel(adjustedScore));
      expect(result.note).toBeUndefined();
    });

    test('should return score with two decimal places', () => {
      const result = calculateComplexityScore(mockResult);

      // 检查得分是否保留两位小数
      expect(result.score.toString()).toMatch(/^\d+\.\d{1,2}$/);
    });

    test('should return 0 for empty text', () => {
      const emptyResult: ICEFRAnalysisResult = {
        totalWords: 0,
        levelCounts: { a1: 0, a2: 0, b1: 0, b2: 0, c1: 0, c2: 0 },
        levelPercentages: { a1: 0, a2: 0, b1: 0, b2: 0, c1: 0, c2: 0 },
        unknownWords: 0,
        unknownWordsList: [],
        wordsAtLevel: { a1: [], a2: [], b1: [], b2: [], c1: [], c2: [] },
      };

      const result = calculateComplexityScore(emptyResult);
      expect(result.score).toBe(0);
      expect(result.level).toBe('a1');
    });

    test('should return 0 when no words are recognized', () => {
      const noRecognizedWordsResult: ICEFRAnalysisResult = {
        totalWords: 10,
        levelCounts: { a1: 0, a2: 0, b1: 0, b2: 0, c1: 0, c2: 0 },
        levelPercentages: { a1: 0, a2: 0, b1: 0, b2: 0, c1: 0, c2: 0 },
        unknownWords: 10,
        unknownWordsList: [
          'word1',
          'word2',
          'word3',
          'word4',
          'word5',
          'word6',
          'word7',
          'word8',
          'word9',
          'word10',
        ],
        wordsAtLevel: { a1: [], a2: [], b1: [], b2: [], c1: [], c2: [] },
      };

      const result = calculateComplexityScore(noRecognizedWordsResult);
      expect(result.score).toBe(0);
      expect(result.level).toBe('a1');
    });
  });

  describe('getComplexityLevel', () => {
    test('should return correct CEFR level for scores', () => {
      expect(getComplexityLevel(1.1)).toBe('a1');
      expect(getComplexityLevel(1.2)).toBe('a2');
      expect(getComplexityLevel(1.6)).toBe('a2');
      expect(getComplexityLevel(1.7)).toBe('b1');
      expect(getComplexityLevel(2.1)).toBe('b1');
      expect(getComplexityLevel(2.2)).toBe('b2');
      expect(getComplexityLevel(2.7)).toBe('b2');
      expect(getComplexityLevel(2.8)).toBe('c1');
      expect(getComplexityLevel(3.4)).toBe('c1');
      expect(getComplexityLevel(3.5)).toBe('c2');
      expect(getComplexityLevel(4.0)).toBe('c2');
    });
  });

  describe('generateSimpleVisualization', () => {
    test('should generate ASCII visualization', () => {
      const visualization = generateSimpleVisualization(mockResult);

      /*
      ### CEFR级别分布可视化·
        A1: ███████████████ 30.00%
        A2: █████████████ 25.00%
        B1: ██████████ 20.00%
        B2: ████████ 15.00%
        C1: ███ 5.00%
        C2:  0.00%
      */

      // 检查可视化结果是否包含预期的内容
      expect(visualization).toContain('### CEFR级别分布可视化');

      // 检查各级别的可视化条形图
      // A1: 30% -> 15个字符
      expect(visualization).toContain('A1: ███████████████ 30.00%');

      // A2: 25% -> 12个字符
      expect(visualization).toContain('A2: ████████████ 25.00%');

      // B1: 20% -> 10个字符
      expect(visualization).toContain('B1: ██████████ 20.00%');

      // B2: 15% -> 7个字符
      expect(visualization).toContain('B2: ███████ 15.00%');

      // C1: 5% -> 2个字符
      expect(visualization).toContain('C1: ██ 5.00%');

      // C2: 0% -> 0个字符
      expect(visualization).toContain('C2:  0.00%');
    });
  });
});
