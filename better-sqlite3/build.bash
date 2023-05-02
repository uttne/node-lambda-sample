#!/bin/bash

# 作業ディレクトリに移動
cd /work

# ビルドに必要なパッケージをインストール
yum install git python3 make gcc gcc-c++ -y

# ビルド結果があったときはクリアしておく
if [ -d ./better-sqlite3 ]; then
    rm -fr ./better-sqlite3
fi

# better-sqlite3 のソースをダウンロードする
git clone https://github.com/WiseLibs/better-sqlite3.git -b v8.3.0 --depth=1

# ソースのフォルダに移動する
cd better-sqlite3

# ビルドコマンドを実行する
npm install

# テストを実行して動くことを確認する
npm test