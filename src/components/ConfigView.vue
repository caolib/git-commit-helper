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
const ruleForm = ref({
    startsWith: [],
    contains: [],
    endsWith: []
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

// 重置为默认配置
const resetConfig = () => {
    settingsStore.resetToDefault();
    message.success("如你所愿");
}

const logs = () => {
    console.log('isKill', isKill.value);
    console.log('useIcon', useIcon.value);
    console.log('autoClassify', autoClassify.value);
}

// 保存配置文件（Pinia 自动持久化，这里只显示提示）
const saveData = () => {
    message.success("保存好了");
    logs();
}

// 打开分类规则管理
const openRulesManager = () => {
    showRulesManager.value = true;
}

// 编辑分类规则
const editRule = (type) => {
    editingRuleType.value = type;
    const rules = settingsStore.classifyRules[type];
    ruleForm.value = {
        startsWith: [...(rules.startsWith || [])],
        contains: [...(rules.contains || [])],
        endsWith: [...(rules.endsWith || [])]
    };
    showEditRule.value = true;
}

// 保存分类规则
const saveRule = () => {
    if (editingRuleType.value) {
        const newRules = { ...settingsStore.classifyRules };
        newRules[editingRuleType.value] = {
            startsWith: ruleForm.value.startsWith.filter(k => k.trim()),
            contains: ruleForm.value.contains.filter(k => k.trim()),
            endsWith: ruleForm.value.endsWith.filter(k => k.trim())
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
            <a-typography-text v-if="useIcon">开启图标⭐</a-typography-text>
            <a-typography-text class="forbidden-item" v-else>不使用图标</a-typography-text>
        </div>
        <div class="config-row">
            <a-switch v-model:checked="autoClassify" />
            <a-typography-text v-if="autoClassify">开启自动分类🤖</a-typography-text>
            <a-typography-text class="forbidden-item" v-else>手动选择提交类型</a-typography-text>
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
        <div class="config-row">
            <a-button type="primary" @click="saveData">保存</a-button>
            <a-popconfirm title="确定吗？" ok-text="Yes" cancel-text="我再想想" @confirm="resetConfig">
                <a-button type="dashed" danger>重置</a-button>
            </a-popconfirm>
        </div>
    </div>

    <!-- 分类规则管理弹窗 -->
    <a-modal v-model:open="showRulesManager" title="自动分类规则管理" width="70vw" @ok="showRulesManager = false">
        <a-tabs>
            <a-tab-pane v-for="(rules, type) in settingsStore.classifyRules" :key="type" :tab="type">
                <div style="margin-bottom: 15px;">
                    <a-button type="primary" size="small" @click="editRule(type)">编辑规则</a-button>
                    <a-button type="default" size="small" style="margin-left: 10px;"
                        @click="resetRule(type)">重置此类型</a-button>
                </div>
                <a-descriptions bordered :column="1" size="small">
                    <a-descriptions-item label="以...开头">
                        <a-tag v-for="keyword in rules.startsWith" :key="keyword" color="blue">{{ keyword }}</a-tag>
                        <span v-if="!rules.startsWith || rules.startsWith.length === 0" style="color: #999;">无</span>
                    </a-descriptions-item>
                    <a-descriptions-item label="包含...">
                        <a-tag v-for="keyword in rules.contains" :key="keyword" color="green">{{ keyword }}</a-tag>
                        <span v-if="!rules.contains || rules.contains.length === 0" style="color: #999;">无</span>
                    </a-descriptions-item>
                    <a-descriptions-item label="以...结尾">
                        <a-tag v-for="keyword in rules.endsWith" :key="keyword" color="orange">{{ keyword }}</a-tag>
                        <span v-if="!rules.endsWith || rules.endsWith.length === 0" style="color: #999;">无</span>
                    </a-descriptions-item>
                </a-descriptions>
            </a-tab-pane>
        </a-tabs>
    </a-modal>

    <!-- 编辑规则弹窗 -->
    <a-modal v-model:open="showEditRule" :title="`编辑 ${editingRuleType} 的分类规则`" width="500px" @ok="saveRule"
        @cancel="showEditRule = false; editingRuleType = ''">>
        <a-form layout="vertical">
            <a-form-item label="以...开头（多个关键词用逗号分隔）">
                <a-input v-model:value="ruleForm.startsWith" placeholder="例如：修复,fix,修正"
                    @change="ruleForm.startsWith = $event.target.value.split(',').map(k => k.trim())" />
                <div style="margin-top: 5px;">
                    <a-tag v-for="keyword in ruleForm.startsWith.filter(k => k)" :key="keyword" closable
                        @close="ruleForm.startsWith = ruleForm.startsWith.filter(k => k !== keyword)">{{ keyword
                        }}</a-tag>
                </div>
            </a-form-item>
            <a-form-item label="包含...（多个关键词用逗号分隔）">
                <a-input v-model:value="ruleForm.contains" placeholder="例如：bug,错误,问题"
                    @change="ruleForm.contains = $event.target.value.split(',').map(k => k.trim())" />
                <div style="margin-top: 5px;">
                    <a-tag v-for="keyword in ruleForm.contains.filter(k => k)" :key="keyword" closable
                        @close="ruleForm.contains = ruleForm.contains.filter(k => k !== keyword)">{{ keyword }}</a-tag>
                </div>
            </a-form-item>
            <a-form-item label="以...结尾（多个关键词用逗号分隔）">
                <a-input v-model:value="ruleForm.endsWith" placeholder="留空表示不使用"
                    @change="ruleForm.endsWith = $event.target.value.split(',').map(k => k.trim())" />
                <div style="margin-top: 5px;">
                    <a-tag v-for="keyword in ruleForm.endsWith.filter(k => k)" :key="keyword" closable
                        @close="ruleForm.endsWith = ruleForm.endsWith.filter(k => k !== keyword)">{{ keyword }}</a-tag>
                </div>
            </a-form-item>
        </a-form>
    </a-modal>

    <!-- 提交类型管理弹窗 -->
    <a-modal v-model:open="showTypeManager" title="提交类型管理" width="80vw">
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
    margin: 10px;
    gap: 10px;
}

.forbidden-item {
    color: gray;
}
</style>