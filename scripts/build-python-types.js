

const { writeFileSync, existsSync, rmSync, mkdirSync } = require('fs');
const path = require('path');

const schemas = require('../schemas/schemas.js');
const typebox2python = require('typebox2python').default;

const lines = typebox2python(schemas);

const targetDir = 'python-types/';

if (existsSync(targetDir))
{
  rmSync(targetDir, { recursive: true });
}

mkdirSync(targetDir);

writeFileSync(
  path.join(targetDir, 'ppln_types.py'),
  '# Do not edit manually!\n' +
  '# This file has been automatically generated.\n' +
  '# Run yarn build-schemas && yarn build-python-types to regenerate.\n\n' +
  lines.join('\n\n'),
);
