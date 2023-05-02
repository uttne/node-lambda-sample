Param([switch]$Rebuild)

$LayerNodeModuleDir = "$($PSScriptRoot)/layers/aws-lambda-layer/nodejs/node_modules"

if($Rebuild -and (Test-Path $LayerNodeModuleDir)){
    Remove-Item -Path $LayerNodeModuleDir -Force -Recurse
}

if(-not (Test-Path $LayerNodeModuleDir)){
    
    # layer 用の node_modules を用意
    docker run --rm -it -v "$($PSScriptRoot)/layers/aws-lambda-layer/nodejs:/work" node:18.16.0 /work/install.bash

    # better-sqlite3 を AWS Lambda で使うためにビルドする
    docker run -it --rm -v "$($PSScriptRoot)/better-sqlite3:/work" --entrypoint "/work/build.bash" public.ecr.aws/lambda/nodejs:18-x86_64

    # ビルドしたファイルで node_modules を上書き
    Copy-Item -Path "$($PSScriptRoot)/better-sqlite3/better-sqlite3/build/Release/better_sqlite3.node" -Destination "$($LayerNodeModuleDir)/better-sqlite3/build/Release/" -Force
}
