/**
 * Shared parser contracts for Sprint 0 scaffolding only.
 * These typedefs establish stable shapes before implementation begins.
 */

/**
 * @typedef {Object} Token
 * @property {string} type
 * @property {string} [value]
 * @property {number} line
 * @property {number} column
 * @property {Object} [metadata]
 */

/**
 * @typedef {Object} ASTNode
 * @property {string} type
 * @property {ASTNode[]} children
 * @property {number} startLine
 * @property {number} endLine
 * @property {string} [id]
 * @property {string} [content]
 * @property {number} [width]
 */

/**
 * @typedef {Object} ValidationError
 * @property {string} type
 * @property {string} message
 * @property {number} line
 * @property {number} column
 * @property {'error' | 'warning'} severity
 */

/**
 * @typedef {Object} ParseResult
 * @property {Token[]} tokens
 * @property {ASTNode | null} ast
 * @property {ValidationError[]} errors
 * @property {ValidationError[]} warnings
 * @property {{
 *   tokenCount: number,
 *   astDepth: number,
 *   parseTime: number,
 *   errorCount: number
 * }} diagnostics
 */

export {};
