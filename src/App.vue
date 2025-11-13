<script setup>
import { onMounted, ref, h } from 'vue';
import { ConfigProvider, Layout, Menu } from 'ant-design-vue';
import { FileTextOutlined, SettingOutlined } from '@ant-design/icons-vue';
import HomeView from './components/HomeView.vue';
import ConfigView from './components/ConfigView.vue';

const { Sider, Content } = Layout;

const currentView = ref(['home']);
const enterAction = ref({});

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

onMounted(() => {
  window.utools.onPluginEnter((action) => {
    console.log("Plugin entered", action);
    enterAction.value = action;
  });

  window.utools.onPluginOut((isKill) => {
    currentView.value = ['home'];
  });
});

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