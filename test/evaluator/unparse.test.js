const { describe, it, expect } = require('@xufa/testing');
const fs = require('node:fs');
const { parse } = require('acorn');
const { unparse } = require('../../lib/evaluator/unparse');

describe('unparse', () => {
  it('Should unparse javascript AST', () => {
    const files = fs.readdirSync('./test/evaluator/fixtures');
    files.forEach((file) => {
      const content = fs.readFileSync(`./test/evaluator/fixtures/${file}`, 'utf-8').split(/\r?\n/).join('\n');
      const ast = parse(content, { ecmaVersion: 'latest', sourceType: 'module' });
      const unparsed = unparse(ast);
      expect(unparsed).toEqual(content);
    });
  });
});
