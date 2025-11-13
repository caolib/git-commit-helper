import { ref, computed, watch } from 'vue'
import { getData, setData } from '../utils/store'

// 存储键名
const STORAGE_KEY = 'git-commit-helper-types'

// 默认提交类型
const defaultCommitTypes = [
    { value: 'feat', label: '新功能', icon: '✨' },
    { value: 'fix', label: '修复问题', icon: '🐛' },
    { value: 'docs', label: '文档变更', icon: '📄' },
    { value: 'init', label: '初始化', icon: '🎉' },
    { value: 'style', label: '代码格式优化', icon: '🌈' },
    { value: 'refactor', label: '代码重构', icon: '🦄' },
    { value: 'perf', label: '性能优化', icon: '🚀' },
    { value: 'test', label: '添加或修改测试', icon: '🧪' },
    { value: 'build', label: '依赖相关的内容', icon: '🛠' },
    { value: 'chore', label: '构建过程或辅助工具的变动', icon: '🐳' },
    { value: 'revert', label: '回滚提交', icon: '↩' }
]

// 全局状态
const commitTypes = ref(getData(STORAGE_KEY, [...defaultCommitTypes]))

// 监听变化并持久化 - 使用 JSON 序列化确保数据可克隆
watch(
    commitTypes,
    (newValue) => {
        // 深拷贝以确保可序列化
        const serializableValue = JSON.parse(JSON.stringify(newValue))
        setData(STORAGE_KEY, serializableValue)
    },
    { deep: true }
)

/**
 * commitTypes store - 使用 Composition API 和 uTools dbStorage
 */
export function useCommitTypesStore() {
    // Getters
    const allCommitTypes = computed(() => commitTypes.value)

    const getCommitTypeByValue = (value) => {
        return commitTypes.value.find(type => type.value === value)
    }

    const hasCommitType = (value) => {
        return commitTypes.value.some(type => type.value === value)
    }

    // Actions
    const addCommitType = (value, label, icon) => {
        // 类型值必填
        if (!value || !value.trim()) {
            return { success: false, message: '类型值不能为空' }
        }

        // 检查是否已存在
        if (hasCommitType(value)) {
            return { success: false, message: '该提交类型已存在' }
        }

        commitTypes.value.push({
            value: value.trim(),
            label: label || '',
            icon: icon || ''
        })

        return { success: true, message: '添加成功' }
    }

    const updateCommitType = (oldValue, newValue, label, icon) => {
        // 类型值必填
        if (!newValue || !newValue.trim()) {
            return { success: false, message: '类型值不能为空' }
        }

        const index = commitTypes.value.findIndex(type => type.value === oldValue)
        if (index === -1) {
            return { success: false, message: '提交类型不存在' }
        }

        // 如果修改了类型值，检查新值是否已存在
        if (oldValue !== newValue && hasCommitType(newValue)) {
            return { success: false, message: '新的类型值已存在' }
        }

        commitTypes.value[index] = {
            value: newValue.trim(),
            label: label || '',
            icon: icon || ''
        }

        return { success: true, message: '更新成功' }
    }

    const deleteCommitType = (value) => {
        const index = commitTypes.value.findIndex(type => type.value === value)
        if (index === -1) {
            return { success: false, message: '提交类型不存在' }
        }

        commitTypes.value.splice(index, 1)
        return { success: true, message: '删除成功' }
    }

    const resetToDefault = () => {
        commitTypes.value = [...defaultCommitTypes]
    }

    // 用于支持 $patch 方法（ConfigView 中导入配置使用）
    const $patch = (updates) => {
        if (updates.commitTypes) {
            commitTypes.value = updates.commitTypes
        }
    }

    return {
        // State
        commitTypes,

        // Getters
        allCommitTypes,
        defaultCommitTypes,
        getCommitTypeByValue,
        hasCommitType,

        // Actions
        addCommitType,
        updateCommitType,
        deleteCommitType,
        resetToDefault,
        $patch
    }
}
