const MAX_DEPTH = 100;
const OP_PRECEDENCE = {
  '||': 2,
  '??': 3,
  '&&': 4,
  '|': 5,
  '^': 6,
  '&': 7,
  '==': 8,
  '!=': 8,
  '===': 8,
  '!==': 8,
  '<': 9,
  '>': 9,
  '<=': 9,
  '>=': 9,
  in: 9,
  instanceof: 9,
  '<<': 10,
  '>>': 10,
  '>>>': 10,
  '+': 11,
  '-': 11,
  '*': 12,
  '%': 12,
  '/': 12,
  '**': 13,
};

const EOL = '\n';
const NEEDS_PARENTHESES = 17;

const EXP_PRECEDENCE = {
  ArrayExpression: 20,
  TaggedTemplateExpression: 20,
  ThisExpression: 20,
  Identifier: 20,
  PrivateIdentifier: 20,
  Literal: 18,
  TemplateLiteral: 20,
  Super: 20,
  SequenceExpression: 20,
  MemberExpression: 19,
  ChainExpression: 19,
  CallExpression: 19,
  NewExpression: 19,
  ArrowFunctionExpression: NEEDS_PARENTHESES,
  ClassExpression: NEEDS_PARENTHESES,
  FunctionExpression: NEEDS_PARENTHESES,
  ObjectExpression: NEEDS_PARENTHESES,
  UpdateExpression: 16,
  UnaryExpression: 15,
  AwaitExpression: 15,
  BinaryExpression: 14,
  LogicalExpression: 13,
  ConditionalExpression: 4,
  AssignmentExpression: 3,
  YieldExpression: 2,
  RestElement: 1,
};

let walk;

function hasCallExpression(node) {
  let current = node;
  let depth = 0;
  while (current && depth < MAX_DEPTH) {
    if (!current.type.startsWith('Mem')) return current.type.startsWith('Call');
    depth += 1;
    current = current.object;
  }
  return false;
}

function walkVariableDeclarator(node, state) {
  walk(node.id.type, node.id, state);
  if (node.init != null) state.write(state, ' = ', () => walk(node.init.type, node.init, state));
}

function formatVariableDeclaration(state, node) {
  state.write(`${node.kind} `);
  node.declarations.forEach((declaration, i) => {
    if (i > 0) state.write(', ');
    walkVariableDeclarator(declaration, state);
  });
}

function formatSequence(state, nodes) {
  state.write('(');
  nodes?.forEach((node, i) => {
    if (i > 0) state.write(', ');
    walk(node.type, node, state);
  });
  state.write(')');
}

const betweenParentheses = (state, fn, need) => state.write(need ? '(' : undefined, fn, need ? ')' : undefined);

function expNeedsParenthesis(node, parent, isRight) {
  const prec = EXP_PRECEDENCE[node.type];
  if (prec === NEEDS_PARENTHESES) return true;
  const parentPrec = EXP_PRECEDENCE[parent.type];
  if (prec !== parentPrec)
    return prec < parentPrec || (!isRight && prec === 15 && parentPrec === 14 && parent.operator === '**');
  if (prec !== 13 && prec !== 14) return false;
  if (node.operator === '**' && parent.operator === '**') return !isRight;
  if (prec === 13 && parentPrec === 13 && (node.operator === '??' || parent.operator === '??')) return true;
  if (isRight) return OP_PRECEDENCE[node.operator] <= OP_PRECEDENCE[parent.operator];
  return OP_PRECEDENCE[node.operator] < OP_PRECEDENCE[parent.operator];
}

const format = (state, node, parent, isRight) =>
  betweenParentheses(state, () => walk(node.type, node, state), expNeedsParenthesis(node, parent, isRight));

function walkProgram(node, state) {
  const indent = state.indent.repeat(state.indentLevel);
  node.body.forEach((statement) => state.write(indent, () => walk(statement.type, statement, state), EOL));
}

function walkBlockStatement(node, srcState) {
  const state = srcState;
  const indent = state.indent.repeat(state.indentLevel);
  state.indentLevel += 1;
  state.write('{');
  if (node.body?.length) {
    const sIndent = indent + state.indent;
    state.write(EOL);
    node.body.forEach((statement) => state.write(sIndent, () => walk(statement.type, statement, state), EOL));
    state.write(indent);
  }
  state.write('}');
  state.indentLevel -= 1;
}

const walkStaticBlock = (node, state) => state.write('static ', () => walkBlockStatement(node, state));
const walkEmptyStatement = (node, state) => state.write(';');
const walkThisExpression = (node, state) => state.write('this', node);
const walkSuper = (node, state) => state.write('super', node);
const walkRestElement = (node, state) => state.write('...', () => walk(node.argument.type, node.argument, state));
const walkMetaProperty = (node, state) => state.write(`${node.meta.name}.${node.property.name}`);
const walkPrivateIdentifier = (node, state) => state.write(`#${node.name}`, node);
const walkDebuggerStatement = (node, state) => state.write('debugger;');
const walkVariableDeclaration = (node, state) => state.write(() => formatVariableDeclaration(state, node), ';');
const walkRegExpLiteral = (node, state) => state.write(`/${node.regex.pattern}/${node.regex.flags}`, node);
const walkIdentifier = (node, state) => state.write(node.name, node);
const walkThrowStatement = (node, state) =>
  state.write('throw ', () => walk(node.argument.type, node.argument, state), ';');
const walkImportExpression = (node, state) =>
  state.write('import(', () => walk(node.source.type, node.source, state), ')');
const walkTemplateElement = (node, state) => state.write(node.value.raw);
const walkSequenceExpression = (node, state) => formatSequence(state, node.expressions);
const walkChainExpression = (node, state) => walk(node.expression.type, node.expression, state);

function walkExpressionStatement(node, state) {
  const precedence = EXP_PRECEDENCE[node.expression.type];
  const parentheses = precedence === NEEDS_PARENTHESES || (precedence === 3 && node.expression.left.type[0] === 'O');
  betweenParentheses(state, () => walk(node.expression.type, node.expression, state), parentheses);
  state.write(';');
}

function walkIfStatement(node, state) {
  state.write('if (', () => walk(node.test.type, node.test, state), ') ');
  walk(node.consequent.type, node.consequent, state);
  if (node.alternate != null) {
    state.write(' else ', () => walk(node.alternate.type, node.alternate, state));
  }
}

function walkLabeledStatement(node, state) {
  walk(node.label.type, node.label, state);
  state.write(': ');
  walk(node.body.type, node.body, state);
}

function walkBreakStatement(node, state) {
  state.write('break');
  if (node.label != null) {
    state.write(' ', () => walk(node.label.type, node.label, state));
  }
  state.write(';');
}

function walkContinueStatement(node, state) {
  state.write('continue');
  if (node.label != null) {
    state.write(' ');
    walk(node.label.type, node.label, state);
  }
  state.write(';');
}

function walkWithStatement(node, state) {
  betweenParentheses(state, () => walk(node.object.type, node.object, state), true);
  walk(node.body.type, node.body, state);
}

function walkReturnStatement(node, state) {
  state.write('return');
  if (node.argument) {
    state.write(' ', () => walk(node.argument.type, node.argument, state));
  }
  state.write(';');
}

function walkSwitchStatement(node, srcState) {
  const state = srcState;
  const indent = state.indent.repeat(state.indentLevel);
  state.indentLevel += 2;
  const caseIndent = indent + state.indent;
  const statementIndent = caseIndent + state.indent;
  state.write('switch (', () => walk(node.discriminant.type, node.discriminant, state), `) {${EOL}`);
  const { cases } = node;
  cases.forEach((occurence) => {
    if (occurence.test) {
      state.write(`${caseIndent}case `, () => walk(occurence.test.type, occurence.test, state), `:${EOL}`);
    } else {
      state.write(`${caseIndent}default:${EOL}`);
    }
    occurence.consequent.forEach((statement) => {
      state.write(statementIndent, () => walk(statement.type, statement, state), EOL);
    });
  });
  state.indentLevel -= 2;
  state.write(`${indent}}`);
}

function walkTryStatement(node, state) {
  state.write('try ', () => walk(node.block.type, node.block, state));
  if (node.handler) {
    const { handler } = node;
    if (handler.param === null) {
      state.write(' catch ');
    } else {
      state.write(' catch (', () => walk(handler.param.type, handler.param, state), ') ');
    }
    walk(handler.body.type, handler.body, state);
  }
  if (node.finalizer) {
    state.write(' finally ', () => walk(node.finalizer.type, node.finalizer, state));
  }
}

function walkWhileStatement(node, state) {
  state.write('while (', () => walk(node.test.type, node.test, state), ') ');
  walk(node.body.type, node.body, state);
}

function walkDoWhileStatement(node, state) {
  state.write('do ');
  walk(node.body.type, node.body, state);
  state.write(' while (');
  walk(node.test.type, node.test, state);
  state.write(');');
}

function walkForStatement(node, state) {
  state.write('for (');
  if (node.init != null) {
    const { init } = node;
    if (init.type[0] === 'V') {
      formatVariableDeclaration(state, init);
    } else {
      walk(init.type, init, state);
    }
  }
  state.write('; ');
  if (node.test) {
    walk(node.test.type, node.test, state);
  }
  state.write('; ');
  if (node.update) {
    walk(node.update.type, node.update, state);
  }
  state.write(') ', () => walk(node.body.type, node.body, state));
}

function walkForInStatement(node, state) {
  state.write(`for ${node.await ? 'await ' : ''}(`);
  const { left } = node;
  if (left.type[0] === 'V') {
    formatVariableDeclaration(state, left);
  } else {
    walk(left.type, left, state);
  }
  state.write(node.type[3] === 'I' ? ' in ' : ' of ');
  walk(node.right.type, node.right, state);
  state.write(') ');
  walk(node.body.type, node.body, state);
}

function walkFunctionDeclaration(node, state) {
  state.write(`${node.async ? 'async ' : ''}function${node.generator ? '* ' : ' '}${node.id ? node.id.name : ''}`);
  formatSequence(state, node.params);
  state.write(' ', () => walk(node.body.type, node.body, state));
}

function walkClassDeclaration(node, state) {
  state.write(`class ${node.id ? `${node.id.name} ` : ''}`, node);
  if (node.superClass) {
    state.write('extends ');
    const { superClass } = node;
    const { type } = superClass;
    const precedence = EXP_PRECEDENCE[type];
    const needsParentheses =
      (type[0] !== 'C' || type[1] !== 'l' || type[5] !== 'E') &&
      (precedence === NEEDS_PARENTHESES || precedence < EXP_PRECEDENCE.ClassExpression);
    betweenParentheses(state, () => walk(type, superClass, state), needsParentheses);
    state.write(' ');
  }
  walkBlockStatement(node.body, state);
}

function walkLiteral(node, state) {
  if (node.raw != null) return state.write(node.raw);
  if (node.regex != null) return walkRegExpLiteral(node, state);
  if (node.bigint != null) return state.write(`${node.bigint}n`);
  return state.write(JSON.stringify(node.value));
}

function walkImportAttribute(node, state) {
  walkIdentifier(node.key, state);
  state.write(': ', () => walkLiteral(node.value, state));
}

function walkImportDeclaration(node, state) {
  state.write('import ');
  const { specifiers, attributes } = node;
  let count = 0;
  const otherSpecifiers = [];
  specifiers.forEach((specifier) => {
    if (['ImportDefaultSpecifier', 'ImportNamespaceSpecifier'].includes(specifier.type)) {
      state.write(count > 0 ? ', ' : '', specifier.type[6] === 'N' ? '* as ' : '', specifier.local.name);
      count += 1;
    } else {
      otherSpecifiers.push(specifier);
    }
  });
  if (otherSpecifiers.length > 0) {
    if (count > 0) state.write(', ');
    state.write('{');
    otherSpecifiers.forEach((specifier, i) => {
      const { name } = specifier.imported;
      const { name: localName } = specifier.local;
      state.write(name, name !== localName ? ` as ${localName}` : '', i < otherSpecifiers.length - 1 ? ', ' : '');
    });
    state.write('}');
  }
  state.write(' from ');
  walkLiteral(node.source, state);
  if (attributes && attributes.length > 0) {
    state.write(' with { ');
    attributes.forEach((attribute, i) => {
      walkImportAttribute(attribute, state);
      if (i < attributes.length - 1) state.write(', ');
    });
    state.write(' }');
  }
  state.write(';');
}

function walkExportDefaultDeclaration(node, state) {
  state.write('export default ');
  walk(node.declaration.type, node.declaration, state);
  if (EXP_PRECEDENCE[node.declaration.type] != null && node.declaration.type[0] !== 'F') state.write(';');
}

function walkExportNamedDeclaration(node, state) {
  state.write('export ');
  if (node.declaration) {
    walk(node.declaration.type, node.declaration, state);
  } else {
    state.write('{');
    node.specifiers.forEach((specifier, i) => {
      state.write(i > 0 ? ', ' : '', specifier.local.name);
      if (specifier.local.name !== specifier.exported.name) {
        state.write(` as ${specifier.exported.name}`);
      }
    });
    state.write('}');
    if (node.source) {
      state.write(' from ');
      walkLiteral(node.source, state);
    }
    if (node?.attributes?.length) {
      state.write(' with { ');
      node.attributes.forEach((attribute, i) => {
        walkImportAttribute(attribute, state);
        if (i < node.attributes.length - 1) state.write(', ');
      });
      state.write(' }');
    }
    state.write(';');
  }
}

function walkExportAllDeclaration(node, state) {
  state.write(node.exported ? `export * as ${node.exported.name} from ` : 'export * from ');
  walkLiteral(node.source, state);
  if (node?.attributes?.length) {
    state.write(' with { ');
    node.attributes.forEach((attribute, i) => {
      walkImportAttribute(attribute, state);
      if (i < node.attributes.length - 1) state.write(', ');
    });
    state.write(' }');
  }
  state.write(';');
}

function walkMethodDefinition(node, state) {
  state.write(
    node.static ? 'static ' : '',
    ['g', 's'].includes(node.kind[0]) ? `${node.kind} ` : '',
    node.value.async ? 'async ' : '',
    node.value.generator ? '*' : ''
  );
  if (node.computed) {
    state.write('[', () => walk(node.key.type, node.key, state), ']');
  } else {
    walk(node.key.type, node.key, state);
  }
  formatSequence(state, node.value.params);
  state.write(' ', () => walk(node.value.body.type, node.value.body, state));
}

function walkObjectExpression(node, srcState) {
  const state = srcState;
  const indent = state.indent.repeat(state.indentLevel);
  state.indentLevel += 1;
  const propertyIndent = indent + state.indent;
  state.write('{');
  if (node.properties.length > 0) {
    state.write(EOL);
    node.properties.forEach((property, i) => {
      state.write(propertyIndent);
      walk(property.type, property, state);
      if (i < node.properties.length - 1) state.write(`,${EOL}`);
    });
    state.write(EOL, indent);
  }
  state.write('}');
  state.indentLevel -= 1;
}

function walkArrowFunctionExpression(node, state) {
  state.write(node.async ? 'async ' : '', node);
  const { params } = node;
  if (params != null) {
    if (params.length === 1 && params[0].type[0] === 'I') {
      state.write(params[0].name, params[0]);
    } else {
      formatSequence(state, node.params);
    }
  }
  state.write(' => ');
  if (node.body.type[0] === 'O') {
    betweenParentheses(state, () => walkObjectExpression(node.body, state), true);
  } else {
    walk(node.body.type, node.body, state);
  }
}

function walkYieldExpression(node, state) {
  state.write(node.delegate ? 'yield*' : 'yield');
  if (node.argument) state.write(' ', () => walk(node.argument.type, node.argument, state));
}

const walkAwaitExpression = (node, state) => state.write('await ', node, () => format(state, node.argument, node));

function walkTemplateLiteral(node, state) {
  const { quasis, expressions } = node;
  state.write('`');
  for (let i = 0; i < expressions.length; i += 1) {
    const expression = expressions[i];
    state.write(quasis[i].value.raw, '${');
    walk(expression.type, expression, state);
    state.write('}');
  }
  state.write(quasis[quasis.length - 1].value.raw, '`');
}

function walkTaggedTemplateExpression(node, state) {
  format(state, node.tag, node);
  walk(node.quasi.type, node.quasi, state);
}

function walkArrayExpression(node, state) {
  state.write('[');
  node.elements.forEach((element, i) => {
    if (element != null) {
      walk(element.type, element, state);
    }
    if (i < node.elements.length - 1 || element === null) {
      state.write(', ');
    }
  });
  state.write(']');
}

function walkProperty(node, state) {
  if (node.method || node.kind[0] !== 'i') {
    walkMethodDefinition(node, state);
  } else {
    if (!node.shorthand) {
      if (node.computed) {
        state.write('[', () => walk(node.key.type, node.key, state), ']');
      } else {
        walk(node.key.type, node.key, state);
      }
      state.write(': ');
    }
    walk(node.value.type, node.value, state);
  }
}

function walkPropertyDefinition(node, state) {
  state.write(node.static ? 'static ' : '', node.computed ? '[' : '');
  walk(node.key.type, node.key, state);
  if (node.computed) state.write(']');
  if (node.value === null && node.key.type[0] !== 'F') state.write(';');
  if (node.value !== null) state.write(' = ', () => walk(node.value.type, node.value, state), ';');
}

function walkObjectPattern(node, state) {
  state.write('{');
  node.properties.forEach((property, i) => {
    if (i > 0) state.write(', ');
    walk(property.type, property, state);
  });
  state.write('}');
}

function walkUnaryExpression(node, state) {
  if (node.prefix) {
    const {
      operator,
      argument,
      argument: { type },
    } = node;
    state.write(operator);
    const needsParentheses = expNeedsParenthesis(argument, node);
    if (
      !needsParentheses &&
      (operator.length > 1 ||
        (type[0] === 'U' &&
          (type[1] === 'n' || type[1] === 'p') &&
          argument.prefix &&
          argument.operator[0] === operator &&
          (operator === '+' || operator === '-')))
    ) {
      state.write(' ');
    }
    if (needsParentheses) {
      state.write(operator.length > 1 ? ' (' : '(', () => walk(type, argument, state), ')');
    } else {
      walk(type, argument, state);
    }
  } else {
    walk(node.argument.type, node.argument, state);
    state.write(node.operator);
  }
}

function walkUpdateExpression(node, state) {
  if (node.prefix) state.write(node.operator);
  walk(node.argument.type, node.argument, state);
  if (!node.prefix) state.write(node.operator);
}

function walkAssignmentExpression(node, state) {
  walk(node.left.type, node.left, state);
  state.write(` ${node.operator} `);
  walk(node.right.type, node.right, state);
}

function walkAssignmentPattern(node, state) {
  walk(node.left.type, node.left, state);
  state.write(' = ');
  walk(node.right.type, node.right, state);
}

function walkBinaryExpression(node, state) {
  if (node.operator === 'in') state.write('(');
  format(state, node.left, node, false);
  state.write(` ${node.operator} `);
  format(state, node.right, node, true);
  if (node.operator === 'in') state.write(')');
}

function walkConditionalExpression(node, state) {
  const { test } = node;
  const precedence = EXP_PRECEDENCE[test.type];
  const needsParentheses = precedence === NEEDS_PARENTHESES || precedence <= EXP_PRECEDENCE.ConditionalExpression;
  betweenParentheses(state, () => walk(test.type, test, state), needsParentheses);
  state.write(' ? ', () => walk(node.consequent.type, node.consequent, state));
  state.write(' : ', () => walk(node.alternate.type, node.alternate, state));
}

function walkNewExpression(node, state) {
  state.write('new ');
  const precedence = EXP_PRECEDENCE[node.callee.type];
  const needsParentheses =
    precedence === NEEDS_PARENTHESES || precedence < EXP_PRECEDENCE.CallExpression || hasCallExpression(node.callee);
  betweenParentheses(state, () => walk(node.callee.type, node.callee, state), needsParentheses);
  formatSequence(state, node.arguments);
}

function walkCallExpression(node, state) {
  const precedence = EXP_PRECEDENCE[node.callee.type];
  const needsParentheses = precedence === NEEDS_PARENTHESES || precedence < EXP_PRECEDENCE.CallExpression;
  betweenParentheses(state, () => walk(node.callee.type, node.callee, state), needsParentheses);
  if (node.optional) state.write('?.');
  formatSequence(state, node.arguments);
}

function walkMemberExpression(node, state) {
  const precedence = EXP_PRECEDENCE[node.object.type];
  const needsParentheses = precedence === NEEDS_PARENTHESES || precedence < EXP_PRECEDENCE.MemberExpression;
  betweenParentheses(state, () => walk(node.object.type, node.object, state), needsParentheses);
  if (node.computed) {
    if (node.optional) state.write('?.');
    state.write('[', () => walk(node.property.type, node.property, state), ']');
  } else {
    state.write(node.optional ? '?..' : '.');
    walk(node.property.type, node.property, state);
  }
}

const FUNCTIONS_DICT = {
  Program: walkProgram,
  BlockStatement: walkBlockStatement,
  ClassBody: walkBlockStatement,
  StaticBlock: walkStaticBlock,
  EmptyStatement: walkEmptyStatement,
  ExpressionStatement: walkExpressionStatement,
  IfStatement: walkIfStatement,
  LabeledStatement: walkLabeledStatement,
  BreakStatement: walkBreakStatement,
  ContinueStatement: walkContinueStatement,
  WithStatement: walkWithStatement,
  SwitchStatement: walkSwitchStatement,
  ReturnStatement: walkReturnStatement,
  ThrowStatement: walkThrowStatement,
  TryStatement: walkTryStatement,
  WhileStatement: walkWhileStatement,
  DoWhileStatement: walkDoWhileStatement,
  ForStatement: walkForStatement,
  ForInStatement: walkForInStatement,
  ForOfStatement: walkForInStatement,
  DebuggerStatement: walkDebuggerStatement,
  FunctionDeclaration: walkFunctionDeclaration,
  FunctionExpression: walkFunctionDeclaration,
  VariableDeclaration: walkVariableDeclaration,
  VariableDeclarator: walkVariableDeclarator,
  ClassDeclaration: walkClassDeclaration,
  ClassExpression: walkClassDeclaration,
  ImportDeclaration: walkImportDeclaration,
  ImportAttribute: walkImportAttribute,
  ImportExpression: walkImportExpression,
  ExportDefaultDeclaration: walkExportDefaultDeclaration,
  ExportNamedDeclaration: walkExportNamedDeclaration,
  ExportAllDeclaration: walkExportAllDeclaration,
  MethodDefinition: walkMethodDefinition,
  ArrowFunctionExpression: walkArrowFunctionExpression,
  ThisExpression: walkThisExpression,
  Super: walkSuper,
  RestElement: walkRestElement,
  SpreadElement: walkRestElement,
  YieldExpression: walkYieldExpression,
  AwaitExpression: walkAwaitExpression,
  TemplateLiteral: walkTemplateLiteral,
  TemplateElement: walkTemplateElement,
  TaggedTemplateExpression: walkTaggedTemplateExpression,
  ArrayExpression: walkArrayExpression,
  ArrayPattern: walkArrayExpression,
  ObjectExpression: walkObjectExpression,
  Property: walkProperty,
  PropertyDefinition: walkPropertyDefinition,
  ObjectPattern: walkObjectPattern,
  SequenceExpression: walkSequenceExpression,
  UnaryExpression: walkUnaryExpression,
  UpdateExpression: walkUpdateExpression,
  AssignmentExpression: walkAssignmentExpression,
  AssignmentPattern: walkAssignmentPattern,
  BinaryExpression: walkBinaryExpression,
  LogicalExpression: walkBinaryExpression,
  ConditionalExpression: walkConditionalExpression,
  NewExpression: walkNewExpression,
  CallExpression: walkCallExpression,
  ChainExpression: walkChainExpression,
  MemberExpression: walkMemberExpression,
  MetaProperty: walkMetaProperty,
  Identifier: walkIdentifier,
  PrivateIdentifier: walkPrivateIdentifier,
  Literal: walkLiteral,
  RegExpLiteral: walkRegExpLiteral,
};

walk = (type, node, state) => FUNCTIONS_DICT[type](node, state);

class State {
  constructor() {
    this.output = [];
    this.indent = '  ';
    this.indentLevel = 0;
  }

  write(...codes) {
    for (let i = 0; i < codes.length; i += 1) {
      const code = codes[i];
      if (typeof code === 'string' && code !== '') {
        this.output.push(code);
      } else if (typeof code === 'function') {
        code();
      }
    }
  }

  toString() {
    return this.output.join('');
  }
}

function generate(node, options) {
  const state = new State(options);
  walk(node.type, node, state);
  return state.toString();
}

module.exports = { generate, unparse: generate };
