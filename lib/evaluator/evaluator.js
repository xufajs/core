const { unparse } = require('./unparse');
const { parse } = require('acorn');
const S = require('../fun');

const defaultMembers = { ...S };
const FAIL_RESULT = {};

let walk;
const walkLiteral = (node) => node.value;

function walkDeleteIdentifier(node, context) {
  const newContext = context;
  return delete newContext[node.name];
}

function walkDeleteMember(node, context) {
  const obj = walk(node.object, context);
  if (!obj || obj === FAIL_RESULT || typeof obj === 'function') {
    return FAIL_RESULT;
  }
  if (node.property.type === 'Identifier') {
    return delete obj[node.property.name];
  }
  const prop = walk(node.property, context);
  if (prop === FAIL_RESULT) {
    return FAIL_RESULT;
  }
  return delete obj[prop];
}

function walkDelete(node, context) {
  switch (node.type) {
    case 'Identifier':
      return walkDeleteIdentifier(node, context);
    case 'MemberExpression':
      return walkDeleteMember(node, context);
    default:
      return FAIL_RESULT;
  }
}

function walkUnary(node, context) {
  switch (node.operator) {
    case '+':
      return +walk(node.argument, context);
    case '-':
      return -walk(node.argument, context);
    case '~':
      // eslint-disable-next-line no-bitwise
      return ~walk(node.argument, context);
    case '!':
      return !walk(node.argument, context);
    case 'delete':
      return walkDelete(node.argument, context);
    default:
      return FAIL_RESULT;
  }
}

function walkArray(node, context) {
  const result = [];
  for (let i = 0, l = node.elements.length; i < l; i += 1) {
    const x = walk(node.elements[i], context);
    if (x === FAIL_RESULT) {
      return FAIL_RESULT;
    }
    result.push(x);
  }
  return result;
}

function walkObject(node, context) {
  const result = {};
  for (let i = 0, l = node.properties.length; i < l; i += 1) {
    const property = node.properties[i];
    const value = walk(property.value, context);
    if (value === FAIL_RESULT) {
      return FAIL_RESULT;
    }
    result[property.key.vlaue || property.key.name] = value;
  }
  return result;
}

function walkBinary(node, context) {
  const left = walk(node.left, context);
  if (left === FAIL_RESULT) {
    return FAIL_RESULT;
  }
  if (node.operator === '&&' && !left) {
    return false;
  }
  if (node.operator === '||' && left) {
    return left;
  }
  const right = walk(node.right, context);
  if (right === FAIL_RESULT) {
    return FAIL_RESULT;
  }
  switch (node.operator) {
    case '==':
      // eslint-disable-next-line eqeqeq
      return left == right;
    case '===':
      return left === right;
    case '!=':
      // eslint-disable-next-line eqeqeq
      return left != right;
    case '!==':
      return left !== right;
    case '**':
      return left ** right;
    case '+':
      return left + right;
    case '-':
      return left - right;
    case '*':
      return left * right;
    case '/':
      return left / right;
    case '%':
      return left % right;
    case '<':
      return left < right;
    case '<=':
      return left <= right;
    case '>':
      return left > right;
    case '>=':
      return left >= right;
    case '|':
      // eslint-disable-next-line no-bitwise
      return left | right;
    case '&':
      // eslint-disable-next-line no-bitwise
      return left & right;
    case '^':
      // eslint-disable-next-line no-bitwise
      return left ^ right;
    case '||':
      return left || right;
    case '&&':
      return left && right;
    default:
      return FAIL_RESULT;
  }
}

function walkIdentifier(node, context) {
  if ({}.hasOwnProperty.call(context, node.name)) {
    return context[node.name];
  }
  return undefined;
}

function walkThis(node, context) {
  if ({}.hasOwnProperty.call(context, 'this')) {
    return context.this;
  }
  return undefined;
}

function walkFunctionExecution(node, context, args) {
  const newContext = {};
  const keys = Object.keys(context);
  keys.forEach((element) => {
    newContext[element] = context[element];
  });
  node.params.forEach((key, index) => {
    if (key.type === 'Identifier') {
      newContext[key.name] = args ? args[index] : null;
    }
  });
  const bodies = node.body.body;
  let value;
  for (let i = 0, l = bodies.length; i < l; i += 1) {
    value = walk(bodies[i], newContext);
    if (value === FAIL_RESULT) {
      return FAIL_RESULT;
    }
  }
  return value;
}

function walkCall(node, context) {
  let callee = walk(node.callee, context);
  let calleeReplaced = false;
  if (!callee && node.callee.type === 'MemberExpression' && node.callee.property?.type === 'Identifier') {
    if (defaultMembers[node.callee.property.name]) {
      callee = defaultMembers[node.callee.property.name];
      calleeReplaced = true;
    }
  }
  if (!(typeof callee === 'function' || (callee && callee.type === 'FunctionExpression'))) {
    return FAIL_RESULT;
  }
  let ctx = node.callee.object ? walk(node.callee.object, context) : callee;
  if (ctx === FAIL_RESULT) {
    ctx = null;
  }
  const args = [];
  for (let i = 0, l = node.arguments.length; i < l; i += 1) {
    const current = node.arguments[i];
    const isSpread = current.type === 'SpreadElement';
    const x = walk(isSpread ? current.argument : current, context);
    if (x === FAIL_RESULT) {
      return FAIL_RESULT;
    }
    if (isSpread) {
      args.push(...x);
    } else {
      args.push(x);
    }
  }
  if (typeof callee === 'function') {
    return calleeReplaced ? callee(ctx, ...args) : callee.apply(ctx, args);
  }
  return walkFunctionExecution(callee, context, args);
}

function walkMember(node, context) {
  const obj = walk(node.object, context);
  if (obj === FAIL_RESULT || typeof obj === 'function') {
    return FAIL_RESULT;
  }
  if ((obj === null || obj === undefined) && node.optional) {
    return obj;
  }
  if (node.property.type === 'Identifier') {
    return obj[node.property.name];
  }
  const prop = walk(node.property, context);
  if (prop === FAIL_RESULT) {
    return FAIL_RESULT;
  }
  return obj ? obj[prop] : FAIL_RESULT;
}

function walkConditional(node, context) {
  const value = walk(node.test, context);
  if (value === FAIL_RESULT) {
    return FAIL_RESULT;
  }
  if (value) {
    return walk(node.consequent, context);
  }
  if (!node.alternate) {
    return undefined;
  }
  return walk(node.alternate, context);
}

function walkExpression(node, context) {
  const value = walk(node.expression, context);
  if (value === FAIL_RESULT) {
    return FAIL_RESULT;
  }
  return value;
}

function walkReturn(node, context) {
  return walk(node.argument, context);
}

function walkFunction(node, context, args) {
  const newContext = {};
  const keys = Object.keys(context);
  keys.forEach((element) => {
    newContext[element] = context[element];
  });
  node.params.forEach((key, index) => {
    if (key.type === 'Identifier') {
      newContext[key.name] = args ? args[index] : null;
    }
  });
  const bodies = node.body.body;
  for (let i = 0, l = bodies.length; i < l; i += 1) {
    if (walk(bodies[i], newContext) === FAIL_RESULT) {
      return FAIL_RESULT;
    }
  }
  const vals = keys.map((key) => context[key]);
  const unparsed = unparse(node);
  // eslint-disable-next-line
  return Function(keys.join(', '), `return ${unparsed}`).apply(null, vals);
}

function walkTemplateLiteral(node, context) {
  let str = '';
  for (let i = 0; i < node.expressions.length; i += 1) {
    str += walk(node.quasis[i], context);
    str += walk(node.expressions[i], context);
  }
  return str;
}

function walkTemplateElement(node) {
  return node.value.cooked;
}

function walkTaggedTemplate(node, context) {
  const tag = walk(node.tag, context);
  const { quasi } = node;
  const strings = quasi.quasis.map((q) => walk(q, context));
  const values = quasi.expressions.map((e) => walk(e, context));
  // eslint-disable-next-line prefer-spread
  return tag.apply(null, [strings].concat(values));
}

function walkSetIdentifier(node, context, value) {
  const newContext = context;
  newContext[node.name] = value;
  return value;
}

function walkSetMember(node, context, value) {
  const obj = walk(node.object, context);
  if (obj === FAIL_RESULT || typeof obj === 'function') {
    return FAIL_RESULT;
  }
  if (node.property.type === 'Identifier') {
    obj[node.property.name] = value;
    return value;
  }
  const prop = walk(node.property, context);
  if (prop === FAIL_RESULT) {
    return FAIL_RESULT;
  }
  if (!obj) {
    return FAIL_RESULT;
  }
  obj[prop] = value;
  return value;
}

function walkSet(node, context, value) {
  switch (node.type) {
    case 'Identifier':
      return walkSetIdentifier(node, context, value);
    case 'MemberExpression':
      return walkSetMember(node, context, value);
    default:
      return FAIL_RESULT;
  }
}

function walkUpdateExpression(node, context) {
  let value = walk(node.argument, context);
  if (value === FAIL_RESULT) {
    return FAIL_RESULT;
  }
  switch (node.operator) {
    case '++':
      value += 1;
      return walkSet(node.argument, context, value);
    case '--':
      value -= 1;
      return walkSet(node.argument, context, value);
    default:
      return FAIL_RESULT;
  }
}

function walkAssignmentExpression(node, context) {
  const value = walk(node.right, context);
  if (value === FAIL_RESULT) {
    return FAIL_RESULT;
  }
  let leftValue = walk(node.left, context);
  if (leftValue === FAIL_RESULT) {
    leftValue = 0;
  }
  switch (node.operator) {
    case '=':
      walkSet(node.left, context, value);
      return value;
    case '+=':
      leftValue += value;
      walkSet(node.left, context, leftValue);
      return leftValue;
    case '-=':
      leftValue -= value;
      walkSet(node.left, context, leftValue);
      return leftValue;
    case '*=':
      leftValue *= value;
      walkSet(node.left, context, leftValue);
      return leftValue;
    case '/=':
      leftValue /= value;
      walkSet(node.left, context, leftValue);
      return leftValue;
    case '%=':
      leftValue %= value;
      walkSet(node.left, context, leftValue);
      return leftValue;
    case '|=':
      // eslint-disable-next-line no-bitwise
      leftValue |= value;
      walkSet(node.left, context, leftValue);
      return leftValue;
    case '&=':
      // eslint-disable-next-line no-bitwise
      leftValue &= value;
      walkSet(node.left, context, leftValue);
      return leftValue;
    case '^=':
      // eslint-disable-next-line no-bitwise
      leftValue ^= value;
      walkSet(node.left, context, leftValue);
      return leftValue;
    default:
      return FAIL_RESULT;
  }
}

function walkNew(node, context) {
  const Clazz = walk(node.callee, context);
  const args = node.arguments.map((arg) => walk(arg, context));
  const result = new Clazz(...args);
  return result;
}

function walkFunctionDeclaration(node, context) {
  const fn = { ...node };
  fn.type = 'FunctionExpression';
  context[node.id.name] = fn;
}

function walkVariableDeclaration(node, context) {
  for (let i = 0; i < node.declarations.length; i += 1) {
    walk(node.declarations[i], context);
  }
}

function walkVariableDeclarator(node, context) {
  context[node.id.name] = walk(node.init, context);
}

function walkBlock(node, context) {
  if (Array.isArray(node.body)) {
    let result;
    for (let i = 0; i < node.body.length; i += 1) {
      result = walk(node.body[i], context);
    }
    return result;
  }
  return walk(node.body, context);
}

function walkArrowFunction(node, context) {
  const newContext = {};
  const keys = Object.keys(context).filter((key) => key !== 'this');
  keys.forEach((element) => {
    newContext[element] = context[element];
  });
  node.params.forEach((key) => {
    if (key.type === 'Identifier') {
      newContext[key.name] = null;
    }
  });
  const vals = keys.map((key) => context[key]);
  // eslint-disable-next-line
  return Function(keys.join(', '), `return ${unparse(node)}`).apply(null, vals);
}

function walkChainExpression(node, context) {
  return walk(node.expression, context);
}

walk = (node, context) => {
  switch (node.type) {
    case 'ChainExpression':
      return walkChainExpression(node, context);
    case 'Literal':
      return walkLiteral(node, context);
    case 'UnaryExpression':
      return walkUnary(node, context);
    case 'ArrayExpression':
      return walkArray(node, context);
    case 'ObjectExpression':
      return walkObject(node, context);
    case 'BinaryExpression':
    case 'LogicalExpression':
      return walkBinary(node, context);
    case 'Identifier':
      return walkIdentifier(node, context);
    case 'ThisExpression':
      return walkThis(node, context);
    case 'CallExpression':
      return walkCall(node, context);
    case 'MemberExpression':
      return walkMember(node, context);
    case 'ConditionalExpression':
      return walkConditional(node, context);
    case 'ExpressionStatement':
      return walkExpression(node, context);
    case 'ReturnStatement':
      return walkReturn(node, context);
    case 'FunctionExpression':
      return walkFunction(node, context);
    case 'TemplateLiteral':
      return walkTemplateLiteral(node, context);
    case 'TemplateElement':
      return walkTemplateElement(node, context);
    case 'TaggedTemplateExpression':
      return walkTaggedTemplate(node, context);
    case 'UpdateExpression':
      return walkUpdateExpression(node, context);
    case 'AssignmentExpression':
      return walkAssignmentExpression(node, context);
    case 'IfStatement':
      return walkConditional(node, context);
    case 'BlockStatement':
      return walkBlock(node, context);
    case 'FunctionDeclaration':
      return walkFunctionDeclaration(node, context);
    case 'NewExpression':
      return walkNew(node, context);
    case 'VariableDeclaration':
      return walkVariableDeclaration(node, context);
    case 'VariableDeclarator':
      return walkVariableDeclarator(node, context);
    case 'ArrowFunctionExpression':
      return walkArrowFunction(node, context);
    default:
      return FAIL_RESULT;
  }
};

function evaluateAll(str, context = {}) {
  const result = [];
  const compiled = parse(str, { ecmaVersion: 2020 });
  for (let i = 0; i < compiled.body.length; i += 1) {
    const current = compiled.body[i];
    const expression = current.expression ? current.expression : current;
    try {
      const value = walk(expression, context);
      result.push(value === FAIL_RESULT ? undefined : value);
    } catch (e) {
      if (!context.evaluateErrors) {
        context.evaluateErrors = [];
      }
      context.evaluateErrors.push({
        expression: unparse(expression),
        error: e,
      });
      result.push(undefined);
    }
  }
  return result;
}

function evaluate(str, context) {
  const result = evaluateAll(str, context);
  if (!result || result.length === 0) {
    return undefined;
  }
  return result[result.length - 1];
}

class Evaluator {
  constructor(context) {
    this.defaultContext = context || {};
    this.failResult = FAIL_RESULT;
  }

  evaluateAll(str, context) {
    const newContext = context || this.defaultContext;
    return evaluateAll(str, newContext);
  }

  evaluate(str, context) {
    const result = this.evaluateAll(str, context);
    if (!result || result.length === 0) {
      return undefined;
    }
    return result[result.length - 1];
  }

  walkUnary(node, context) {
    return walkUnary(node, context || this.defaultContext);
  }

  walkLiteral(node, context) {
    return walkLiteral(node, context || this.defaultContext);
  }

  walkIdentifier(node, context) {
    return walkIdentifier(node, context || this.defaultContext);
  }

  walkThis(node, context) {
    return walkThis(node, context || this.defaultContext);
  }
}

module.exports = {
  FAIL_RESULT,
  Evaluator,
  walkFunctionExecution,
  evaluate,
  walkLiteral,
};
