import { CEFRLevel, ICEFRAnalysisResult, IAnalyzerOptions, IWordWithPos } from '../types';

/**
 * 文本分析器接口
 */
export interface ITextAnalyzer {
  /**
   * 分析文本中的CEFR级别单词分布
   * @param text 要分析的文本
   * @param options 分析选项
   * @returns 分析结果
   */
  analyze(text: string, options?: IAnalyzerOptions): ICEFRAnalysisResult;

  /**
   * 获取文本中指定CEFR级别的单词列表
   * @param text 要分析的文本
   * @param level CEFR级别
   * @param options 分析选项
   * @returns 指定级别的单词列表（包含词性）
   */
  getWordsAtLevel(text: string, level: CEFRLevel, options?: IAnalyzerOptions): IWordWithPos[];

  /**
   * 获取文本的CEFR级别分布统计
   * @param text 要分析的文本
   * @param options 分析选项
   * @returns 各级别单词分布的百分比统计
   */
  getLevelDistribution(text: string, options?: IAnalyzerOptions): Record<CEFRLevel, number>;
}

/**
 * 分析器工厂接口
 */
export interface IAnalyzerFactory {
  /**
   * 创建文本分析器实例
   * @returns 文本分析器实例
   */
  createAnalyzer(): ITextAnalyzer;
}

/**
 * 单词处理结果
 */
export interface IWordProcessingResult {
  /** 原始单词 */
  original: string;
  /** 标准化后的单词 */
  normalized: string;
  /** CEFR级别 */
  cefrLevel?: CEFRLevel;
  /** 词性 */
  partOfSpeech?: string;
}
