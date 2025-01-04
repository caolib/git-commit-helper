<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import commitTypesData from '@/data/commitTypes.json';
import iconOptionsData from '@/data/iconOptions.json';

const props = defineProps({
  enterAction: {
    type: Object,
    required: true
  }
})

const commitTypes = ref(commitTypesData); // 提交信息类型
const iconOptions = ref(iconOptionsData); // 图标选项

const selectedType = ref('');
const commitMessage = ref('');
const selectedIcon = ref('');
const scope = ref(''); // 新增的范围

onMounted(() => {
  const cmd = props.enterAction.payload;
  if (cmd === 'commit' || cmd === 'c')
    return;
  selectedType.value = cmd;
});


const generatedCommitMessage = computed(() => {
  const scopeText = scope.value ? `(${scope.value})` : '';
  return `${selectedIcon.value} ${selectedType.value}${scopeText}: ${commitMessage.value}`;
});

const generatedGitCommitMessage = computed(() => {
  const scopeText = scope.value ? `(${scope.value})` : '';
  return `git commit -m"${selectedIcon.value} ${selectedType.value}${scopeText}: ${commitMessage.value}"`;
});


watch(selectedType, (newValue) => {
  const selected = commitTypes.value.find(type => type.value === newValue);
  if (selected) {
    selectedIcon.value = selected.icon;
  }
});

const onCopy = () => {
  message.success('复制成功');
  utools.outPlugin();
};



</script>

<template>
  <div class="commit-generator">
    <div style="display: flex; align-items: center; margin-bottom: 10px;">
      <!-- 提交信息类型 -->
      <a-select v-model:value="selectedType" style="width: 500px;margin-right: 10px;" placeholder="选择 commit 类型"
        allow-clear show-search>
        <a-select-option v-for="type in commitTypes" :key="type.value" :value="type.value">
          {{ type.icon }} {{ type.label }}
        </a-select-option>
      </a-select>

      <!-- 图标类型 -->
      <a-select v-model:value="selectedIcon" style="width: auto;" placeholder="选择图标">
        <a-select-option v-for="icon in iconOptions" :key="icon.value" :value="icon.value">
          {{ icon.label }}
        </a-select-option>
      </a-select>
    </div>

    <div style="display: flex; align-items: center; margin-bottom: 10px;">
      <!-- 输入的范围 -->
      <a-input v-model:value="scope" style="width: 570px; margin-bottom: 10px;" placeholder="输入范围（可选）" />
    </div>

    <div style="display: flex; align-items: center; margin-bottom: 10px;">
      <!-- 输入的提交信息 -->
      <a-textarea v-model:value="commitMessage" style="width: 570px; margin-bottom: 10px;" placeholder="输入提交信息概述"
        :rows="3" />
    </div>

    <!-- 提交信息文本 -->
    <div style="margin-bottom: 10px;">
      <a-typography-paragraph class="commit-msg" :copyable="{ text: generatedCommitMessage, onCopy: onCopy }"
        style="font-size: 20px; white-space: pre-wrap;">
        {{ generatedCommitMessage }}
      </a-typography-paragraph>
      <a-typography-paragraph class="commit-msg" :copyable="{ text: generatedGitCommitMessage, onCopy: onCopy }"
        style="font-size: 20px; white-space: pre-wrap;">
        {{ generatedGitCommitMessage }}
      </a-typography-paragraph>
    </div>

  </div>
</template>

<style>
.commit-generator {
  padding: 10px 28px;
}
</style>