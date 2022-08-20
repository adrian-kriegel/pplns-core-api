#!/bin/sh

node ./scripts/build-python-types.js

echo "" >> python-types/pplns_types.py
echo "version = '$(scripts/get-version.sh)'" >> python-types/pplns_types.py
