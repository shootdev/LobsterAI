#!/bin/bash

# sync_fork_and_check.sh
# 同步 Fork 仓库 (shootdev/LobsterAI) 与上游 (netease-youdao/LobsterAI) 并运行构建检查

echo "=== 开始同步 Fork 仓库 ==="

# 检查是否有 upstream 远程仓库
if ! git remote | grep -q "^upstream$"; then
    echo "⚠️ 未检测到 upstream 远程仓库"
    echo "请先添加: git remote add upstream https://github.com/netease-youdao/LobsterAI.git"
    exit 1
fi

# 1. 预览上游新增内容
echo ""
echo "📊 分析上游新增变更..."
git fetch upstream
NEW_COMMITS=$(git rev-list --count HEAD..upstream/main)
if [ "$NEW_COMMITS" -eq 0 ]; then
    echo "✅ 已是最新，无需同步"
    exit 0
fi
echo "上游新增 $NEW_COMMITS 个 commit："
git log --oneline HEAD..upstream/main
echo ""
echo "变更文件预览："
git diff HEAD...upstream/main --stat | tail -20
echo ""

# 2. 暂存本地未提交修改
if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "📦 暂存本地修改..."
    git stash push -m "local-dev-tweaks: pre-sync stash $(date +%Y%m%d-%H%M)"
    STASHED=1
else
    STASHED=0
fi

# 3. 执行合并
echo "🔄 合并 upstream/main..."
git checkout main
if git merge upstream/main; then
    echo "✅ 合并完成（无冲突）"
else
    echo ""
    echo "⚠️  出现合并冲突，需要手动解决。冲突文件："
    git diff --name-only --diff-filter=U
    echo ""
    echo "📖 常见冲突文件解决策略（参见 SKILL.md 第4节）："
    echo "  • types.ts / electron.d.ts    → 保留双方所有平台类型"
    echo "  • imGatewayManager.ts         → 合并所有平台分支逻辑"
    echo "  • IMSettings.tsx              → 保留 qzhuli 绑定流程 + 上游新平台"
    echo "  • Settings.tsx                → 保留 Q助理 品牌 + 上游功能"
    echo "  • endpoints.ts                → 使用 qzhuli.com URL"
    echo "  • package.json                → start:electron 保留 --no-sandbox"
    echo ""
    echo "解决所有冲突后执行："
    echo "  git add <resolved-files>"
    echo "  git commit"
    if [ "$STASHED" -eq 1 ]; then
        echo "  git stash pop"
    fi
    exit 1
fi

# 4. 恢复本地修改
if [ "$STASHED" -eq 1 ]; then
    echo "📤 恢复本地修改..."
    if git stash pop; then
        echo "✅ 本地修改已恢复"
    else
        echo "⚠️  恢复时出现冲突，请手动解决后执行 git stash drop"
    fi
fi

# 5. 安装依赖（上游可能新增了包）
echo ""
echo "📦 检查并安装依赖..."
npm install --force --no-fund 2>/dev/null || npm install --engine-strict=false --force --no-fund

# 6. 运行构建检查
echo ""
echo "🔨 运行构建检查 (npm run build)..."
if npm run build; then
    echo ""
    echo "✅ 构建成功！"
    echo ""
    echo "下一步: git push origin main"
else
    echo ""
    echo "❌ 构建失败，请检查错误信息"
    echo "常见构建问题："
    echo "  • 文件中出现字面 \\n 字符串 → 手动展开为正确的多行代码"
    echo "  • 方法被放错位置（括号嵌套） → 检查大括号匹配"
    echo "  • 对象重复 key             → 删除重复字段"
    exit 1
fi

echo "=== 全部完成 ==="
