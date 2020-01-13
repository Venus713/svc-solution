#!/usr/bin/sh
DIRECTORY=$1

cd "$DIRECTORY" || exit
/home/sharique/n/bin/npm publish || exit
