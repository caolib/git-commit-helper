import { ref, computed, watch } from 'vue'
import { getData, setData } from '../utils/store'

// 存储键名
const SETTINGS_KEY = 'git-commit-helper-settings'

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

// 默认设置值
const defaultSettings = {
    useIcon: true,
    autoClassify: true,
    classifyRules: { ...defaultClassifyRules },
    copyAction: 'copy-close-paste', // 'copy-only' | 'copy-close' | 'copy-close-paste'
    theme: 'system',
    isCustomType: false,
    customFileUrl: '',
    isCustomIcon: false,
    customIconUrl: '',
    useCustomTemplate: false,
    customTemplate: '{icon} {type}{scope:(:)}: {message}{contributors: (by :}{issue: in :)}'
}

// 从 dbStorage 加载设置
const loadSettings = () => {
    const saved = getData(SETTINGS_KEY, null)
    if (saved) {
        // 向后兼容：将旧的 isKill 转换为 copyAction
        if (saved.isKill !== undefined && saved.copyAction === undefined) {
            saved.copyAction = saved.isKill ? 'copy-close' : 'copy-only'
            delete saved.isKill
        }
        // 确保 copyAction 有默认值
        if (!saved.copyAction) {
            saved.copyAction = 'copy-close-paste'
        }
        return { ...defaultSettings, ...saved }
    }
    return { ...defaultSettings }
}

// 全局状态
const settings = ref(loadSettings())

// 监听变化并持久化 - 使用 JSON 序列化确保数据可克隆
watch(
    settings,
    (newValue) => {
        // 深拷贝以确保可序列化
        const serializableValue = JSON.parse(JSON.stringify(newValue))
        setData(SETTINGS_KEY, serializableValue)
    },
    { deep: true }
)

/**
 * settings store - 使用 Composition API 和 uTools dbStorage
 */
export function useSettingsStore() {
    // Computed getters for individual settings
    const useIcon = computed({
        get: () => settings.value.useIcon,
        set: (val) => { settings.value.useIcon = val }
    })

    const autoClassify = computed({
        get: () => settings.value.autoClassify,
        set: (val) => { settings.value.autoClassify = val }
    })

    const classifyRules = computed({
        get: () => settings.value.classifyRules,
        set: (val) => { settings.value.classifyRules = val }
    })

    const copyAction = computed({
        get: () => settings.value.copyAction,
        set: (val) => { settings.value.copyAction = val }
    })

    const theme = computed({
        get: () => settings.value.theme,
        set: (val) => { settings.value.theme = val }
    })

    const isCustomType = computed({
        get: () => settings.value.isCustomType,
        set: (val) => { settings.value.isCustomType = val }
    })

    const customFileUrl = computed({
        get: () => settings.value.customFileUrl,
        set: (val) => { settings.value.customFileUrl = val }
    })

    const isCustomIcon = computed({
        get: () => settings.value.isCustomIcon,
        set: (val) => { settings.value.isCustomIcon = val }
    })

    const customIconUrl = computed({
        get: () => settings.value.customIconUrl,
        set: (val) => { settings.value.customIconUrl = val }
    })

    const useCustomTemplate = computed({
        get: () => settings.value.useCustomTemplate,
        set: (val) => { settings.value.useCustomTemplate = val }
    })

    const customTemplate = computed({
        get: () => settings.value.customTemplate,
        set: (val) => { settings.value.customTemplate = val }
    })

    // Actions
    const setUseIcon = (value) => {
        settings.value.useIcon = value
    }

    const setAutoClassify = (value) => {
        settings.value.autoClassify = value
    }

    const setClassifyRules = (rules) => {
        settings.value.classifyRules = rules
    }

    const resetClassifyRules = () => {
        settings.value.classifyRules = { ...defaultClassifyRules }
    }

    const setCopyAction = (value) => {
        settings.value.copyAction = value
    }

    const setTheme = (theme) => {
        settings.value.theme = theme
    }

    const setCustomType = (isCustom, url) => {
        settings.value.isCustomType = isCustom
        settings.value.customFileUrl = url
    }

    const setCustomIcon = (isCustom, url) => {
        settings.value.isCustomIcon = isCustom
        settings.value.customIconUrl = url
    }

    const setUseCustomTemplate = (value) => {
        settings.value.useCustomTemplate = value
    }

    const setCustomTemplate = (template) => {
        settings.value.customTemplate = template
    }

    const resetToDefault = () => {
        settings.value = { ...defaultSettings }
    }

    return {
        // Computed properties
        useIcon,
        autoClassify,
        classifyRules,
        copyAction,
        theme,
        isCustomType,
        customFileUrl,
        isCustomIcon,
        customIconUrl,
        useCustomTemplate,
        customTemplate,

        // Actions
        setUseIcon,
        setAutoClassify,
        setClassifyRules,
        resetClassifyRules,
        setCopyAction,
        setTheme,
        setCustomType,
        setCustomIcon,
        setUseCustomTemplate,
        setCustomTemplate,
        resetToDefault
    }
}
