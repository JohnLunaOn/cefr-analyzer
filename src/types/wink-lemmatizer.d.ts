/**
 * Type declarations for wink-lemmatizer
 * https://github.com/winkjs/wink-lemmatizer
 */

declare module 'wink-lemmatizer' {
  /**
   * Lemmatizer for English language words
   */
  interface Lemmatizer {
    /**
     * Lemmatizes a noun to its singular form
     * @param word The noun to lemmatize
     * @returns The lemmatized form of the noun
     */
    noun(word: string): string;

    /**
     * Lemmatizes a verb to its base form
     * @param word The verb to lemmatize
     * @returns The lemmatized form of the verb
     */
    verb(word: string): string;

    /**
     * Lemmatizes an adjective to its base form
     * @param word The adjective to lemmatize
     * @returns The lemmatized form of the adjective
     */
    adjective(word: string): string;
  }

  const lemmatizer: Lemmatizer;
  export = lemmatizer;
}
