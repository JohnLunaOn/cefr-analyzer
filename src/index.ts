/**
 * CEFR Analyzer
 * 分析英文文本中各CEFR级别(A1-C2)单词的数量
 */

// 导出类型定义
export * from './types';

// 导出分析器
export * from './analyzer';
export * from './analyzer/types';

// 导出词汇表管理器
export * from './vocabulary';

// 导出工具函数
export * from './utils';

// 默认导出分析器实例
import { cefrAnalyzer } from './analyzer';
export default cefrAnalyzer;
