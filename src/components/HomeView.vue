<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { SettingFilled, EditOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import { message, Modal } from 'ant-design-vue';
import { useCommitTypesStore } from '../stores/commitTypes';
import { useSettingsStore } from '../stores/settings';

const props = defineProps({
  enterAction: {
    type: Object,
    required: true
  }
});

const commitTypesStore = useCommitTypesStore();
const settingsStore = useSettingsStore();

const selectedType = ref('feat');
const commitMessage = ref('');
const scope = ref('');
const contributors = ref('');
const issueId = ref('');

const showTypeManager = ref(false);
const showTypeForm = ref(false);
const editingType = ref(null);
const typeForm = ref({
  value: '',
  label: '',
  icon: ''
});

const commitTypes = computed(() => commitTypesStore.allCommitTypes);
const useIcon = computed({
  get: () => settingsStore.useIcon,
  set: (val) => settingsStore.setUseIcon(val)
});
const autoClassify = computed({
  get: () => settingsStore.autoClassify,
  set: (val) => settingsStore.setAutoClassify(val)
});

const selectedIcon = computed(() => {
  const type = commitTypesStore.getCommitTypeByValue(selectedType.value);
  return type?.icon || '';
});

onMounted(() => {
  selectedType.value = props.enterAction.payload || 'feat';
});

const autoClassifyCommitType = (description) => {
  if (!settingsStore.autoClassify || !description.trim()) {
    return;
  }

  const lowerDesc = description.toLowerCase().trim();
  const classifyRules = settingsStore.classifyRules;

  for (const [type, rules] of Object.entries(classifyRules)) {
    if (!commitTypesStore.hasCommitType(type)) {
      continue;
    }

    if (rules.startsWith?.length > 0) {
      if (rules.startsWith.some(keyword => lowerDesc.startsWith(keyword.toLowerCase()))) {
        selectedType.value = type;
        return;
      }
    }

    if (rules.endsWith?.length > 0) {
      if (rules.endsWith.some(keyword => lowerDesc.endsWith(keyword.toLowerCase()))) {
        selectedType.value = type;
        return;
      }
    }

    if (rules.contains?.length > 0) {
      if (rules.contains.some(keyword => lowerDesc.includes(keyword.toLowerCase()))) {
        selectedType.value = type;
        return;
      }
    }
  }
};

watch(commitMessage, (newMessage) => {
  autoClassifyCommitType(newMessage);
});

const formatContributors = (contributorsText) => {
  if (!contributorsText.trim()) {
    return '';
  }

  if (contributorsText.includes('@')) {
    return contributorsText.trim();
  }

  const names = contributorsText
    .split(/[\s,&]+/)
    .map(name => name.trim())
    .filter(name => name.length > 0);

  return names.map(name => `@${name}`).join(' & ');
};

const generatedCommitMessage = computed(() => {
  const scopeText = scope.value ? `(${scope.value})` : '';
  const emojiPart = useIcon.value ? `${selectedIcon.value} ` : '';

  let commit = `${emojiPart}${selectedType.value}${scopeText}: ${commitMessage.value}`;

  if (contributors.value.trim()) {
    const formattedContributors = formatContributors(contributors.value);
    commit += ` thanks ${formattedContributors}`;
  }

  if (issueId.value.trim()) {
    const issueText = issueId.value.trim().startsWith('#') ? issueId.value.trim() : `#${issueId.value.trim()}`;
    commit += ` ${issueText}`;
  }

  return commit;
});

const generatedGitCommitMessage = computed(() => {
  return `git commit -m"${generatedCommitMessage.value}"`;
});

const onCopy = () => {
  commitMessage.value = '';
  scope.value = '';
  contributors.value = '';
  issueId.value = '';

  if (settingsStore.isKill) {
    utools.hideMainWindow();
    utools.outPlugin();
    return;
  }
  message.success('复制好了');
};

const copyText = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    onCopy();
  }).catch(() => {
    message.error('复制失败');
  });
};

const handleSetting = () => {
  utools.redirect('git commit config', null);
};

const openTypeManager = () => {
  showTypeManager.value = true;
};

const addNewType = () => {
  editingType.value = null;
  typeForm.value = { value: '', label: '', icon: '' };
  showTypeForm.value = true;
};

const editType = (type) => {
  editingType.value = { ...type }; // 保存原始值的副本
  typeForm.value = { ...type };
  showTypeForm.value = true;
};

const deleteType = (type) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除提交类型 "${type.label}" 吗？`,
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
  // 只验证类型值必填
  if (!typeForm.value.value || !typeForm.value.value.trim()) {
    message.error('类型值不能为空');
    return;
  }

  let result;
  if (editingType.value) {
    // 编辑模式：传入旧值和新值
    result = commitTypesStore.updateCommitType(
      editingType.value.value,  // 旧的类型值
      typeForm.value.value,      // 新的类型值
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

const resetToDefault = () => {
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
  <div style="display: flex; justify-content: center; margin-bottom: 10px;">
    <div class="commit-generator">
      <div class="row1" style="display: flex; gap: 10px;width:80vw;">
        <a-select class="i-selector" v-model:value="selectedType" style="flex:3;" placeholder="选择类型" allow-clear
          show-search>
          <a-select-option v-for="type in commitTypes" :key="type.value" :value="type.value">
            <span v-if="type.icon" class="type-icon">{{ type.icon }}</span>
            <span>{{ type.label || type.value }}</span>
          </a-select-option>
        </a-select>
        <a-input v-model:value="scope" style="flex:2;box-shadow: 0px 4px 4px rgb(0 0 0 / 10%);" placeholder="范围（可选）" />
        <a-input v-model:value="contributors" style="flex:2;box-shadow: 0px 4px 4px rgb(0 0 0 / 10%);"
          placeholder="贡献者（可选）" />
        <a-input v-model:value="issueId" style="flex:1.5;box-shadow: 0px 4px 4px rgb(0 0 0 / 10%);"
          placeholder="问题ID（可选）" />
      </div>
      <div class="row2" style="display: flex;padding: 10px; align-items: center;width: 80vw;">
        <a-textarea v-model:value="commitMessage" allowClear placeholder="输入提交信息概述" :rows="3" />
      </div>

      <div class="row3" style="display: flex;padding: 10px; flex-direction: column;">
        <div style="display: flex; gap: 10px; margin-bottom: 10px; align-items: center;">
          <a-switch v-model:checked="useIcon" checked-children="使用emoji" un-checked-children="不使用" />
          <a-switch v-model:checked="autoClassify" checked-children="自动分类" un-checked-children="手动选择" />
          <a-button type="primary" size="small" @click="openTypeManager">
            <edit-outlined /> 管理提交类型
          </a-button>
        </div>

        <div class="commit-msg clickable" @click="copyText(generatedCommitMessage)">
          {{ generatedCommitMessage }}
        </div>
        <div class="commit-msg clickable" @click="copyText(generatedGitCommitMessage)">
          {{ generatedGitCommitMessage }}
        </div>
      </div>

      <div style="position: fixed; bottom: 10px; right: 10px;">
        <a-button class="config-btn" @click="handleSetting" type="dashed">
          <setting-filled spin style="font-size: 20px;color: gray;" />
        </a-button>
      </div>
    </div>
  </div>

  <a-modal v-model:open="showTypeManager" title="提交类型管理" width="80vw" @ok="showTypeManager = false">
    <div style="margin-bottom: 15px;">
      <a-button type="primary" @click="addNewType">添加提交类型</a-button>
      <a-button style="margin-left: 10px;" @click="resetToDefault">重置为默认</a-button>
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
.commit-generator {
  padding: 10px 28px;
  margin: 10px;
}

div.ant-select {
  margin: 10px;
}

input.ant-input {
  height: 32px;
}

.row1 {
  align-items: center;
}

textarea.ant-input {
  height: 30vh;
  border-radius: 10px;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, .1);
}

.commit-msg {
  font-size: 20px;
  width: fit-content;
  background: white;
  color: #c678dd;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0px 4px 4px rgb(0 0 0 / 10%);
  white-space: pre-wrap;
}

.commit-msg.clickable {
  margin-top: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.commit-msg.clickable:hover {
  text-decoration: underline dashed #c678dd 2px;
  text-underline-offset: 4px;
  box-shadow: 0px 6px 8px rgb(0 0 0 / 15%);
}

.i-selector {
  box-shadow: 0px 4px 4px rgba(0, 0, 0, .1)
}

.type-icon {
  margin-right: 8px;
}

.config-btn {
  background: transparent !important;
  border: 0 !important;
}
</style>