import { defineStore } from 'pinia'

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

export const useCommitTypesStore = defineStore('commitTypes', {
    state: () => ({
        commitTypes: [...defaultCommitTypes]
    }),

    getters: {
        // 获取所有提交类型
        allCommitTypes: (state) => state.commitTypes,

        // 获取默认提交类型列表
        defaultCommitTypes: () => defaultCommitTypes,

        // 根据 value 获取提交类型
        getCommitTypeByValue: (state) => (value) => {
            return state.commitTypes.find(type => type.value === value)
        },

        // 检查提交类型是否存在
        hasCommitType: (state) => (value) => {
            return state.commitTypes.some(type => type.value === value)
        }
    },

    actions: {
        // 添加自定义提交类型
        addCommitType(value, label, icon) {
            // 类型值必填
            if (!value || !value.trim()) {
                return { success: false, message: '类型值不能为空' }
            }

            // 检查是否已存在
            if (this.hasCommitType(value)) {
                return { success: false, message: '该提交类型已存在' }
            }

            this.commitTypes.push({
                value: value.trim(),
                label: label || '',
                icon: icon || ''
            })

            return { success: true, message: '添加成功' }
        },

        // 更新提交类型
        updateCommitType(oldValue, newValue, label, icon) {
            // 类型值必填
            if (!newValue || !newValue.trim()) {
                return { success: false, message: '类型值不能为空' }
            }

            const index = this.commitTypes.findIndex(type => type.value === oldValue)
            if (index === -1) {
                return { success: false, message: '提交类型不存在' }
            }

            // 如果修改了类型值，检查新值是否已存在
            if (oldValue !== newValue && this.hasCommitType(newValue)) {
                return { success: false, message: '新的类型值已存在' }
            }

            this.commitTypes[index] = {
                value: newValue.trim(),
                label: label || '',
                icon: icon || ''
            }

            return { success: true, message: '更新成功' }
        },

        // 删除提交类型
        deleteCommitType(value) {
            const index = this.commitTypes.findIndex(type => type.value === value)
            if (index === -1) {
                return { success: false, message: '提交类型不存在' }
            }

            this.commitTypes.splice(index, 1)
            return { success: true, message: '删除成功' }
        },

        // 重置为默认提交类型
        resetToDefault() {
            this.commitTypes = [...defaultCommitTypes]
        }
    },

    persist: {
        key: 'git-commit-helper-types',
        storage: localStorage
    }
})
