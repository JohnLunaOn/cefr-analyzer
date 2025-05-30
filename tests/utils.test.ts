import {
  formatAnalysisResult,
  calculateComplexityScore,
  getComplexityLevel,
  generateSimpleVisualization,
} from '../src/utils';
import { ICEFRAnalysisResult } from '../src/types';

describe('Utils', () => {
  // 创建一个模拟的分析结果
  const mockResult: ICEFRAnalysisResult = {
    totalWords: 100,
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
  };

  describe('formatAnalysisResult', () => {
    test('should format analysis result correctly', () => {
      const formatted = formatAnalysisResult(mockResult);

      // 检查格式化结果是否包含预期的内容
      expect(formatted).toContain('总单词数: 100');
      expect(formatted).toContain('已识别单词: 95');
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
    test('should calculate complexity score correctly', () => {
      const score = calculateComplexityScore(mockResult);

      // 计算预期得分：(30*1 + 25*2 + 20*3 + 15*4 + 5*5 + 0*6) / 95 = 2.37...
      const expectedScore = (30 * 1 + 25 * 2 + 20 * 3 + 15 * 4 + 5 * 5) / 95;
      expect(score).toBeCloseTo(expectedScore, 2);
    });

    test('should return 0 for empty text', () => {
      const emptyResult: ICEFRAnalysisResult = {
        totalWords: 0,
        levelCounts: { a1: 0, a2: 0, b1: 0, b2: 0, c1: 0, c2: 0 },
        levelPercentages: { a1: 0, a2: 0, b1: 0, b2: 0, c1: 0, c2: 0 },
        unknownWords: 0,
        unknownWordsList: [],
      };

      const score = calculateComplexityScore(emptyResult);
      expect(score).toBe(0);
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
      };

      const score = calculateComplexityScore(noRecognizedWordsResult);
      expect(score).toBe(0);
    });
  });

  describe('getComplexityLevel', () => {
    test('should return correct CEFR level for scores', () => {
      expect(getComplexityLevel(1.2)).toBe('a1');
      expect(getComplexityLevel(1.5)).toBe('a2');
      expect(getComplexityLevel(2.2)).toBe('a2');
      expect(getComplexityLevel(2.5)).toBe('b1');
      expect(getComplexityLevel(3.2)).toBe('b1');
      expect(getComplexityLevel(3.5)).toBe('b2');
      expect(getComplexityLevel(4.2)).toBe('b2');
      expect(getComplexityLevel(4.5)).toBe('c1');
      expect(getComplexityLevel(5.2)).toBe('c1');
      expect(getComplexityLevel(5.5)).toBe('c2');
      expect(getComplexityLevel(6.0)).toBe('c2');
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
