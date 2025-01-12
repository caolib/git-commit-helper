<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import commitTypesData from '../data/commitTypes.json';
import iconOptionsData from '../data/iconOptions.json';
import { SettingFilled } from '@ant-design/icons-vue';
import { getData } from '../utils/store';
import { message } from 'ant-design-vue';

const props = defineProps({
  enterAction: {
    type: Object,
    required: true
  }
});

console.log('payload:', props.enterAction.payload);

const useIcon = ref(getData('useIcon')); // 是否使用图标
console.log('useIcon:', useIcon.value)

const commitTypes = ref(commitTypesData); // 本地提交信息类型数据
const iconOptions = ref(iconOptionsData); // 本地图标数据

const selectedType = ref('');   // 选择的提交信息类型
const commitMessage = ref('');  // 提交信息
const selectedIcon = ref('');   // 选择的图标
const scope = ref('');          // 范围

onMounted(() => {
  // 初始化提交类型和图标配置，如果是自定义的话，就从远程获取
  if (getData('isCustomType')) {
    const typeFileUrl = getData('customFileUrl');
    if (typeFileUrl) {
      fetch(typeFileUrl).then(res => res.json()).then(data => {
        commitTypes.value = data;
      });
    }
  }
  if (getData('isCustomIcon')) {
    const iconFileUrl = getData('customIconUrl');
    if (iconFileUrl) {
      fetch(iconFileUrl).then(res => res.json()).then(data => {
        iconOptions.value = data;
      });
    }
  }

  // 根据关键字初始化提交信息类型
  selectedType.value = props.enterAction.payload;
});

// 生成的提交信息
const generatedCommitMessage = computed(() => {
  const scopeText = scope.value ? `(${scope.value})` : '';
  return useIcon.value
    ? `${selectedIcon.value} ${selectedType.value}${scopeText}: ${commitMessage.value}`
    : `${selectedType.value}${scopeText}: ${commitMessage.value}`;
});

// 生成的git提交代码
const generatedGitCommitMessage = computed(() => {
  return `git commit -m"${generatedCommitMessage.value}"`;
});


watch(selectedType, (newValue) => {
  const selected = commitTypes.value.find(type => type.value === newValue);
  if (selected) {
    selectedIcon.value = selected.icon;
  }
});

const onCopy = () => {
  if (getData('isKill')) {
    utools.hideMainWindow();
    utools.outPlugin();
    return;
  }
  message.success('复制好了');
};

const handleSetting = () => {
  // 跳转到设置
  utools.redirect('git commit config', null);
};

</script>

<template>
  <div style="display: flex; justify-content: center; margin-bottom: 10px;">
    <div class="commit-generator">
      <!-- 第一行 -->
      <div class="row1" style="display: flex; gap: 10px;width:80vw;">
        <!-- 提交信息类型 -->
        <a-select class="i-selector" v-model:value="selectedType" style="flex:5;" placeholder="选择类型" allow-clear
          show-search>
          <a-select-option v-for="type in commitTypes" :key="type.value" :value="type.value">
            {{ type.icon }} {{ type.label }}
          </a-select-option>
        </a-select>
        <!-- 输入的范围 -->
        <a-input v-model:value="scope" style="flex:2.5;box-shadow: 0px 4px 4px rgb(0 0 0 / 10%);"
          placeholder="范围（可选）" />
        <!-- 图标类型 -->
        <a-select class="i-selector" v-model:value="selectedIcon" style="flex:2.5" placeholder="选择图标">
          <a-select-option v-for="icon in iconOptions" :key="icon.value" :value="icon.value">
            {{ icon.label }}
          </a-select-option>
        </a-select>
      </div>
      <!-- 第二行 -->
      <div class="row2" style="display: flex;padding: 10px; align-items: center;width: 80vw;">
        <!-- 提交信息 -->
        <a-textarea v-model:value="commitMessage" allowClear placeholder="输入提交信息概述" :rows="3" />
      </div>

      <!-- 第三组 -->
      <div class="row3" style="display: flex;padding: 10px; flex-direction: column;">
        <!-- 提示文本 -->
        <a-typography-paragraph v-if="!getData('hideTip')" class="commit-msg" style="color: gray;font-size: 12px;">
          下面分别是生成的提交信息和git提交代码，点击蓝色图标复制
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

      <!-- 设置按钮 -->
      <div style="position: fixed; bottom: 10px; right: 10px;">
        <a-button class="config-btn" @click="handleSetting" type="dashed">
          <setting-filled spin style="font-size: 20px;color: gray;" />
        </a-button>
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

.i-selector {
  box-shadow: 0px 4px 4px rgba(0, 0, 0, .1)
}

.config-btn {
  background: transparent !important;
  border: 0 !important;
}
</style>