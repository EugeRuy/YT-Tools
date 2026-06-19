const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // Task management
  startTask: (type, params) => ipcRenderer.invoke('task:start', { type, params }),
  cancelTask: () => ipcRenderer.invoke('task:cancel'),
  getTaskStatus: () => ipcRenderer.invoke('task:status'),

  // Dialogs
  openFile: (filters) => ipcRenderer.invoke('dialog:openFile', filters),
  openFolder: () => ipcRenderer.invoke('dialog:openFolder'),

  // Settings
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setSettings: (settings) => ipcRenderer.invoke('settings:set', settings),

  // Python process messages
  onMessage: (callback) => {
    const handler = (event, data) => callback(data)
    ipcRenderer.on('python:message', handler)
    return () => ipcRenderer.removeListener('python:message', handler)
  },

  // File utilities
  saveTempFile: (content, name) => ipcRenderer.invoke('file:saveTemp', content, name),

  // System checks
  checkFfmpeg: () => ipcRenderer.invoke('ffmpeg:check'),
})
