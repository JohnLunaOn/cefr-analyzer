import { CEFRTextAnalyzer } from '../src/analyzer';
import { vocabularyManager } from '../src/vocabulary';
import { CEFRLevel } from '../src/types';

// 模拟wink-nlp和模型
jest.mock('wink-nlp', () => {
  return jest.fn().mockImplementation(() => ({
    readDoc: jest.fn().mockImplementation((text: string) => ({
      tokens: jest.fn().mockReturnValue({
        filter: jest.fn().mockImplementation(filterFn => {
          // 模拟文本分词结果
          const mockTokens = text.split(/\s+/).map(word => ({
            out: jest.fn().mockImplementation(param => {
              if (!param) return word;
              if (param.type) return 'word';
              if (param.stopWordFlag) return false;
              if (param.pos) return 'NN'; // 默认返回名词词性
              return word;
            }),
          }));
          return mockTokens.filter(filterFn);
        }),
      }),
    })),
    its: {
      type: { type: true },
      stopWordFlag: { stopWordFlag: true },
      pos: { pos: true },
    },
  }));
});

jest.mock('wink-eng-lite-web-model', () => ({}));

// 模拟词汇表管理器
jest.mock('../src/vocabulary', () => ({
  vocabularyManager: {
    initialize: jest.fn(),
    getCEFRLevel: jest.fn().mockImplementation((word: string, pos?: string) => {
      // 模拟一些单词的CEFR级别
      const mockVocab: Record<string, CEFRLevel> = {
        hello: 'a1',
        world: 'a1',
        computer: 'a2',
        analyze: 'b1',
        vocabulary: 'b2',
        sophisticated: 'c1',
        paradigm: 'c2',
      };
      return mockVocab[word.toLowerCase()];
    }),
    hasWord: jest.fn().mockImplementation((word: string) => {
      const mockVocab = [
        'hello',
        'world',
        'computer',
        'analyze',
        'vocabulary',
        'sophisticated',
        'paradigm',
      ];
      return mockVocab.includes(word.toLowerCase());
    }),
  },
}));

describe('CEFRTextAnalyzer', () => {
  let analyzer: CEFRTextAnalyzer;

  beforeEach(() => {
    jest.clearAllMocks();
    analyzer = new CEFRTextAnalyzer();
  });

  test('should initialize vocabulary manager', () => {
    expect(vocabularyManager.initialize).toHaveBeenCalled();
  });

  test('should analyze text and return CEFR level counts', () => {
    const text = 'Hello world computer analyze vocabulary sophisticated paradigm unknown';
    const result = analyzer.analyze(text);

    expect(result.totalWords).toBe(8);
    expect(result.levelCounts.a1).toBe(2); // hello, world
    expect(result.levelCounts.a2).toBe(1); // computer
    expect(result.levelCounts.b1).toBe(1); // analyze
    expect(result.levelCounts.b2).toBe(1); // vocabulary
    expect(result.levelCounts.c1).toBe(1); // sophisticated
    expect(result.levelCounts.c2).toBe(1); // paradigm
    expect(result.unknownWords).toBe(1); // unknown
  });

  test('should get words at specific CEFR level', () => {
    const text = 'Hello world computer analyze vocabulary sophisticated paradigm';
    const a1Words = analyzer.getWordsAtLevel(text, 'a1');
    const b2Words = analyzer.getWordsAtLevel(text, 'b2');

    expect(a1Words).toContain('hello');
    expect(a1Words).toContain('world');
    expect(a1Words.length).toBe(2);

    expect(b2Words).toContain('vocabulary');
    expect(b2Words.length).toBe(1);
  });

  test('should get level distribution', () => {
    const text = 'Hello world computer analyze vocabulary sophisticated paradigm';
    const distribution = analyzer.getLevelDistribution(text);

    expect(distribution.a1).toBeCloseTo(200 / 7);
    expect(distribution.a2).toBeCloseTo(100 / 7);
    expect(distribution.b1).toBeCloseTo(100 / 7);
    expect(distribution.b2).toBeCloseTo(100 / 7);
    expect(distribution.c1).toBeCloseTo(100 / 7);
    expect(distribution.c2).toBeCloseTo(100 / 7);
  });

  test('should handle empty text', () => {
    const result = analyzer.analyze('');

    expect(result.totalWords).toBe(0);
    expect(result.levelCounts.a1).toBe(0);
    expect(result.unknownWords).toBe(0);
    expect(result.unknownWordsList).toEqual([]);
  });

  test('should respect case sensitivity option', () => {
    const text = 'Hello WORLD';

    // 默认不区分大小写
    const resultDefault = analyzer.analyze(text);
    expect(resultDefault.levelCounts.a1).toBe(2);

    // 设置区分大小写（由于模拟的词汇表只有小写，所以大写单词会被视为未知）
    const resultCaseSensitive = analyzer.analyze(text, { caseSensitive: true });
    // 注意：这里的期望结果取决于模拟实现，可能需要调整
    expect(vocabularyManager.getCEFRLevel).toHaveBeenCalledWith('Hello');
    expect(vocabularyManager.getCEFRLevel).toHaveBeenCalledWith('WORLD');
  });

  test('should analyze text with analyzeByPartOfSpeech option', () => {
    const text = 'Hello world';

    // 使用analyzeByPartOfSpeech选项
    const result = analyzer.analyze(text, { analyzeByPartOfSpeech: true });

    // 验证调用了带词性的getCEFRLevel方法
    expect(vocabularyManager.getCEFRLevel).toHaveBeenCalledWith('hello', expect.any(String));
    expect(vocabularyManager.getCEFRLevel).toHaveBeenCalledWith('world', expect.any(String));
  });

  test('should handle includeUnknownWords option', () => {
    const text = 'Hello world unknown';

    // 默认包含未知单词
    const resultWithUnknown = analyzer.analyze(text);
    expect(resultWithUnknown.unknownWordsList).toContain('unknown');

    // 不包含未知单词
    const resultWithoutUnknown = analyzer.analyze(text, { includeUnknownWords: false });
    expect(resultWithoutUnknown.unknownWordsList).toEqual([]);
  });

  test('should handle empty text with analyzeByPartOfSpeech option', () => {
    const result = analyzer.analyze('', { analyzeByPartOfSpeech: true });

    expect(result.totalWords).toBe(0);
    expect(result.levelCounts.a1).toBe(0);
    expect(result.unknownWords).toBe(0);
  });

  test('should handle text with only unknown words', () => {
    // 模拟一个不在词汇表中的单词
    const text = 'xyz abc';

    const result = analyzer.analyze(text);

    expect(result.totalWords).toBe(2);
    expect(result.unknownWords).toBe(2);
    expect(result.unknownWordsList).toContain('xyz');
    expect(result.unknownWordsList).toContain('abc');

    // 检查百分比计算是否正确
    expect(result.levelPercentages.a1).toBe(0);
    expect(result.levelPercentages.a2).toBe(0);
  });

  test('should handle getWordsAtLevel with analyzeByPartOfSpeech option', () => {
    const text = 'Hello world computer analyze';

    const a1Words = analyzer.getWordsAtLevel(text, 'a1', { analyzeByPartOfSpeech: true });

    expect(vocabularyManager.getCEFRLevel).toHaveBeenCalledWith('hello', expect.any(String));
    expect(vocabularyManager.getCEFRLevel).toHaveBeenCalledWith('world', expect.any(String));
  });

  test('should count repeated words only once', () => {
    const text = 'Hello hello world world';

    const result = analyzer.analyze(text);

    // 虽然文本中有4个单词，但只有2个唯一单词
    expect(result.totalWords).toBe(2);
    expect(result.levelCounts.a1).toBe(2); // 假设hello和world都是A1级别

    // 测试getLevelDistribution方法也正确处理重复单词
    const distribution = analyzer.getLevelDistribution(text);
    expect(distribution.a1).toBe(100); // 所有唯一单词都是A1级别
  });

  // test('should handle unmapped part of speech', () => {
  //   // 模拟wink-nlp返回一个未映射的词性
  //   (mockDoc.tokens as jest.Mock).mockReturnValueOnce([
  //     {
  //       out: jest.fn().mockImplementation((its) => {
  //         if (its === mockIts.pos) return 'XX'; // 未映射的词性
  //         return 'testword';
  //       }),
  //     },
  //   ]);

  //   const result = analyzer.analyze('testword', { analyzeByPartOfSpeech: true });

  //   // 验证调用了不带词性的getCEFRLevel方法
  //   expect(vocabularyManager.getCEFRLevel).toHaveBeenCalledWith('testword');
  // });

  // test('should handle unmapped part of speech in getWordsAtLevel', () => {
  //   // 模拟wink-nlp返回一个未映射的词性
  //   (mockDoc.tokens as jest.Mock).mockReturnValueOnce([
  //     {
  //       out: jest.fn().mockImplementation((its) => {
  //         if (its === mockIts.pos) return 'XX'; // 未映射的词性
  //         return 'testword';
  //       }),
  //     },
  //   ]);

  //   const words = analyzer.getWordsAtLevel('testword', 'a1', { analyzeByPartOfSpeech: true });

  //   // 验证调用了不带词性的getCEFRLevel方法
  //   expect(vocabularyManager.getCEFRLevel).toHaveBeenCalledWith('testword');
  // });
});
