const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const { spawn } = require('child_process')
const fs = require('fs')
const Store = require('electron-store')

const isDev = process.env.NODE_ENV === 'development'

const store = new Store({
  defaults: {
    defaultOutputFolder: '',
    whisperModel: 'small',
    device: 'cpu',
    computeType: 'int8',
    beamSize: 5,
    maxParallelJobs: 1,
  },
})

let mainWindow = null
let currentProcess = null
let logStreams = {}

function getLogPath(name) {
  const logDir = isDev
    ? path.join(__dirname, '..', 'logs')
    : path.join(process.resourcesPath, 'logs')
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true })
  return path.join(logDir, `${name}.log`)
}

function writeLog(logPath, level, message) {
  const timestamp = new Date().toISOString()
  const line = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`
  fs.appendFileSync(logPath, line, 'utf-8')
}

function getPythonCommand() {
  const pyInResources = path.join(process.resourcesPath, 'python')
  if (fs.existsSync(pyInResources)) return pyInResources
  return path.join(__dirname, '..', 'python')
}

function getScriptPath(name) {
  if (isDev) {
    return path.join(__dirname, '..', 'python', `${name}.py`)
  }
  return path.join(process.resourcesPath, 'python', `${name}.py`)
}

function extractChannelFromUrl(url) {
  const match = url.match(
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:@|channel\/|c\/|user\/)?([^/?]+)/
  )
  return match ? match[1] : 'unknown-channel'
}

function spawnPython(scriptName, args) {
  return new Promise((resolve, reject) => {
    const scriptPath = getScriptPath(scriptName)
    const pythonDir = getPythonCommand()

    if (!fs.existsSync(scriptPath)) {
      reject(new Error(`Script not found: ${scriptPath}`))
      return
    }

    const settings = store.store
    const env = {
      ...process.env,
      PYTHONIOENCODING: 'utf-8',
      WHISPER_MODEL: settings.whisperModel || 'small',
      WHISPER_DEVICE: settings.device || 'cpu',
      WHISPER_COMPUTE_TYPE: settings.computeType || 'int8',
      WHISPER_BEAM_SIZE: String(settings.beamSize || 5),
    }

    const proc = spawn('python', [scriptPath, ...args], {
      cwd: pythonDir,
      env,
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    currentProcess = proc

    let stdoutBuffer = ''
    let stderrBuffer = ''

    proc.stdout.on('data', (data) => {
      stdoutBuffer += data.toString()
      const lines = stdoutBuffer.split('\n')
      stdoutBuffer = lines.pop() || ''

      for (const line of lines) {
        if (!line.trim()) continue
        try {
          const parsed = JSON.parse(line)
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('python:message', parsed)
          }
        } catch {
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('python:message', {
              type: 'log',
              level: 'info',
              message: line,
            })
          }
        }
      }
    })

    proc.stderr.on('data', (data) => {
      stderrBuffer += data.toString()
    })

    proc.on('close', (code) => {
      if (stderrBuffer.trim()) {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('python:message', {
            type: 'log',
            level: 'error',
            message: stderrBuffer.trim(),
          })
        }
      }
      currentProcess = null
      if (code === 0) {
        resolve({ code, stderr: stderrBuffer.trim() })
      } else {
        reject(new Error(stderrBuffer.trim() || `Process exited with code ${code}`))
      }
    })

    proc.on('error', (err) => {
      currentProcess = null
      reject(err)
    })
  })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 700,
    title: 'YT-Tools',
    backgroundColor: '#0f172a',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (currentProcess) {
    currentProcess.kill()
    currentProcess = null
  }
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.handle('dialog:openFile', async (event, filters) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: filters || [{ name: 'Text Files', extensions: ['txt'] }],
  })
  return result.canceled ? null : result.filePaths[0]
})

ipcMain.handle('dialog:openFolder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
  })
  return result.canceled ? null : result.filePaths[0]
})

ipcMain.handle('settings:get', () => {
  return store.store
})

ipcMain.handle('settings:set', (event, settings) => {
  for (const [key, value] of Object.entries(settings)) {
    store.set(key, value)
  }
  return store.store
})

ipcMain.handle('file:saveTemp', (event, content, name) => {
  const tempDir = path.join(app.getPath('temp'), 'yt-tools')
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })
  const filePath = path.join(tempDir, `${Date.now()}-${name || 'upload.txt'}`)
  fs.writeFileSync(filePath, content, 'utf-8')
  return filePath
})

ipcMain.handle('task:start', async (event, { type, params }) => {
  if (currentProcess) {
    throw new Error('A task is already running')
  }

  const logPath = getLogPath(type)
  writeLog(logPath, 'info', `Starting task: ${type}`)

  try {
    const scriptMap = {
      extract_links: 'extract_links',
      extract_text: 'extract_text',
      download_mp3: 'download_mp3',
      transcribe_mp3_text: 'transcribe_mp3_text',
    }

    const scriptName = scriptMap[type]
    if (!scriptName) throw new Error(`Unknown task type: ${type}`)

    const args = []
    if (params.url) {
      args.push('--url', params.url)
    }
    if (params.inputFile) {
      args.push('--input-file', params.inputFile)
    }
    if (params.outputDir) {
      args.push('--output-dir', params.outputDir)
    }

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('python:message', {
        type: 'start',
        taskType: type,
        params,
      })
    }

    await spawnPython(scriptName, args)

    writeLog(logPath, 'success', `Task completed: ${type}`)
    return { success: true }
  } catch (err) {
    writeLog(logPath, 'error', `Task failed: ${err.message}`)
    throw err
  }
})

ipcMain.handle('task:cancel', () => {
  if (currentProcess) {
    currentProcess.kill('SIGTERM')
    setTimeout(() => {
      if (currentProcess) {
        currentProcess.kill('SIGKILL')
      }
    }, 3000)
    currentProcess = null
    return { success: true }
  }
  return { success: false, message: 'No task running' }
})

ipcMain.handle('task:status', () => {
  return { running: currentProcess !== null }
})
