<script setup>
import { computed } from 'vue'
import { message } from 'ant-design-vue'
import { useSettingsStore } from '../stores/settings'

const settingsStore = useSettingsStore();

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
            <a-button type="primary" @click="saveData">保存</a-button>
            <a-popconfirm title="确定吗？" ok-text="Yes" cancel-text="我再想想" @confirm="resetConfig">
                <a-button type="dashed" danger>重置</a-button>
            </a-popconfirm>
        </div>
    </div>
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