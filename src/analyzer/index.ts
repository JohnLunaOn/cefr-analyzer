import winkNLP from 'wink-nlp';
import model from 'wink-eng-lite-web-model';
import {
  CEFRLevel,
  ICEFRAnalysisResult,
  IAnalyzerOptions,
  type PartOfSpeech,
  IWordWithPos,
} from '../types';
import { vocabularyManager } from '../vocabulary';
import { ITextAnalyzer, IWordProcessingResult } from './types';

/**
 * 基于wink-nlp的CEFR文本分析器
 * 用于分析文本中各CEFR级别单词的分布
 */
export class CEFRTextAnalyzer implements ITextAnalyzer {
  private nlp: any;

  /**
   * 创建分析器实例
   */
  constructor() {
    // 初始化wink-nlp
    this.nlp = winkNLP(model);

    // 确保词汇表已初始化
    vocabularyManager.initialize();
  }

  /**
   * 分析文本中的CEFR级别单词分布
   * @param text 要分析的文本
   * @param options 分析选项
   * @returns 分析结果
   */
  public analyze(text: string, options?: IAnalyzerOptions): ICEFRAnalysisResult {
    const defaultOptions: IAnalyzerOptions = {
      caseSensitive: false,
      includeUnknownWords: true,
      analyzeByPartOfSpeech: false,
    };

    const mergedOptions = { ...defaultOptions, ...options };

    // 使用wink-nlp处理文本
    const doc = this.nlp.readDoc(text);

    // 提取所有单词（过滤掉标点符号和数字）
    const tokens = doc.tokens().filter((token: any) => {
      return token.out(this.nlp.its.type) === 'word' && !token.out(this.nlp.its.stopWordFlag);
    });

    // 处理每个单词，获取其CEFR级别
    const processedWords: IWordProcessingResult[] = [];
    const uniqueWords = new Set<string>();
    const levelCounts: Record<CEFRLevel, number> = {
      a1: 0,
      a2: 0,
      b1: 0,
      b2: 0,
      c1: 0,
      c2: 0,
    };

    const unknownWordsList: Set<string> = new Set();

    // 初始化各级别单词列表
    const wordsAtLevel: Record<CEFRLevel, IWordWithPos[]> = {
      a1: [],
      a2: [],
      b1: [],
      b2: [],
      c1: [],
      c2: [],
    };

    tokens.forEach((token: any) => {
      const word = token.out();
      // 获取单词的词性
      const pos = token.out(this.nlp.its.pos);

      if (word.trim() === '') return; // 跳过空单词

      const normalizedWord = mergedOptions.caseSensitive ? word : word.toLowerCase();
      const uniqueKey = mergedOptions.analyzeByPartOfSpeech
        ? `${normalizedWord}-${pos}`
        : normalizedWord;

      // 如果已处理过该单词，则跳过
      if (uniqueWords.has(uniqueKey)) {
        return;
      }

      uniqueWords.add(uniqueKey);

      // 查询单词的CEFR级别
      let cefrLevel;
      if (mergedOptions.analyzeByPartOfSpeech) {
        // 根据词性查询CEFR级别
        // 注意：这里需要将wink-nlp的词性映射到我们的词性类型
        const mappedPos = this.mapPartOfSpeech(pos);
        cefrLevel = mappedPos
          ? vocabularyManager.getCEFRLevel(normalizedWord, mappedPos)
          : undefined;
      } else {
        // 不考虑词性，直接查询CEFR级别
        cefrLevel = vocabularyManager.getCEFRLevel(normalizedWord);
      }

      // 记录处理结果
      processedWords.push({
        original: word,
        normalized: normalizedWord,
        cefrLevel,
        partOfSpeech: pos,
      });

      // 更新统计数据
      if (cefrLevel) {
        levelCounts[cefrLevel]++;
        // 将单词添加到对应级别的列表中
        wordsAtLevel[cefrLevel].push({
          word: normalizedWord,
          pos: pos,
        });
      } else if (mergedOptions.includeUnknownWords) {
        unknownWordsList.add(normalizedWord);
      }
    });

    // 计算总单词数和未知单词数
    const totalWords = uniqueWords.size;
    const unknownWords = unknownWordsList.size;

    // 计算各级别单词占比
    const levelPercentages: Record<CEFRLevel, number> = {
      a1: 0,
      a2: 0,
      b1: 0,
      b2: 0,
      c1: 0,
      c2: 0,
    };

    Object.keys(levelCounts).forEach(level => {
      const cefrLevel = level as CEFRLevel;
      levelPercentages[cefrLevel] =
        totalWords > 0 ? (levelCounts[cefrLevel] / totalWords) * 100 : 0;
    });

    // 返回分析结果
    return {
      totalWords,
      levelCounts,
      levelPercentages,
      unknownWords,
      unknownWordsList: mergedOptions.includeUnknownWords ? [...unknownWordsList] : [],
      wordsAtLevel,
    };
  }

  /**
   * 获取文本中指定CEFR级别的单词列表
   * @param text 要分析的文本
   * @param level CEFR级别
   * @param options 分析选项
   * @returns 指定级别的单词列表（包含词性）
   */
  public getWordsAtLevel(
    text: string,
    level: CEFRLevel,
    options?: IAnalyzerOptions
  ): IWordWithPos[] {
    // 通过analyze方法获取分析结果，确保includeUnknownWords选项为false，因为我们只关心特定级别的单词
    const analysisResult = this.analyze(text, {
      ...options,
      includeUnknownWords: false, // 不需要未知单词列表
    });

    // 直接返回指定级别的单词列表
    return analysisResult.wordsAtLevel[level];
  }

  /**
   * 获取文本的CEFR级别分布统计
   * @param text 要分析的文本
   * @param options 分析选项
   * @returns 各级别单词数量的统计
   */
  public getLevelDistribution(text: string, options?: IAnalyzerOptions): Record<CEFRLevel, number> {
    const result = this.analyze(text, options);
    return result.levelPercentages;
  }

  /**
   * 将wink-nlp的词性映射到我们的词性类型
   * @param winkPos wink-nlp的词性标记
   * @returns 映射后的词性，如果无法映射则返回undefined
   */
  private mapPartOfSpeech(winkPos: string): PartOfSpeech | undefined {
    // wink-nlp使用Penn Treebank词性标记
    // 这里将其映射到我们的词性类型
    const posMapping: Record<string, string> = {
      NN: 'noun', // 名词
      NNS: 'noun', // 复数名词
      NNP: 'noun', // 专有名词
      NNPS: 'noun', // 复数专有名词
      VB: 'verb', // 动词原形
      VBD: 'verb', // 过去式动词
      VBG: 'verb', // 现在分词
      VBN: 'verb', // 过去分词
      VBP: 'verb', // 非第三人称单数现在时
      VBZ: 'verb', // 第三人称单数现在时
      JJ: 'adjective', // 形容词
      JJR: 'adjective', // 比较级形容词
      JJS: 'adjective', // 最高级形容词
      RB: 'adverb', // 副词
      RBR: 'adverb', // 比较级副词
      RBS: 'adverb', // 最高级副词
      DT: 'determiner', // 限定词
      PRP: 'pronoun', // 人称代词
      PRP$: 'pronoun', // 所有格代词
      WP: 'pronoun', // wh-代词
      WP$: 'pronoun', // 所有格wh-代词
      IN: 'preposition', // 介词
      CC: 'conjunction', // 并列连词
      UH: 'interjection', // 感叹词
    };

    return posMapping[winkPos] as PartOfSpeech;
  }
}

// 导出分析器实例
export const cefrAnalyzer = new CEFRTextAnalyzer();
