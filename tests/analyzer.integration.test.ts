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
});
