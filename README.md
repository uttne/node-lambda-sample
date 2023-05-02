# 通常の Lambda & API Gateway のデプロイまでの流れ

## 初期化

```bash
yarn init -y

# or
# npm init -y

```

## Typescript 準備

```bash
yarn add typescript --dev

# or
# npm install typescript --save-dev

```

tsconfig.json を作成

```json
{
    "compilerOptions": {
        "target": "es2022",
        "module": "commonjs",
        "strict": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true,
        "outDir": "dist"
    },
    "include": ["src"],
    "exclude": ["node_modules", "**/*.spec.ts"]
}
```

## aws の使用準備

```bash
yarn add aws-lambda aws-sdk
yarn add --dev @types/aws-lambda @types/aws-sdk
```

## コードの作成

`src\index.ts` を作成

```typescript
import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "Hello from Lambda!",
        }),
    };
};
```

## ビルド

`paskage.json` にスクリプトを追加

```json
{
    "scripts": {
        "build": "tsc"
    }
}
```

```bash
yarn build
```

## aws-sam を使う準備

`sam init` を使用すると簡単に準備ができるが、既存のレポジトリに追加する方法を書く。

`template.yaml` を作成する。

```yaml
AWSTemplateFormatVersion: "2010-09-09"
Transform: AWS::Serverless-2016-10-31
Description: Sample Application

Resources:
    MyLambdaFunction:
        Type: AWS::Serverless::Function
        Properties:
            CodeUri: dist/
            Handler: index.handler
            Runtime: nodejs18.x
            Events:
                ApiEvent:
                    Type: Api
                    Properties:
                        Path: /api
                        Method: get
```

`package.json` にスクリプトを追加する。

```json
{
    "scripts": {
        "package": "sam package --output-template-file packaged.yaml --s3-bucket node-lambda-sample-uttne",
        "deploy": "sam deploy --template-file packaged.yaml --stack-name node-lambda-sample-stack --capabilities CAPABILITY_IAM"
    }
}
```

S3 のバケットを作成する。

```bash
aws s3 mb s3://node-lambda-sample-uttne --region ap-northeast-1
```

デプロイする

```bash
yarn package
yarn deploy
```

## ローカルでテストする

```bash
sam local start-api
```

```bash
curl http://127.0.0.1:3000/api
```

## 削除する

以下のスクリプトを追加する

```json
    "scripts": {
        "delete": "sam delete --stack-name node-lambda-sample-stack --region ap-northeast-1"
    }
```

# AWS Lambda で better-sqlite3 を使う

現在の nodejs 18 ランタイムで better-sqlite3 を使おうとすると以下のようなエラーが発生するので、 Lambda 用にビルドをする必要がある。

```
/lib64/libm.so.6: version `GLIBC_2.29' not found
```

## ビルド

```bash
yarn build
```
