<script setup>
import { computed, ref } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { useSettingsStore } from '../stores/settings'
import { useCommitTypesStore } from '../stores/commitTypes'

const settingsStore = useSettingsStore();
const commitTypesStore = useCommitTypesStore();

const showRulesManager = ref(false);
const showEditRule = ref(false);
const editingRuleType = ref('');
const selectedRuleType = ref(''); // 用于下拉选择的类型
const ruleForm = ref({
    startsWith: [],
    contains: [],
    endsWith: []
});

// 临时输入框的值
const tempInputs = ref({
    startsWith: '',
    contains: '',
    endsWith: ''
});

// 提交类型管理相关状态
const showTypeManager = ref(false);
const showTypeForm = ref(false);
const editingType = ref(null);
const typeForm = ref({
    value: '',
    label: '',
    icon: ''
});

const commitTypes = computed(() => commitTypesStore.allCommitTypes);

// 下拉列表选项（带图标和标签），用于规则管理的选择器
const selectOptions = computed(() => {
    return commitTypes.value.map(t => ({
        value: t.value,
        label: t.label || t.value,
        icon: t.icon || ''
    }));
});

// 动态生成包含所有提交类型的分类规则（包括新添加的类型）
const allClassifyRules = computed(() => {
    const rules = { ...settingsStore.classifyRules };

    // 为每个提交类型确保有对应的规则配置
    commitTypes.value.forEach(type => {
        if (!rules[type.value]) {
            rules[type.value] = {
                startsWith: [],
                contains: [],
                endsWith: []
            };
        }
    });

    return rules;
});

// 计算属性绑定到 Pinia store
const isKill = computed({
    get: () => settingsStore.isKill,
    set: (val) => settingsStore.setIsKill(val)
});

const useIcon = computed({
    get: () => settingsStore.useIcon,
    set: (val) => settingsStore.setUseIcon(val)
});

const autoClassify = computed({
    get: () => settingsStore.autoClassify,
    set: (val) => settingsStore.setAutoClassify(val)
});

const theme = computed({
    get: () => settingsStore.theme,
    set: (val) => settingsStore.setTheme(val)
});

// 主题选项
const themeOptions = [
    { label: '跟随系统', value: 'system' },
    { label: '浅色主题', value: 'light' },
    { label: '深色主题', value: 'dark' }
];

// 重置为默认配置
const resetConfig = () => {
    settingsStore.resetToDefault();
}

// 保存配置文件（Pinia 自动持久化，这里只显示提示）
const saveData = () => {
    message.success("保存好了");
}

// 打开分类规则管理
const openRulesManager = () => {
    // 默认选择第一个可用选项（使用带图标的 selectOptions）
    const types = selectOptions.value.map(o => o.value);
    if (types.length > 0) {
        selectedRuleType.value = types[0];
    }
    showRulesManager.value = true;
}

// 当前选中类型的规则
const currentRules = computed(() => {
    return allClassifyRules.value[selectedRuleType.value] || { startsWith: [], contains: [], endsWith: [] };
});

// 编辑分类规则
const editRule = (type) => {
    editingRuleType.value = type;
    const rules = allClassifyRules.value[type] || { startsWith: [], contains: [], endsWith: [] };

    // 确保数组类型正确
    ruleForm.value = {
        startsWith: Array.isArray(rules.startsWith) ? [...rules.startsWith] : [],
        contains: Array.isArray(rules.contains) ? [...rules.contains] : [],
        endsWith: Array.isArray(rules.endsWith) ? [...rules.endsWith] : []
    };

    // 重置临时输入框为空字符串
    tempInputs.value = {
        startsWith: '',
        contains: '',
        endsWith: ''
    };

    showEditRule.value = true;
}

// 处理回车键添加关键词
const handleKeywordAdd = (field, event) => {
    // 确保 tempInputs[field] 是字符串
    const inputValue = String(tempInputs.value[field] || '').trim();

    if (inputValue && Array.isArray(ruleForm.value[field])) {
        // 避免重复添加
        if (!ruleForm.value[field].includes(inputValue)) {
            ruleForm.value[field].push(inputValue);
        }
        // 清空输入框
        tempInputs.value[field] = '';
    }
}

// 删除关键词
const removeKeyword = (field, keyword) => {
    if (Array.isArray(ruleForm.value[field])) {
        ruleForm.value[field] = ruleForm.value[field].filter(k => k !== keyword);
    }
};

// 保存分类规则
const saveRule = () => {
    if (editingRuleType.value) {
        const newRules = { ...settingsStore.classifyRules };

        // 确保保存的是过滤后的数组
        newRules[editingRuleType.value] = {
            startsWith: Array.isArray(ruleForm.value.startsWith)
                ? ruleForm.value.startsWith.filter(k => k && k.trim())
                : [],
            contains: Array.isArray(ruleForm.value.contains)
                ? ruleForm.value.contains.filter(k => k && k.trim())
                : [],
            endsWith: Array.isArray(ruleForm.value.endsWith)
                ? ruleForm.value.endsWith.filter(k => k && k.trim())
                : []
        };

        settingsStore.setClassifyRules(newRules);
        message.success('规则已更新');
        showEditRule.value = false;
        editingRuleType.value = '';
    }
}

// 重置单个类型的规则
const resetRule = (type) => {
    settingsStore.resetClassifyRules();
    message.success('已重置为默认规则');
    // 刷新选中的类型以显示重置后的数据
    if (selectedRuleType.value) {
        const temp = selectedRuleType.value;
        selectedRuleType.value = '';
        setTimeout(() => {
            selectedRuleType.value = temp;
        }, 0);
    }
}

// 提交类型管理方法
const openTypeManager = () => {
    showTypeManager.value = true;
};

const addNewType = () => {
    editingType.value = null;
    typeForm.value = { value: '', label: '', icon: '' };
    showTypeForm.value = true;
};

const editType = (type) => {
    editingType.value = { ...type };
    typeForm.value = { ...type };
    showTypeForm.value = true;
};

const deleteType = (type) => {
    Modal.confirm({
        title: '确认删除',
        content: `确定要删除提交类型 "${type.label || type.value}" 吗？`,
        okText: '确定',
        cancelText: '取消',
        onOk() {
            const result = commitTypesStore.deleteCommitType(type.value);
            if (result.success) {
                message.success(result.message);
            } else {
                message.error(result.message);
            }
        }
    });
};

const saveType = () => {
    if (!typeForm.value.value || !typeForm.value.value.trim()) {
        message.error('类型值不能为空');
        return;
    }

    let result;
    if (editingType.value) {
        result = commitTypesStore.updateCommitType(
            editingType.value.value,
            typeForm.value.value,
            typeForm.value.label,
            typeForm.value.icon
        );
    } else {
        result = commitTypesStore.addCommitType(
            typeForm.value.value,
            typeForm.value.label,
            typeForm.value.icon
        );
    }

    if (result.success) {
        message.success(result.message);
        showTypeForm.value = false;
        editingType.value = null;
    } else {
        message.error(result.message);
    }
};

const resetTypesToDefault = () => {
    Modal.confirm({
        title: '确认重置',
        content: '确定要重置为默认提交类型吗？这将删除所有自定义类型。',
        okText: '确定',
        cancelText: '取消',
        onOk() {
            commitTypesStore.resetToDefault();
            message.success('已重置为默认提交类型');
        }
    });
};

// 导出配置
const exportConfig = () => {
    try {
        // 收集所有配置数据
        const configData = {
            version: '1.0.0',
            exportTime: new Date().toISOString(),
            settings: {
                useIcon: settingsStore.useIcon,
                autoClassify: settingsStore.autoClassify,
                isKill: settingsStore.isKill,
                theme: settingsStore.theme,
                classifyRules: settingsStore.classifyRules
            },
            commitTypes: commitTypesStore.commitTypes
        };

        const result = window.services.exportConfig(configData, 'git-commit-helper-config.json');

        if (result.success) {
            message.success(`配置已导出到: ${result.path}`);
        } else {
            if (result.message !== '用户取消保存') {
                message.error(`导出失败: ${result.message}`);
            }
        }
    } catch (error) {
        message.error(`导出配置失败: ${error.message}`);
    }
};

// 导入配置
const importConfig = () => {
    Modal.confirm({
        title: '确认导入',
        content: '导入配置将覆盖当前所有设置，是否继续？',
        okText: '确定',
        cancelText: '取消',
        onOk() {
            try {
                const result = window.services.importConfig();

                if (result.success) {
                    const config = result.data;

                    // 验证配置数据结构
                    if (!config.settings || !config.commitTypes) {
                        message.error('配置文件格式不正确');
                        return;
                    }

                    // 应用设置
                    if (config.settings.useIcon !== undefined) {
                        settingsStore.setUseIcon(config.settings.useIcon);
                    }
                    if (config.settings.autoClassify !== undefined) {
                        settingsStore.setAutoClassify(config.settings.autoClassify);
                    }
                    if (config.settings.isKill !== undefined) {
                        settingsStore.setIsKill(config.settings.isKill);
                    }
                    if (config.settings.theme !== undefined) {
                        settingsStore.setTheme(config.settings.theme);
                    }
                    if (config.settings.classifyRules) {
                        settingsStore.setClassifyRules(config.settings.classifyRules);
                    }

                    // 应用提交类型（完全替换）
                    if (Array.isArray(config.commitTypes) && config.commitTypes.length > 0) {
                        // 直接替换整个 commitTypes 数组，而不是逐个添加
                        commitTypesStore.$patch({
                            commitTypes: config.commitTypes
                        });
                    }

                    message.success(`配置已从 ${result.path} 导入成功`);
                } else {
                    if (result.message !== '用户取消选择') {
                        message.error(`导入失败: ${result.message}`);
                    }
                }
            } catch (error) {
                message.error(`导入配置失败: ${error.message}`);
            }
        }
    });
};

</script>

<template>
    <div class="config-view">
        <div class="config-row">
            <a-switch v-model:checked="isKill" />
            <a-typography-text v-if="isKill">复制后立即退出插件</a-typography-text>
            <a-typography-text class="forbidden-item" v-else>复制后不主动退出插件</a-typography-text>
        </div>
        <div class="config-row">
            <a-switch v-model:checked="useIcon" />
            <a-typography-text v-if="useIcon">开启图标🌟</a-typography-text>
            <a-typography-text class="forbidden-item" v-else>不使用图标</a-typography-text>
        </div>
        <div class="config-row">
            <a-switch v-model:checked="autoClassify" />
            <a-tooltip title="开启后会根据提交信息中的关键字自动选择提交类型">
                <a-typography-text v-if="autoClassify">根据规则分类</a-typography-text>
                <a-typography-text class="forbidden-item" v-else>手动选择类型</a-typography-text>
                <span style="margin-left:8px;color:#888;cursor:help">?</span>
            </a-tooltip>
        </div>
        <div class="config-row">
            <a-typography-text style="margin-right: 10px;">主题:</a-typography-text>
            <a-radio-group v-model:value="theme" button-style="solid">
                <a-radio-button v-for="option in themeOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                </a-radio-button>
            </a-radio-group>
        </div>
        <div class="config-row">
            <a-button type="default" @click="openRulesManager">
                🔧 管理自动分类规则
            </a-button>
        </div>
        <div class="config-row">
            <a-button type="default" @click="openTypeManager">
                📝 管理提交类型
            </a-button>
        </div>
        <div class="config-row" style="gap: 10px;">
            <a-button type="default" @click="exportConfig">
                📤 导出配置
            </a-button>
            <a-button type="default" @click="importConfig">
                📥 导入配置
            </a-button>
        </div>
        <div class="config-row">
            <a-button type="primary" @click="saveData">保存</a-button>
            <a-popconfirm title="确定吗？" ok-text="Yes" cancel-text="我再想想" @confirm="resetConfig">
                <a-button danger>重置</a-button>
            </a-popconfirm>
        </div>
    </div>

    <!-- 分类规则管理弹窗 -->
    <a-modal v-model:open="showRulesManager" title="自动分类规则管理" width="70vw" @ok="showRulesManager = false">
        <div style="margin-bottom: 15px; display:flex; align-items:center; gap:10px;">
            <a-select v-model:value="selectedRuleType" style="width: 300px;" placeholder="选择提交类型">
                <a-select-option v-for="option in selectOptions" :key="option.value" :value="option.value">
                    <span v-if="option.icon" style="margin-right:8px">{{ option.icon }}</span>
                    <span>{{ option.value }} {{ option.label }}</span>
                </a-select-option>
            </a-select>
            <a-button type="primary" size="small" @click="editRule(selectedRuleType)" :disabled="!selectedRuleType">
                编辑规则
            </a-button>
            <a-button type="default" size="small" @click="resetRule(selectedRuleType)" :disabled="!selectedRuleType">
                重置此类型
            </a-button>
        </div>

        <a-descriptions v-if="selectedRuleType" bordered :column="1" size="small">
            <a-descriptions-item label="以...开头">
                <a-tag v-for="keyword in currentRules.startsWith" :key="keyword" color="blue">{{ keyword }}</a-tag>
                <span v-if="!currentRules.startsWith || currentRules.startsWith.length === 0"
                    style="color: #999;">无</span>
            </a-descriptions-item>
            <a-descriptions-item label="包含...">
                <a-tag v-for="keyword in currentRules.contains" :key="keyword" color="green">{{ keyword }}</a-tag>
                <span v-if="!currentRules.contains || currentRules.contains.length === 0" style="color: #999;">无</span>
            </a-descriptions-item>
            <a-descriptions-item label="以...结尾">
                <a-tag v-for="keyword in currentRules.endsWith" :key="keyword" color="orange">{{ keyword }}</a-tag>
                <span v-if="!currentRules.endsWith || currentRules.endsWith.length === 0" style="color: #999;">无</span>
            </a-descriptions-item>
        </a-descriptions>
        <div v-else style="text-align: center; padding: 40px; color: #999;">
            请选择一个提交类型
        </div>
    </a-modal>

    <!-- 编辑规则弹窗 -->
    <a-modal v-model:open="showEditRule" :title="`编辑 ${editingRuleType} 的分类规则`" width="500px" @ok="saveRule"
        @cancel="showEditRule = false; editingRuleType = ''">
        <a-form layout="vertical">
            <a-form-item label="以...开头（输入后按回车添加）">
                <a-input v-model:value="tempInputs.startsWith" placeholder="例如：修复"
                    @pressEnter="handleKeywordAdd('startsWith', $event)" />
                <div style="margin-top: 8px;">
                    <a-tag v-for="keyword in ruleForm.startsWith" :key="keyword" closable color="blue"
                        @close="removeKeyword('startsWith', keyword)">
                        {{ keyword }}
                    </a-tag>
                    <span v-if="ruleForm.startsWith.length === 0" style="color: #999; font-size: 12px;">
                        暂无关键词
                    </span>
                </div>
            </a-form-item>
            <a-form-item label="包含...（输入后按回车添加）">
                <a-input v-model:value="tempInputs.contains" placeholder="例如：bug"
                    @pressEnter="handleKeywordAdd('contains', $event)" />
                <div style="margin-top: 8px;">
                    <a-tag v-for="keyword in ruleForm.contains" :key="keyword" closable color="green"
                        @close="removeKeyword('contains', keyword)">
                        {{ keyword }}
                    </a-tag>
                    <span v-if="ruleForm.contains.length === 0" style="color: #999; font-size: 12px;">
                        暂无关键词
                    </span>
                </div>
            </a-form-item>
            <a-form-item label="以...结尾（输入后按回车添加）">
                <a-input v-model:value="tempInputs.endsWith" placeholder="留空表示不使用"
                    @pressEnter="handleKeywordAdd('endsWith', $event)" />
                <div style="margin-top: 8px;">
                    <a-tag v-for="keyword in ruleForm.endsWith" :key="keyword" closable color="orange"
                        @close="removeKeyword('endsWith', keyword)">
                        {{ keyword }}
                    </a-tag>
                    <span v-if="ruleForm.endsWith.length === 0" style="color: #999; font-size: 12px;">
                        暂无关键词
                    </span>
                </div>
            </a-form-item>
        </a-form>
    </a-modal>

    <!-- 提交类型管理弹窗 -->
    <a-modal v-model:open="showTypeManager" title="提交类型管理" width="80vw" @ok="showTypeManager = false">
        <div style="margin-bottom: 15px;">
            <a-button type="primary" @click="addNewType">添加提交类型</a-button>
            <a-button style="margin-left: 10px;" @click="resetTypesToDefault">重置为默认</a-button>
        </div>

        <a-table :dataSource="commitTypes" :columns="[
            { title: '图标', dataIndex: 'icon', key: 'icon', width: 80 },
            { title: '类型值', dataIndex: 'value', key: 'value', width: 100 },
            { title: '说明', dataIndex: 'label', key: 'label' },
            { title: '操作', key: 'action', width: 150 }
        ]" :pagination="false" bordered>
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'action'">
                    <div style="display:flex; gap:8px; align-items:center;">
                        <a-button type="link" size="small" @click="editType(record)">
                            <edit-outlined /> 编辑
                        </a-button>
                        <a-button type="link" danger size="small" @click="deleteType(record)">
                            <delete-outlined /> 删除
                        </a-button>
                    </div>
                </template>
            </template>
        </a-table>
    </a-modal>

    <!-- 添加/编辑提交类型弹窗 -->
    <a-modal v-model:open="showTypeForm" :title="editingType ? '编辑提交类型' : '添加提交类型'" width="400px" @ok="saveType">
        <a-form :model="typeForm" layout="vertical">
            <a-form-item label="类型值" required>
                <a-input v-model:value="typeForm.value" placeholder="例如：feat" />
            </a-form-item>
            <a-form-item label="说明">
                <a-input v-model:value="typeForm.label" placeholder="例如：新功能（可选）" />
            </a-form-item>
            <a-form-item label="图标">
                <a-input v-model:value="typeForm.icon" placeholder="例如：✨（可选）" />
                <div style="margin-top: 5px; font-size: 12px; color: #888;">
                    提示：Windows按 Win+. 可打开表情符号面板
                </div>
            </a-form-item>
        </a-form>
    </a-modal>
</template>

<style scoped>
div.config-view {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    flex-direction: column;
}

div.config-row {
    display: flex;
    align-items: center;
    padding: 10px;
    width: 80vw;
    gap: 10px;
}

.forbidden-item {
    color: gray;
}

.type-icon {
    margin-right: 8px;
}
</style>