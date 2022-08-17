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

# build the typescript files
npx tsc ./src/pipeline/schemas.ts --outDir ./schemas/ --declaration

# TODO: export the raw schemas as .json files

# go to the schemas package
cd schemas
# set the version to match the ppln package
yarn version --new-version $PACKAGE_VERSION --no-git-tag-version

