/**
 * CEFR语言能力等级
 */
export type CEFRLevel = 'a1' | 'a2' | 'b1' | 'b2' | 'c1' | 'c2';

/**
 * 词性类型
 */
export type PartOfSpeech =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'determiner'
  | 'pronoun'
  | 'preposition'
  | 'conjunction'
  | 'interjection';

/**
 * 词汇表中的单词条目
 */
export interface IVocabularyItem {
  word: string;
  cefr: CEFRLevel;
  pos: PartOfSpeech;
}

/**
 * 单词及其词性
 */
export interface IWordWithPos {
  /** 单词 */
  word: string;
  /** 词性 */
  pos: string;
}

/**
 * 分析结果统计
 */
export interface ICEFRAnalysisResult {
  /** 文本总单词数 */
  totalWords: number;
  /** 各CEFR级别单词数量 */
  levelCounts: Record<CEFRLevel, number>;
  /** 各CEFR级别单词占比 */
  levelPercentages: Record<CEFRLevel, number>;
  /** 未识别的单词数量 */
  unknownWords: number;
  /** 未识别的单词列表 */
  unknownWordsList: string[];
  /** 各CEFR级别的单词列表（包含词性） */
  wordsAtLevel: Record<CEFRLevel, IWordWithPos[]>;
}

/**
 * 分析器配置选项
 */
export interface IAnalyzerOptions {
  /** 是否区分大小写 */
  caseSensitive?: boolean;
  /** 是否包含未知单词列表 */
  includeUnknownWords?: boolean;
  /** 是否按词性分析 */
  analyzeByPartOfSpeech?: boolean;
}
