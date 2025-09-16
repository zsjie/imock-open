#!/bin/sh

# replace absolute path to relative path
tscpaths -p tsconfig.json -s ./src -o ./dist >> /dev/null

# start service
NODE_ENV=development node -r source-map-support/register ./dist
