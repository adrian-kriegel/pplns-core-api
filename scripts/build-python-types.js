
const {
  writeFileSync,
} = require('fs');

const path = require('path');

const schemas = require('../schemas/schemas.js');

const typebox2python = require('typebox2python').default;

const lines = typebox2python(schemas);

const targetDir = 'python-types/';

writeFileSync(
  path.join(targetDir, 'pplns_types.py'),
  '# Do not edit manually!\n' +
  '# This file has been automatically generated.\n' +
  '# Run yarn build-schemas && yarn build-python-types to regenerate.\n\n' +
  lines.join('\n\n'),
);
