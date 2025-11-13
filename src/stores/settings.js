import { defineStore } from 'pinia'

// 默认分类规则
const defaultClassifyRules = {
    fix: {
        startsWith: ['修复', '修正', 'fix'],
        contains: ['bug', '错误', '问题'],
        endsWith: []
    },
    feat: {
        startsWith: ['新增', '添加', 'add', 'feat'],
        contains: ['功能', 'feature'],
        endsWith: []
    },
    docs: {
        startsWith: ['文档', 'doc'],
        contains: ['说明', 'readme'],
        endsWith: []
    },
    style: {
        startsWith: ['格式', 'style'],
        contains: ['样式', '缩进'],
        endsWith: []
    },
    refactor: {
        startsWith: ['重构', 'refactor'],
        contains: ['优化', '改进'],
        endsWith: []
    },
    perf: {
        startsWith: ['性能', 'perf'],
        contains: ['优化', '提升'],
        endsWith: []
    },
    test: {
        startsWith: ['测试', 'test'],
        contains: ['单元测试', '集成测试'],
        endsWith: []
    }
}

export const useSettingsStore = defineStore('settings', {
    state: () => ({
        // 图标设置
        useIcon: true,

        // 自动分类设置
        autoClassify: true,
        classifyRules: { ...defaultClassifyRules },

        // 行为设置
        isKill: true, // 复制后是否退出

        // 远程数据源（保留但不推荐使用）
        isCustomType: false,
        customFileUrl: '',
        isCustomIcon: false,
        customIconUrl: ''
    }),

    actions: {
        // 设置图标使用
        setUseIcon(value) {
            this.useIcon = value
        },

        // 设置自动分类
        setAutoClassify(value) {
            this.autoClassify = value
        },

        // 设置分类规则
        setClassifyRules(rules) {
            this.classifyRules = rules
        },

        // 重置分类规则
        resetClassifyRules() {
            this.classifyRules = { ...defaultClassifyRules }
        },

        // 设置复制后退出
        setIsKill(value) {
            this.isKill = value
        },

        // 设置远程数据源
        setCustomType(isCustom, url) {
            this.isCustomType = isCustom
            this.customFileUrl = url
        },

        setCustomIcon(isCustom, url) {
            this.isCustomIcon = isCustom
            this.customIconUrl = url
        },

        // 重置所有设置为默认值
        resetToDefault() {
            this.useIcon = true
            this.autoClassify = true
            this.classifyRules = { ...defaultClassifyRules }
            this.isKill = true
            this.isCustomType = false
            this.customFileUrl = ''
            this.isCustomIcon = false
            this.customIconUrl = ''
        }
    },

    persist: {
        key: 'git-commit-helper-settings',
        storage: localStorage
    }
})
