import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'UCSD Deadlines',
    permissions: ['storage', 'alarms', 'notifications'],
    host_permissions: ['https://canvas.ucsd.edu/*'],
  },
});