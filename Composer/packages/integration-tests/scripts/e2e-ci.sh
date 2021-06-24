#!/usr/bin/env bash

function cleanup {
  kill $SERVER_PID
}

# move up to composer root dir
cd ../..
yarn start >> e2e.log 2>&1 &
SERVER_PID=$!

cd packages/integration-tests
npx cypress run "$@"
EXIT_CODE=$?

# kill server process
trap cleanup EXIT

exit $EXIT_CODE
