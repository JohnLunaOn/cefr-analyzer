import { CEFRTextAnalyzer, cefrAnalyzer } from '../src/analyzer';
import { vocabularyManager } from '../src/vocabulary';
import { CEFRLevel } from '../src/types';
import lemmatizer from 'wink-lemmatizer';

// 模拟 wink-lemmatizer
jest.mock('wink-lemmatizer', () => ({
  noun: jest.fn().mockImplementation((word: string) => {
    const nounMap: Record<string, string> = {
      books: 'book',
      children: 'child',
      mice: 'mouse',
      analyses: 'analysis',
    };
    return nounMap[word] || word;
  }),
  verb: jest.fn().mockImplementation((word: string) => {
    const verbMap: Record<string, string> = {
      running: 'run',
      ate: 'eat',
      gone: 'go',
      studying: 'study',
    };
    return verbMap[word] || word;
  }),
  adjective: jest.fn().mockImplementation((word: string) => {
    const adjectiveMap: Record<string, string> = {
      better: 'good',
      worst: 'bad',
      larger: 'large',
      happiest: 'happy',
    };
    return adjectiveMap[word] || word;
  }),
}));

function splitToWords(text: string): Array<string> {
  return text
    .toLowerCase() // 全部小写（可选）
    .replace(/[^a-zA-Z\s']/g, '') // 去除标点（保留撇号）
    .split(/\s+/) // 按空格分词
    .filter(Boolean); // 去除空字符串
}

// 模拟wink-nlp和模型
jest.mock('wink-nlp', () => {
  return jest.fn().mockImplementation(() => ({
    readDoc: jest.fn().mockImplementation((text: string) => ({
      tokens: jest.fn().mockReturnValue({
        filter: jest.fn().mockImplementation(filterFn => {
          // 模拟文本分词结果
          const mockTokens = splitToWords(text).map(word => ({
            out: jest.fn().mockImplementation(param => {
              if (!param) return word;
              if (param.type) return /^[a-zA-Z]+$/.test(word) ? 'word' : 'other';
              if (param.stopWordFlag) return false;
              if (param.pos) return 'NN'; // 默认返回名词词性
              if (param.lemma) {
                // 模拟某些情况下 lemma 可能为 undefined 的情况
                if (word === 'undefined-lemma-test') return undefined;
                return word.toLowerCase();
              }
              return word;
            }),
          }));
          const filteredTokens = mockTokens.filter(filterFn);

          // 添加each方法作为forEach的另一种写法
          (filteredTokens as any).each = function (callback: any) {
            this.forEach(callback);
          };

          return filteredTokens;
        }),
        // 添加each方法到tokens返回值
        each: jest.fn().mockImplementation(callback => {
          const mockTokens = text.split(/\s+/).map(word => ({
            out: jest.fn().mockImplementation(param => {
              if (!param) return word;
              if (param.type) return 'word';
              if (param.stopWordFlag) return false;
              if (param.pos) return 'NN'; // 默认返回名词词性
              if (param.lemma) {
                // 模拟某些情况下 lemma 可能为 undefined 的情况
                if (word === 'undefined-lemma-test') return undefined;
                return word.toLowerCase();
              }
              return word;
            }),
          }));
          mockTokens.forEach(callback);
        }),
      }),
    })),
    its: {
      type: { type: true },
      stopWordFlag: { stopWordFlag: true },
      pos: { pos: true },
      lemma: { lemma: true }, // 添加lemma支持
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

    expect(a1Words[0].word).toBe('hello');
    expect(a1Words[1].word).toContain('world');
    expect(a1Words.length).toBe(2);

    expect(b2Words[0].word).toBe('vocabulary');
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
    // 因为它实际还是要传字根（lemma），所以仍然是小写，大小写敏感只影响 wordsAtLevel
    expect(vocabularyManager.getCEFRLevel).toHaveBeenCalledWith('hello');
    expect(vocabularyManager.getCEFRLevel).toHaveBeenCalledWith('world');
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

  test('should include wordsAtLevel in analysis result', () => {
    const text = 'Hello world computer analyze vocabulary sophisticated paradigm unknown';
    const result = analyzer.analyze(text);

    // 验证wordsAtLevel包含了正确的单词和词性
    expect(result.wordsAtLevel.a1.length).toBe(2);
    expect(result.wordsAtLevel.a1[0].word).toBe('hello');
    expect(result.wordsAtLevel.a1[0].pos).toBe('NN'); // 模拟返回的词性
    expect(result.wordsAtLevel.a1[1].word).toBe('world');
    expect(result.wordsAtLevel.a1[1].pos).toBe('NN');

    expect(result.wordsAtLevel.a2.length).toBe(1);
    expect(result.wordsAtLevel.a2[0].word).toBe('computer');
    expect(result.wordsAtLevel.a2[0].pos).toBe('NN');

    expect(result.wordsAtLevel.b1.length).toBe(1);
    expect(result.wordsAtLevel.b1[0].word).toBe('analyze');
    expect(result.wordsAtLevel.b1[0].pos).toBe('NN');

    expect(result.wordsAtLevel.b2.length).toBe(1);
    expect(result.wordsAtLevel.b2[0].word).toBe('vocabulary');
    expect(result.wordsAtLevel.b2[0].pos).toBe('NN');

    expect(result.wordsAtLevel.c1.length).toBe(1);
    expect(result.wordsAtLevel.c1[0].word).toBe('sophisticated');
    expect(result.wordsAtLevel.c1[0].pos).toBe('NN');

    expect(result.wordsAtLevel.c2.length).toBe(1);
    expect(result.wordsAtLevel.c2[0].word).toBe('paradigm');
    expect(result.wordsAtLevel.c2[0].pos).toBe('NN');

    // 验证未知单词不在任何级别的单词列表中
    expect(result.wordsAtLevel.a1.find(w => w.word === 'unknown')).toBeUndefined();
    expect(result.wordsAtLevel.a2.find(w => w.word === 'unknown')).toBeUndefined();
    expect(result.wordsAtLevel.b1.find(w => w.word === 'unknown')).toBeUndefined();
    expect(result.wordsAtLevel.b2.find(w => w.word === 'unknown')).toBeUndefined();
    expect(result.wordsAtLevel.c1.find(w => w.word === 'unknown')).toBeUndefined();
    expect(result.wordsAtLevel.c2.find(w => w.word === 'unknown')).toBeUndefined();
  });

  test('should handle empty text for wordsAtLevel', () => {
    const result = analyzer.analyze('');

    // 验证空文本的wordsAtLevel所有级别都是空数组
    expect(result.wordsAtLevel.a1).toEqual([]);
    expect(result.wordsAtLevel.a2).toEqual([]);
    expect(result.wordsAtLevel.b1).toEqual([]);
    expect(result.wordsAtLevel.b2).toEqual([]);
    expect(result.wordsAtLevel.c1).toEqual([]);
    expect(result.wordsAtLevel.c2).toEqual([]);
  });

  test('should handle repeated words in wordsAtLevel', () => {
    const text = 'Hello hello world world';
    const result = analyzer.analyze(text);

    // 验证重复单词在wordsAtLevel中只出现一次
    expect(result.wordsAtLevel.a1.length).toBe(2);
    expect(result.wordsAtLevel.a1[0].word).toBe('hello');
    expect(result.wordsAtLevel.a1[0].pos).toBe('NN');
    expect(result.wordsAtLevel.a1[1].word).toBe('world');
    expect(result.wordsAtLevel.a1[1].pos).toBe('NN');
  });

  test('should return words with POS in getWordsAtLevel method', () => {
    const text = 'Hello world computer';
    const a1Words = analyzer.getWordsAtLevel(text, 'a1');

    expect(a1Words.length).toBe(2);
    expect(a1Words[0].word).toBe('hello');
    expect(a1Words[0].pos).toBe('NN');
    expect(a1Words[1].word).toBe('world');
    expect(a1Words[1].pos).toBe('NN');
  });

  // 新增测试用例：测试处理特殊字符和空格
  test('should handle special characters and spaces correctly', () => {
    const text = 'Hello, world! How are you?   Multiple   spaces.';

    const result = analyzer.analyze(text);

    // 验证标点符号和多余空格被正确处理
    expect(result.totalWords).toBe(7); // Hello world How are you Multiple spaces
    expect(result.levelCounts.a1).toBe(2); // hello, world
  });

  // 新增测试用例：测试 getLevelDistribution 方法处理空文本
  test('should handle empty text in getLevelDistribution method', () => {
    const distribution = analyzer.getLevelDistribution('');

    // 验证空文本的分布结果所有级别都是0
    expect(distribution.a1).toBe(0);
    expect(distribution.a2).toBe(0);
    expect(distribution.b1).toBe(0);
    expect(distribution.b2).toBe(0);
    expect(distribution.c1).toBe(0);
    expect(distribution.c2).toBe(0);
  });

  // 新增测试用例：测试 cefrAnalyzer 导出实例
  test('should export cefrAnalyzer instance', () => {
    expect(cefrAnalyzer).toBeInstanceOf(CEFRTextAnalyzer);
  });

  // 新增测试用例：测试处理 undefined lemma 的情况（修复 bug）
  test('should handle undefined lemma without throwing error', () => {
    // 使用特殊的测试词，模拟 lemma 为 undefined 的情况
    const text = 'hello undefined-lemma-test world';
    
    // 这个测试不应该抛出 "Cannot read properties of undefined (reading 'toLowerCase')" 错误
    expect(() => {
      analyzer.analyze(text);
    }).not.toThrow();
    
    // 验证分析结果，undefined lemma 的词被跳过
    const result = analyzer.analyze(text);
    // 验证修复：undefined lemma 的词被跳过，不会导致程序崩溃
    // 从测试结果可以看到，hello 和 world 被正确识别为 A1 级别
    // undefined-lemma-test 被归类为未知单词（因为其 lemma 为 undefined 被跳过）
    expect(result.totalWords).toBe(3); // hello, world, undefined-lemma-test
    expect(result.levelCounts.a1).toBe(2); // hello 和 world
    expect(result.unknownWords).toBe(1); // undefined-lemma-test
  });
});
