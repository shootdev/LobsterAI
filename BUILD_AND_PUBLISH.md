# 一键构建与发布说明

项目根目录提供了 `build_and_publish.py`，用于一键完成 macOS 安装包的构建与发布。

脚本流程：

1. 本地构建指定架构的 DMG
2. 调用发布平台 `/open-api/v1/uploads/policy`
3. 上传 DMG
4. 调用 `/open-api/v1/versions/complete`
5. 可选调用 `/open-api/v1/versions/:versionId/publish-feishu`

发布平台接口参考：

- [ipa_distribution](https://github.com/shootdev/ipa_distribution)

## 支持架构

- `intel`
- `mac`

说明：

- `intel` 会映射到发布平台要求的 `architecture=intel`
- `mac` 会映射到发布平台要求的 `architecture=apple_silicon`

## 对应构建命令

- `--arch intel` 对应 `npm run dist:mac:x64`
- `--arch mac` 对应 `npm run dist:mac:arm64`

## 默认参数

脚本不读取 `.env`，也不依赖系统环境变量。默认参数已经内置在脚本中，命令行传参会覆盖默认值。

内置默认值：

```text
base_url=https://ipa.qzhuli.cn
policy_path=/open-api/v1/uploads/policy
complete_path=/open-api/v1/versions/complete
feishu_path=/open-api/v1/versions/{versionId}/publish-feishu
app_id=a807bf3ac2ab4ea7d52b9c4f6d3112c4
token=fab170ca69f25b60fc308629e648d1f0b90e433496a6e25902c86836227685e9
```

## 执行前准备

### 依赖要求

如果要执行完整的“构建 + 发布”流程，需要先安装：

- `python3`
- `curl`
- `node` 和 `npm`
- macOS 构建环境：`Xcode`、Xcode Command Line Tools

如果只是发布已经构建好的 DMG，并且会使用 `--skip-build`，则最少只需要：

- `python3`
- `curl`

### 项目依赖安装

首次在当前仓库执行脚本前，先安装项目依赖：

```bash
npm install
```

本项目要求的 Node 版本见仓库约束：

```text
Node.js >= 24 < 25
```

可先自检版本：

```bash
node -v
npm -v
python3 --version
curl --version
```

### macOS 构建环境指引

如果当前机器需要本地构建 DMG，建议先确认以下内容：

1. 已安装 Xcode
2. 已安装 Command Line Tools
3. 已完成 Xcode 首次启动和许可确认

常用检查命令：

```bash
xcodebuild -version
xcode-select -p
```

如未安装 Command Line Tools，可执行：

```bash
xcode-select --install
```

### Python 依赖说明

该脚本只使用 Python 标准库，不需要额外执行 `pip install`。

## 使用方式

Apple Silicon：

```bash
python3 build_and_publish.py --arch mac
```

Intel：

```bash
python3 build_and_publish.py --arch intel
```

复用已有 DMG，跳过构建：

```bash
python3 build_and_publish.py --arch mac --skip-build
```

指定版本号和构建号：

```bash
python3 build_and_publish.py --arch mac --version 2026.4.8 --build-number 2026.4.8
```

启用飞书发布：

```bash
python3 build_and_publish.py --arch intel --publish-feishu
```

指定已有 DMG 文件：

```bash
python3 build_and_publish.py --arch mac --artifact "release/Q助理电脑机器人-2026.4.8-arm64.dmg" --skip-build
```

## 参数说明

- `--arch`：必填，只支持 `intel` 或 `mac`
- `--base-url`：发布平台地址
- `--policy-path`：上传凭证接口路径或完整 URL
- `--complete-path`：完成上传接口路径或完整 URL
- `--feishu-path`：飞书发布接口路径或完整 URL，支持 `{versionId}` 或 `%s`
- `--token`：发布平台 Open API Token
- `--app-id`：发布平台上的 macOS 应用 ID
- `--display-name`：提交到发布平台的展示名称
- `--version`：发布版本号；默认读取 `package.json` 的 `version`
- `--build-number`：构建号；默认与 `version` 相同
- `--release-notes`：版本说明
- `--artifact`：指定现有 DMG 文件路径
- `--skip-build`：跳过本地构建，直接发布现有 DMG
- `--publish-feishu`：完成上传后继续调用飞书发布接口；默认不调用

## 双架构发布说明

如果需要让 Intel 和 Apple Silicon 合并到发布平台上的同一个版本记录，两次执行脚本时必须保持：

- `version` 一致
- `buildNumber` 一致

示例：

```bash
python3 build_and_publish.py --arch intel --version 2026.4.8 --build-number 2026.4.8
python3 build_and_publish.py --arch mac --version 2026.4.8 --build-number 2026.4.8
```

## 注意事项

- 脚本依赖 `python3`
- 文件上传依赖系统中的 `curl`
- 如果未传 `--artifact`，脚本会从 `release/` 中自动寻找刚生成的 `.dmg`
- 脚本默认不会调用 `publish-feishu`；如需调用，请显式追加 `--publish-feishu`
