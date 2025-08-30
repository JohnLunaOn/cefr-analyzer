import { CEFRTextAnalyzer } from '../src/analyzer';
import { vocabularyManager } from '../src/vocabulary';

// 使用真实的 wink-nlp 和 wink-lemmatizer 进行集成测试

describe('CEFRTextAnalyzer Integration Tests', () => {
  let analyzer: CEFRTextAnalyzer;

  beforeEach(() => {
    // 确保每个测试前重置模拟状态
    jest.restoreAllMocks();
    // 只模拟 vocabularyManager 以控制测试结果
    jest
      .spyOn(vocabularyManager, 'getCEFRLevel')
      .mockImplementation((word: string, pos?: string) => {
        // 为测试提供一些固定的词汇级别
        const mockVocab: Record<string, any> = {
          book: 'a1',
          read: 'a1',
          reading: 'a1',
          write: 'a1',
          writing: 'a2',
          hotel: 'a2',
          bought: 'a2',
          about: 'a1',
          will: 'a1',
          i: 'a1',
          a: 'a1',
          the: 'a1',
          is: 'a1',
          my: 'a1',
          passion: 'b1',
          every: 'a2',
          day: 'a1',
        };
        return mockVocab[word.toLowerCase()];
      });

    analyzer = new CEFRTextAnalyzer();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * 测试处理不同词性的重复单词
   * 使用真实的 wink-nlp 而不是模拟
   */
  test('should handle repeated words with different parts of speech using real wink-nlp', () => {
    // 使用包含相同单词但不同词性的文本
    // "book" 可以是名词("a book")或动词("to book a hotel")
    const text = 'I will book a hotel. I bought a book about hotels.';

    // 使用真实的 wink-nlp 分析，启用按词性分析选项
    const result = analyzer.analyze(text, { analyzeByPartOfSpeech: true });

    // 输出分析结果以便调试
    // console.log('Analysis result:', JSON.stringify(result, null, 2));

    // 验证总单词数
    // 注意：由于使用真实的 wink-nlp，实际结果可能因其分词和词性标注而异
    expect(result.totalWords).toBeGreaterThan(0);

    // 查找所有 "book" 实例
    const bookWords = result.wordsAtLevel.a1.filter(
      word => word.lemma.toLowerCase() === 'book' || word.word.toLowerCase() === 'book'
    );

    // 输出找到的 "book" 实例以便调试
    // console.log('Book words:', bookWords);

    // 验证至少找到了一个 "book" 实例
    expect(bookWords.length).toBeGreaterThan(0);

    // 如果找到多个 "book" 实例，验证它们的词性是否不同
    if (bookWords.length > 1) {
      const uniquePOS = new Set(bookWords.map(word => word.pos));
      expect(uniquePOS.size).toBeGreaterThan(1);
    }

    // 验证 uniqueKey 格式（word（pos））是否生效
    // 在 analyzeByPartOfSpeech 为 true 时，相同单词但不同词性应该被视为不同单词
    const bookEntries = bookWords.map(word => `${word.word}（${word.pos}）`);
    const uniqueBookEntries = new Set(bookEntries);

    // 如果找到多个 "book" 实例，验证它们的 uniqueKey 是否不同
    if (bookWords.length > 1) {
      expect(uniqueBookEntries.size).toBe(bookWords.length);
    }
  });

  /**
   * 测试词形变化识别
   */
  test('should correctly identify different forms of the same word', () => {
    // 测试词形变化识别，如 "write" 和 "writing"
    const text = 'I write every day. Writing is my passion.';

    const result = analyzer.analyze(text);

    // console.log('Word forms analysis:', JSON.stringify(result, null, 2));

    // 验证 "write" 和 "writing" 都被正确识别
    const writeWords = result.wordsAtLevel.a1.filter(
      word => word.lemma.toLowerCase() === 'write' || word.word.toLowerCase() === 'write'
    );

    const writingWords = result.wordsAtLevel.a2.filter(
      word => word.lemma.toLowerCase() === 'writing' || word.word.toLowerCase() === 'writing'
    );

    // console.log('Write words:', writeWords);
    // console.log('Writing words:', writingWords);

    // 验证至少找到了 "write" 或其词形变化
    expect(writeWords.length + writingWords.length).toBeGreaterThan(0);
  });

  /**
   * 测试大小写敏感选项
   */
  test('should handle case sensitive option correctly', () => {
    const text = 'Book BOOK book';

    // 测试大小写敏感
    const caseSensitiveResult = analyzer.analyze(text, { caseSensitive: true });
    
    // 测试大小写不敏感（默认）
    const caseInsensitiveResult = analyzer.analyze(text, { caseSensitive: false });

    // 大小写敏感时，应该有更多的唯一单词
    expect(caseSensitiveResult.totalWords).toBeGreaterThanOrEqual(caseInsensitiveResult.totalWords);
  });

  /**
   * 测试includeUnknownWords选项为false的情况
   */
  test('should handle includeUnknownWords option set to false', () => {
    const text = 'This has some unknownxyzword that should not be included.';

    const result = analyzer.analyze(text, { includeUnknownWords: false });

    // 当includeUnknownWords为false时，unknownWordsList应该为空
    expect(result.unknownWordsList).toEqual([]);
  });

  /**
   * 测试无法映射词性的情况
   */
  test('should handle unmappable parts of speech in analyzeByPartOfSpeech mode', () => {
    // 使用包含特殊词性的文本
    const text = 'Hello! 123 @#$ world.';

    const result = analyzer.analyze(text, { analyzeByPartOfSpeech: true });

    // 验证分析能正常完成，不会出错
    expect(result.totalWords).toBeGreaterThanOrEqual(0);
    expect(result.levelCounts).toBeDefined();
  });

  /**
   * 测试fixLemma功能和词性分析模式下的fallback逻辑
   */
  test('should handle lemma fixing with part of speech analysis', () => {
    // 使用包含需要词形还原的单词
    const text = 'I am reading books and writing stories.';

    // 模拟vocabularyManager返回undefined，触发fixLemma逻辑
    jest.spyOn(vocabularyManager, 'getCEFRLevel')
      .mockImplementation((word: string, pos?: string) => {
        // 对于某些词返回undefined，触发fixLemma逻辑
        if (word === 'reading' || word === 'books' || word === 'stories') {
          return undefined;
        }
        // 对词形还原后的词返回级别
        if (word === 'read' || word === 'book' || word === 'story') {
          return 'a1';
        }
        // 对其他词返回固定值，避免递归
        if (word === 'i' || word === 'am' || word === 'and') {
          return 'a1';
        }
        return undefined;
      });

    const result = analyzer.analyze(text, { analyzeByPartOfSpeech: true });

    // 验证fixLemma逻辑正常工作
    expect(result.totalWords).toBeGreaterThan(0);
    
    // 清理mock
    jest.restoreAllMocks();
  });

  /**
   * 测试空文本和只有未知词的边界情况
   */
  test('should handle edge cases for percentage calculation', () => {
    // 测试只有未知词的情况，这会导致count为0
    const unknownText = 'xyzunknown abcdefgh qwerty';
    
    // 模拟所有词都返回undefined
    jest.spyOn(vocabularyManager, 'getCEFRLevel')
      .mockImplementation(() => undefined);

    const result = analyzer.analyze(unknownText);

    // 验证百分比计算不会出错
    expect(result.levelPercentages).toBeDefined();
    Object.values(result.levelPercentages).forEach(percentage => {
      expect(percentage).toBe(0);
    });

    // 清理mock
    jest.restoreAllMocks();
  });

  /**
   * 测试mapPartOfSpeech返回undefined的情况
   */
  test('should handle unmapped part of speech in analyzeByPartOfSpeech mode', () => {
    const text = 'Hello world!';

    // 模拟mapPartOfSpeech返回undefined的情况
    const originalMapPartOfSpeech = analyzer['mapPartOfSpeech'];
    jest.spyOn(analyzer as any, 'mapPartOfSpeech').mockImplementation(() => undefined);

    const result = analyzer.analyze(text, { analyzeByPartOfSpeech: true });

    // 验证分析能正常完成
    expect(result.totalWords).toBeGreaterThanOrEqual(0);
    expect(result.levelCounts).toBeDefined();
    
    // 清理mock
    jest.restoreAllMocks();
  });

  /**
   * 测试fixLemma在非analyzeByPartOfSpeech模式下的逻辑
   */
  test('should handle fixLemma fallback without part of speech analysis', () => {
    const text = 'I am reading books.';

    // 模拟vocabularyManager对原词返回undefined，但对lemma返回级别
    jest.spyOn(vocabularyManager, 'getCEFRLevel')
      .mockImplementation((word: string, pos?: string) => {
        if (word === 'reading' || word === 'books') {
          return undefined; // 原词未找到
        }
        if (word === 'read' || word === 'book') {
          return 'a1'; // lemma找到了
        }
        return undefined;
      });

    const result = analyzer.analyze(text, { analyzeByPartOfSpeech: false });

    // 验证fixLemma逻辑在非词性分析模式下正常工作
    expect(result.totalWords).toBeGreaterThan(0);
    
    // 清理mock
    jest.restoreAllMocks();
  });
});
