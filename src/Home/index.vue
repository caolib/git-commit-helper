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
  // message.success('复制成功');
  utools.hideMainWindow();
  utools.outPlugin();
};



</script>

<template>
  <div style="display: flex; justify-content: center; margin-bottom: 10px;">
    <div class="commit-generator">
      <!-- 第一行 -->
      <div class="row1" style="display: flex; gap: 10px;width:80vw;">
        <!-- 提交信息类型 -->
        <a-select v-model:value="selectedType" style="flex:7;" placeholder="选择类型" allow-clear show-search>
          <a-select-option v-for="type in commitTypes" :key="type.value" :value="type.value">
            {{ type.icon }} {{ type.label }}
          </a-select-option>
        </a-select>
        <!-- 输入的范围 -->
        <a-input v-model:value="scope" style="flex:2;box-shadow: 0px 4px 4px rgb(0 0 0 / 10%);" placeholder="范围（可选）" />
        <!-- 图标类型 -->
        <a-select v-model:value="selectedIcon" style="flex:1" placeholder="选择图标">
          <a-select-option v-for="icon in iconOptions" :key="icon.value" :value="icon.value">
            {{ icon.label }}
          </a-select-option>
        </a-select>
      </div>

      <!-- 第二行 -->
      <div class="row2" style="display: flex;padding: 10px; align-items: center;width: 80vw;">
        <!-- 提交信息 -->
        <a-textarea v-model:value="commitMessage" placeholder="输入提交信息概述" :rows="3" />
      </div>

      <!-- 第三行 -->
      <div class="row3" style="display: flex;padding: 10px; flex-direction: column;">
        <!-- 提示文本 -->
        <a-typography-paragraph class="commit-msg" style="color: gray;font-size: 14px;">
          下面分别是生成的提交信息和git提交代码，点击即可复制
        </a-typography-paragraph>
        <!-- 生成的提交信息 -->
        <a-typography-paragraph class="commit-msg" :copyable="{ text: generatedCommitMessage, onCopy: onCopy }">
          {{ generatedCommitMessage }}
        </a-typography-paragraph>
        <!-- 生成commit代码拼接信息 -->
        <a-typography-paragraph class="commit-msg" :copyable="{ text: generatedGitCommitMessage, onCopy: onCopy }">
          {{ generatedGitCommitMessage }}
        </a-typography-paragraph>
      </div>
    </div>
  </div>
</template>

<style>
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

/* 输入的提交信息 */
textarea.ant-input {
  height: 30vh;
  border-radius: 10px;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, .1);

}

/* 可复制文本 */
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

/* 下拉列表 */
.ant-select-selector {
  box-shadow: 0px 4px 4px rgba(0, 0, 0, .1);
}
</style>