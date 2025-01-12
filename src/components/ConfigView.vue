<script lang="js" setup>
import { ref } from 'vue'
import { getData, setData } from '@/utils/store'
import { message } from 'ant-design-vue'

// 获取用户配置
const getDefault = (key, defaultValue) => {
    const value = getData(key);
    return value !== undefined ? value : defaultValue;
}

// 定义响应式变量
const isCustomType = ref(getDefault("isCustomType", false));
const isCustomIcon = ref(getDefault("isCustomIcon", false));
const isKill = ref(getDefault("isKill", true));
const useIcon = ref(getDefault("useIcon", true));
const typeFileUrl = ref(getDefault('customFileUrl', ''));
const iconFileUrl = ref(getDefault('customIconUrl', ''));
const hideTip = ref(getDefault('hideTip', false));

// 重置为默认配置
const resetConfig = () => {
    isCustomType.value = false;
    isCustomIcon.value = false;
    isKill.value = true;
    typeFileUrl.value = '';
    iconFileUrl.value = '';
    useIcon.value = true;
    hideTip.value = false;
    message.success("如你所愿");
}

const logs = () => {
    console.log('isCustomType', isCustomType.value);
    console.log('isCustomIcon', isCustomIcon.value);
    console.log('isKill', isKill.value);
    console.log('useIcon', useIcon.value);
    console.log('typeFileUrl', typeFileUrl.value);
    console.log('iconFileUrl', iconFileUrl.value);
    console.log('hideTip', hideTip.value);
}

// 保存配置文件
const saveData = () => {
    setData("customFileUrl", typeFileUrl.value);
    setData("isCustomType", isCustomType.value);
    setData("isKill", isKill.value);
    setData("customIconUrl", iconFileUrl.value);
    setData("isCustomIcon", isCustomIcon.value);
    setData("useIcon", useIcon.value);
    setData("hideTip", hideTip.value);
    message.success("保存好了");
    logs();
}

// https://cdn.jsdelivr.net/gh/caolib/cdn@main/json/commitTypes.json
// https://cdn.jsdelivr.net/gh/caolib/cdn@main/json/iconOptions.json

</script>

<template>
    <div class="config-view">
        <div class="config-row">
            <a-switch v-model:checked="isCustomType" />
            <a-input v-model:value="typeFileUrl" placeholder="使用自定义提交类型json文件源" />
        </div>
        <div class="config-row">
            <a-switch v-model:checked="isCustomIcon" />
            <a-input v-model:value="iconFileUrl" placeholder="使用自定义emoji图标源" />
        </div>
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
            <a-switch v-model:checked="hideTip" />
            <a-typography-text v-if="hideTip">隐藏主页面的灰色复制提示文本</a-typography-text>
            <a-typography-text class="forbidden-item" v-else>显示主页面的灰色复制提示文本</a-typography-text>
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