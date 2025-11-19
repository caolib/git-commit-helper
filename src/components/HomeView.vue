<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { useCommitTypesStore } from '../stores/commitTypes';
import { useSettingsStore } from '../stores/settings';
import { parseTemplate, formatContributors, formatIssue, getDefaultTemplate } from '../utils/templateParser';

const props = defineProps({
  enterAction: {
    type: Object,
    default: () => ({})
  }
});

const commitTypesStore = useCommitTypesStore();
const settingsStore = useSettingsStore();

const selectedType = ref('feat');
const commitMessage = ref('');
const commitMessageInput = ref(null);
const scope = ref('');
const contributors = ref('');
const issueId = ref('');

const commitTypes = commitTypesStore.allCommitTypes;

const selectedIcon = computed(() => {
  const type = commitTypesStore.getCommitTypeByValue(selectedType.value);
  return type?.icon || '';
});

// 从 enterAction 中提取并设置类型
const selectTypeFromAction = (action) => {
  if (!action || !action.code) {
    selectedType.value = 'feat';
    return;
  }

  // 动态功能的 code 格式为 "commit-{type}"
  if (action.code.startsWith('commit-')) {
    const typeValue = action.code.replace('commit-', '');
    if (commitTypesStore.hasCommitType(typeValue)) {
      selectedType.value = typeValue;
      return;
    }
  }
  // 静态 commit 功能，使用 payload
  else if (action.code === 'commit' && action.payload) {
    if (commitTypesStore.hasCommitType(action.payload)) {
      selectedType.value = action.payload;
      return;
    }
  }

  // 默认值
  selectedType.value = 'feat';
};

// 监听 enterAction 的变化
watch(
  () => props.enterAction,
  (newAction) => {
    selectTypeFromAction(newAction);
  },
  { immediate: true, deep: true }
);

onMounted(() => {
  selectTypeFromAction(props.enterAction);
  // 自动聚焦到输入框
  if (commitMessageInput.value) {
    commitMessageInput.value.focus();
  }
});

const autoClassifyCommitType = (description) => {
  if (!settingsStore.autoClassify.value || !description.trim()) {
    return;
  }

  const lowerDesc = description.toLowerCase().trim();
  const classifyRules = settingsStore.classifyRules.value;

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

const generatedCommitMessage = computed(() => {
  if (!selectedType.value) return '';

  // 准备模板数据，格式化贡献者和问题ID
  const templateData = {
    icon: settingsStore.useIcon.value ? selectedIcon.value : '',
    type: selectedType.value,
    scope: scope.value ? scope.value.trim() : '',
    message: commitMessage.value,
    contributors: contributors.value ? formatContributors(contributors.value) : '',
    issue: issueId.value ? formatIssue(issueId.value) : ''
  };

  // 只有在用户启用自定义模板且模板非空时才使用自定义模板
  if (settingsStore.useCustomTemplate.value && settingsStore.customTemplate.value && settingsStore.customTemplate.value.trim()) {
    return parseTemplate(settingsStore.customTemplate.value, templateData);
  }

  // 否则始终使用默认模板
  const defaultTemplate = getDefaultTemplate();
  return parseTemplate(defaultTemplate, templateData);
});

const generatedGitCommitMessage = computed(() => {
  return `git commit -m"${generatedCommitMessage.value}"`;
});

const resetInputs = () => {
  commitMessage.value = '';
  scope.value = '';
  contributors.value = '';
  issueId.value = '';
};

const onCopy = () => {
  resetInputs();

  const action = settingsStore.copyAction?.value ?? 'copy-close-paste';

  if (action === 'copy-only') {
    // 仅复制，不关闭
    message.success('复制好了');
  } else if (action === 'copy-close') {
    // 复制并关闭
    utools.hideMainWindow();
    utools.outPlugin();
  }
  // copy-close-paste 模式不需要在这里处理，因为已经在 copyText 中处理了
};

const copyText = (text) => {
  const action = settingsStore.copyAction?.value ?? 'copy-close-paste';

  if (action === 'copy-close-paste') {
    // 检查是否为分离窗口
    if (window.utools.getWindowType() === 'detach') {
      // 分离窗口下仅复制并提示
      navigator.clipboard.writeText(text);
      message.warning('分离窗口模式下无法自动粘贴，已复制到剪贴板', 3);
      resetInputs();
      return;
    }

    // 主窗口模式：复制、关闭并粘贴
    resetInputs();
    setTimeout(() => window.utools.hideMainWindowPasteText(text), 100);
  } else {
    // 其他模式：普通复制
    navigator.clipboard.writeText(text).then(() => {
      onCopy();
    }).catch(() => {
      message.error('复制失败');
    });
  }
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
            <span>{{ type.value }} {{ type.label }}</span>
          </a-select-option>
        </a-select>
        <a-input v-model:value="scope" style="flex:2;box-shadow: 0px 4px 4px rgb(0 0 0 / 10%);" placeholder="范围（可选）" />
        <a-input v-model:value="contributors" style="flex:2;box-shadow: 0px 4px 4px rgb(0 0 0 / 10%);"
          placeholder="贡献者（可选）" />
        <a-input v-model:value="issueId" style="flex:1.5;box-shadow: 0px 4px 4px rgb(0 0 0 / 10%);"
          placeholder="问题ID（可选）" />
      </div>
      <div class="row2" style="display: flex;padding: 10px; align-items: center;width: 80vw;">
        <a-textarea ref="commitMessageInput" v-model:value="commitMessage" allowClear placeholder="输入提交信息概述"
          :rows="3" />
      </div>

      <div class="row3" style="display: flex;padding: 10px; flex-direction: column;">
        <div class="commit-msg clickable" @click="copyText(generatedCommitMessage)">
          {{ generatedCommitMessage }}
        </div>
        <div class="commit-msg clickable" @click="copyText(generatedGitCommitMessage)">
          {{ generatedGitCommitMessage }}
        </div>
      </div>
    </div>
  </div>
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
</style>