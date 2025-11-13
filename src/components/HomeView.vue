<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { useCommitTypesStore } from '../stores/commitTypes';
import { useSettingsStore } from '../stores/settings';

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
const scope = ref('');
const contributors = ref('');
const issueId = ref('');

const commitTypes = computed(() => commitTypesStore.allCommitTypes);

const selectedIcon = computed(() => {
  const type = commitTypesStore.getCommitTypeByValue(selectedType.value);
  return type?.icon || '';
});

onMounted(() => {
  selectedType.value = props.enterAction?.payload || 'feat';
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
  if (!selectedType.value) return '';

  const scopeText = scope.value ? `(${scope.value})` : '';
  const emojiPart = settingsStore.useIcon ? `${selectedIcon.value} ` : '';

  let commit = `${emojiPart}${selectedType.value}${scopeText}: ${commitMessage.value}`;

  if (contributors.value && contributors.value.trim()) {
    const formattedContributors = formatContributors(contributors.value);
    commit += ` thanks ${formattedContributors}`;
  }

  if (issueId.value && issueId.value.trim()) {
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
        <a-textarea v-model:value="commitMessage" allowClear placeholder="输入提交信息概述" :rows="3" />
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
</style>