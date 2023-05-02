#!/bin/bash

cd /work
if [ -d ./node_modules ]; then
    rm -rf node_modules
fi

if [ -f ./package-lock.json ]; then
    rm -f package-lock.json
fi

npm install
# シンボリックリンクがあると package が失敗するので削除
# ライブラリとして参照するので実行ファイルはいらない
rm -rf node_modules/.bin