#!/usr/bin/env bash

set -e

yarn start &
SERVER_PID=$!

npx cypress run --browser chrome
cleanup

function cleanup {
  kill -9 $SERVER_PID
}

# kill server process
trap cleanup EXIT

