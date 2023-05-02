#!/bin/bash
cd /work
yum install git python3 make gcc gcc-c++ -y
if [ -d ./better-sqlite3 ]; then
    rm -fr ./better-sqlite3
fi
git clone https://github.com/WiseLibs/better-sqlite3.git --depth=1
cd better-sqlite3
npm install
npm test