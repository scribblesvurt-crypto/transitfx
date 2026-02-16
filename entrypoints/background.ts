export default defineBackground(() => {
  // Handle keyboard commands
  browser.commands.onCommand.addListener(async (command) => {
    if (command === 'toggle-extension') {
      const { getSettings, updateSettings } = await import('@/lib/settings');
      const settings = await getSettings();
      await updateSettings({ enabled: !settings.enabled });
    }

    if (command === 'skip-effect') {
      // Send skip message to the active tab's content script
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        browser.tabs.sendMessage(tab.id, { type: 'skip-effect' }).catch(() => {});
      }
    }
  });

  // Listen for messages from popup/options
  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'get-settings') {
      import('@/lib/settings').then(({ getSettings }) =>
        getSettings().then(sendResponse)
      );
      return true;
    }

    if (message.type === 'update-settings') {
      import('@/lib/settings').then(({ updateSettings }) =>
        updateSettings(message.payload).then(sendResponse)
      );
      return true;
    }
  });
});
