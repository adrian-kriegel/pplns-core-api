#!/bin/sh

#
# Builds the schemas package from the parent package source code.
# TODO: automatically adjust dependencies in the schema package based on imports
#

# get the current version of the pplns package
PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g')

# build the typescript files for the server-side schemas
npx tsc ./src/pipeline/schemas.ts \
  --outDir ./schemas/ \
  --declaration

mv schemas/schemas.d.ts schemas/deserialized.d.ts
mv schemas/schemas.js schemas/deserialized.js

# build the typescript files for the client-side schemas
npx tsc \
  --outDir ./schemas/ \
  --declaration \
  --project schemas/tsconfig.serialized.json

# TODO: export the raw schemas as .json files

# go to the schemas package
cd schemas
# set the version to match the ppln package
yarn version --new-version $PACKAGE_VERSION --no-git-tag-version

