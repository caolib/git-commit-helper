<script setup>
import { onMounted, ref, h, watch } from 'vue';
import { ConfigProvider, Layout, Menu } from 'ant-design-vue';
import { FileTextOutlined, SettingOutlined } from '@ant-design/icons-vue';
import HomeView from './components/HomeView.vue';
import ConfigView from './components/ConfigView.vue';
import { useCommitTypesStore } from './stores/commitTypes';

const { Sider, Content } = Layout;

const currentView = ref(['home']);
const enterAction = ref({});
const commitTypesStore = useCommitTypesStore();

const menuItems = [
  {
    key: 'home',
    icon: () => h(FileTextOutlined),
    label: '提交生成',
  },
  {
    key: 'config',
    icon: () => h(SettingOutlined),
    label: '配置',
  },
];

// 当前已注册的动态功能 codes
const registeredFeatureCodes = ref(new Set());
let registerTimer = null;

// 动态注册 uTools 命令 - 为每个提交类型创建独立功能
const registerCommands = () => {
  // 清除之前的定时器，防止短时间内多次调用
  if (registerTimer) {
    clearTimeout(registerTimer);
  }

  registerTimer = setTimeout(() => {
    const currentTypes = new Set(commitTypesStore.allCommitTypes.map(type => type.value));

    // 添加新类型的功能
    commitTypesStore.allCommitTypes.forEach(type => {
      const featureCode = `commit-${type.value}`;

      // 如果还未注册，则注册
      if (!registeredFeatureCodes.value.has(featureCode)) {
        window.utools.setFeature({
          code: featureCode,
          explain: `生成 ${type.label || type.value} 类型的提交信息`,
          cmds: [type.value]
        });
        registeredFeatureCodes.value.add(featureCode);
      }
    });

    // 删除已移除类型的功能
    registeredFeatureCodes.value.forEach(featureCode => {
      const typeValue = featureCode.replace('commit-', '');
      if (!currentTypes.has(typeValue)) {
        window.utools.removeFeature(featureCode);
        registeredFeatureCodes.value.delete(featureCode);
      }
    });

    registerTimer = null;
  }, 100); // 100ms 防抖
};

onMounted(() => {
  // 清理可能存在的旧动态功能
  try {
    const existingFeatures = window.utools.getFeatures();
    existingFeatures.forEach(feature => {
      if (feature.code.startsWith('commit-')) {
        window.utools.removeFeature(feature.code);
      }
    });
  } catch (e) {
    // ignore
  }

  // 初始化时注册命令
  registerCommands();

  window.utools.onPluginEnter((action) => {
    enterAction.value = action;
  });

  window.utools.onPluginOut((isKill) => {
    currentView.value = ['home'];
  });
});

// 监听提交类型数组的变化
watch(
  () => commitTypesStore.commitTypes.length,
  () => {
    registerCommands();
  }
);

// 同时监听类型值的变化
watch(
  () => commitTypesStore.commitTypes.map(t => t.value).join(','),
  () => {
    registerCommands();
  }
);

const handleMenuClick = ({ key }) => {
  currentView.value = [key];
};
</script>

<template>
  <ConfigProvider>
    <Layout style="min-height: 100vh;">
      <Sider theme="light" :width="150" style="border-right: 1px solid #f0f0f0;">
        <Menu v-model:selectedKeys="currentView" mode="inline" :items="menuItems" @click="handleMenuClick" />
      </Sider>
      <Content style="background: #fff;">
        <HomeView v-if="currentView[0] === 'home'" :enterAction="enterAction" />
        <ConfigView v-else-if="currentView[0] === 'config'" />
      </Content>
    </Layout>
  </ConfigProvider>
</template>