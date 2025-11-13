# 迁移完成说明

## 已完成的工作

### 1. ✅ 添加 Vue DevTools
- 安装了 `vite-plugin-vue-devtools@8.0.3`
- 升级了 Vite 从 5.4.21 到 7.2.2
- 在 `vite.config.js` 中配置了 DevTools 插件

### 2. ✅ 迁移到 Pinia 状态管理
- 安装了 `pinia@2.x` 和 `pinia-plugin-persistedstate@4.7.1`
- 创建了两个 Pinia stores:
  - `src/stores/commitTypes.js` - 管理提交类型 CRUD 操作
  - `src/stores/settings.js` - 管理应用设置

### 3. ✅ 删除旧的数据文件
- 删除了 `src/data/commitTypes.json`
- 删除了 `src/data/iconOptions.json`
- 删除了整个 `src/data/` 目录
- 删除了 `src/utils/store.js` (uTools storage wrapper)

### 4. ✅ 重构组件
- **HomeView.vue**: 完全重写
  - 使用 Pinia stores 替代 uTools storage
  - 移除了独立的图标选择器 (图标现在自动绑定到提交类型)
  - 添加了提交类型管理功能 (添加/编辑/删除/重置)
  - 添加了贡献者和问题ID字段
  - 实现了自动分类功能
  
- **ConfigView.vue**: 完全重构
  - 使用 Pinia stores 替代 uTools storage
  - 移除了自定义 JSON 源配置 (不再需要)
  - 简化了配置界面,只保留核心设置

### 5. ✅ 新增功能
- **提交类型 CRUD**: 用户可以添加、编辑、删除自定义提交类型
- **自动分类**: 根据提交信息关键词自动选择提交类型
- **贡献者自动格式化**: 自动添加 @ 符号
- **问题ID自动格式化**: 自动添加 # 符号
- **数据持久化**: 使用 localStorage 自动保存所有设置

## 技术架构变更

### 之前 (Before)
```
数据存储: utools.dbStorage
配置文件: src/data/*.json
状态管理: 组件内 ref + getData/setData
```

### 之后 (After)
```
数据存储: localStorage (via Pinia persist)
配置数据: Pinia stores (内存 + 持久化)
状态管理: Pinia stores with composition API
```

## 数据迁移

### commitTypes Store
默认包含 11 种提交类型:
- feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert

### settings Store
默认设置:
- `useIcon`: true (使用 emoji)
- `autoClassify`: true (启用自动分类)
- `isKill`: true (复制后退出)
- `hideTip`: false (显示提示文本)
- `classifyRules`: 7 种类型的分类规则

## 如何测试

### 1. 启动开发服务器
```bash
pnpm dev
```

### 2. 在 uTools 中测试
- 打开 uTools (Alt+Space)
- 输入触发词: `feat`, `commit`, `fix` 等
- 应该会加载 `http://localhost:5173`

### 3. 测试功能
- [ ] 选择提交类型
- [ ] 输入提交信息 (测试自动分类)
- [ ] 添加范围、贡献者、问题ID
- [ ] 切换图标开关
- [ ] 切换自动分类开关
- [ ] 点击"管理提交类型"按钮
  - [ ] 添加新类型
  - [ ] 编辑现有类型
  - [ ] 删除类型
  - [ ] 重置为默认
- [ ] 复制生成的提交信息
- [ ] 打开配置页面 (输入 `git commit config`)
- [ ] 修改设置并保存
- [ ] 重启插件验证持久化

## 已修复的问题

1. ✅ **uTools cloning error**: 不再使用 utools.dbStorage,使用 localStorage 替代
2. ✅ **编辑按钮无响应**: 重新实现了编辑功能,使用正确的 v-model 绑定
3. ✅ **重置默认错误**: 实现了正确的深拷贝逻辑
4. ✅ **图标选择器多余**: 移除了独立选择器,图标自动绑定到类型

## 注意事项

### 用户数据迁移
如果用户之前使用过旧版本,其 utools.dbStorage 中的数据不会自动迁移。
用户需要:
1. 在新版本中重新配置设置
2. 重新添加自定义提交类型 (如果有)

### 端口配置
如果 5173 端口被占用,Vite 会自动使用下一个可用端口 (如 5174)。
记得在 `public/plugin.json` 的 development.main 中更新端口号。

## 文件清单

### 新增文件
- `src/stores/commitTypes.js` (182 行)
- `src/stores/settings.js` (124 行)
- `MIGRATION_NOTES.md` (本文件)

### 修改文件
- `src/main.js` (添加 Pinia 初始化)
- `src/components/HomeView.vue` (完全重写, 340 行)
- `src/components/ConfigView.vue` (重构, 117 行)
- `vite.config.js` (添加 VueDevTools)
- `package.json` (添加 pinia 相关依赖)

### 删除文件
- `src/data/commitTypes.json`
- `src/data/iconOptions.json`
- `src/utils/store.js`

## 下一步建议

1. **添加分类规则编辑器**: 允许用户自定义自动分类规则
2. **导入/导出配置**: 支持配置备份和恢复
3. **提交历史**: 记录最近使用的提交信息
4. **模板功能**: 保存常用的提交信息模板
5. **多语言支持**: 添加英文界面

## 性能优化

- ✅ 使用 Pinia 替代多次 getData/setData 调用
- ✅ 使用 computed 属性自动更新 UI
- ✅ 使用 persist plugin 自动保存,无需手动调用 setData
- ✅ 移除了不必要的网络请求 (自定义 JSON 源)

---

**迁移完成时间**: 2024
**迁移人员**: GitHub Copilot
**测试状态**: 待测试 ⏳
