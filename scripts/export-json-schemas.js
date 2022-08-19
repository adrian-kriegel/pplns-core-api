
const {
  writeFileSync,
  existsSync,
  mkdirSync,
  rmSync,
} = require('fs');

const { Type } = require('@sinclair/typebox');

const path = require('path');

const schemas = require('../schemas/schemas.js');

const target = 'schemas/json/';

/**
 * @param str string
 * @returns hyphenated string
 */
function camelCaseToHyphenated(str)
{
  let result = '';

  for (const c of str)
  {
    const l = c.toLowerCase();

    if (c != l)
    {
      result += '-' + l;
    }
    else 
    {
      result += c;
    }
  }

  return result;
}

if (existsSync(target))
{
  rmSync(target, { recursive: true });
}

mkdirSync(target);

const illegalKeys = [
  'Date',
  'ObjectId',
];

/**
 * Cleans invalid properties from the schema.
 * @param {*} schema schema
 * @returns scheam
 */
function cleanSchema(schema)
{
  for (const key of illegalKeys)
  {
    delete schema[key];
  }

  for (const [key, value] of Object.entries(schema))
  {
    if (typeof(value) === 'object')
    {
      schema[key] = cleanSchema(value);
    }
  }

  return schema;
}

const rootSchema = {
  type: 'object',
  properties: {},
};

Promise.all(Object.entries(schemas).map(
  async ([name, type]) =>
  {
    const fileName = camelCaseToHyphenated(name) + '.json';
    const $id = `@ppln/schemas/${fileName}`;

    const schema = {
      $id,
      ...Type.Strict(cleanSchema(type)),
    };

    rootSchema.properties[$id] = schema;

    writeFileSync(
      path.join(target, fileName),
      JSON.stringify(
        schema,
        null,
        2,
      ),
    );
  },
));

writeFileSync(
  path.join(target, 'root-schema.json'),
  JSON.stringify(
    rootSchema,
    null,
    2,
  ),
);
