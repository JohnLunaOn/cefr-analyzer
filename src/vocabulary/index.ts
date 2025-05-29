import { CEFRLevel, IVocabularyItem, PartOfSpeech } from '../types';
import vocabularyData from './dict';

/**
 * 词汇表管理类
 * 提供加载和查询CEFR词汇的功能
 */
export class VocabularyManager {
  private vocabularyMap: Map<string, IVocabularyItem[]> = new Map();
  private initialized = false;

  /**
   * 初始化词汇表
   * 将词汇数据加载到内存中，并按单词建立索引
   */
  public initialize(): void {
    if (this.initialized) {
      return;
    }

    // 将词汇表数据转换为Map结构，便于快速查找
    const vocabData = vocabularyData as IVocabularyItem[];

    vocabData.forEach(item => {
      const word = item.word.toLowerCase();
      if (!this.vocabularyMap.has(word)) {
        this.vocabularyMap.set(word, []);
      }
      this.vocabularyMap.get(word)?.push(item);
    });

    this.initialized = true;
  }

  /**
   * 查询单词的CEFR级别
   * @param word 要查询的单词
   * @param pos 词性（可选）
   * @returns 单词的CEFR级别，如果未找到则返回undefined
   */
  public getCEFRLevel(word: string, pos?: PartOfSpeech): CEFRLevel | undefined {
    if (!this.initialized) {
      this.initialize();
    }

    const normalizedWord = word.toLowerCase();
    const entries = this.vocabularyMap.get(normalizedWord);

    if (!entries || entries.length === 0) {
      return undefined;
    }

    // 如果指定了词性，则查找匹配词性的条目
    if (pos) {
      const matchedEntry = entries.find(entry => entry.pos === pos);
      return matchedEntry?.cefr;
    }

    // 如果没有指定词性，返回最低级别的CEFR
    const levels: CEFRLevel[] = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
    let lowestLevel: CEFRLevel | undefined;

    for (const entry of entries) {
      const currentLevelIndex = levels.indexOf(entry.cefr);
      const lowestLevelIndex = lowestLevel ? levels.indexOf(lowestLevel) : Infinity;

      if (currentLevelIndex < lowestLevelIndex) {
        lowestLevel = entry.cefr;
      }
    }

    return lowestLevel;
  }

  /**
   * 获取单词的所有CEFR级别和词性信息
   * @param word 要查询的单词
   * @returns 单词的所有CEFR级别和词性信息
   */
  public getWordInfo(word: string): IVocabularyItem[] {
    if (!this.initialized) {
      this.initialize();
    }

    const normalizedWord = word.toLowerCase();
    return this.vocabularyMap.get(normalizedWord) || [];
  }

  /**
   * 检查单词是否在词汇表中
   * @param word 要检查的单词
   * @returns 是否在词汇表中
   */
  public hasWord(word: string): boolean {
    if (!this.initialized) {
      this.initialize();
    }

    const normalizedWord = word.toLowerCase();
    return this.vocabularyMap.has(normalizedWord);
  }

  /**
   * 获取词汇表中的单词总数
   * @returns 单词总数
   */
  public getTotalWords(): number {
    if (!this.initialized) {
      this.initialize();
    }

    return this.vocabularyMap.size;
  }
}

// 导出单例实例
export const vocabularyManager = new VocabularyManager();
