// State management
const state = {
  currentTab: 'generate',
  isDark: window.matchMedia('(prefers-color-scheme: dark)').matches,
  qrHistory: JSON.parse(localStorage.getItem('qrHistory') || '[]')
}

// DOM Elements
const elements = {
  mobileMenu: document.getElementById('mobileMenu'),
  mobileMenuBtn: document.getElementById('mobileMenuBtn'),
  themeToggle: document.getElementById('themeToggle'),
  tabContent: document.getElementById('tabContent')
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  initializeApp()
  loadTab(state.currentTab)
  updateTheme()
})

// Navigation handling
document.querySelectorAll('[data-tab]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const tabId = e.currentTarget.dataset.tab
    switchTab(tabId)
  })
})

elements.mobileMenuBtn.addEventListener('click', toggleMobileMenu)
elements.themeToggle.addEventListener('click', toggleTheme)

// Core functions
function initializeApp() {
  // Initialize theme
  if (state.isDark) {
    document.documentElement.classList.add('dark')
  }

  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!elements.mobileMenu.contains(e.target) && 
        !elements.mobileMenuBtn.contains(e.target)) {
      elements.mobileMenu.classList.add('translate-x-full')
    }
  })
}

function switchTab(tabId) {
  state.currentTab = tabId
  
  // Update active states
  document.querySelectorAll('[data-tab]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId)
  })

  // Load tab content
  loadTab(tabId)
  
  // Close mobile menu
  elements.mobileMenu.classList.add('translate-x-full')
}

function loadTab(tabId) {
  const content = generateTabContent(tabId)
  elements.tabContent.innerHTML = content
  
  if (tabId === 'scan') {
    initializeScanner()
  }
}

function generateTabContent(tabId) {
  const templates = {
    generate: `
      <div class="max-w-2xl mx-auto space-y-6 fade-in">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Generate QR Code
          </h2>
          <form id="qrForm" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Content Type
              </label>
              <select id="contentType" class="input-field">
                <option value="text">Text</option>
                <option value="url">URL</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="wifi">WiFi</option>
              </select>
            </div>
            
            <div id="inputFields">
              <!-- Dynamic input fields will be inserted here -->
            </div>

            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Customization
                </label>
                <button type="button" id="toggleCustomization" class="text-sm text-indigo-600 dark:text-indigo-400">
                  Show options
                </button>
              </div>
              
              <div id="customizationOptions" class="hidden space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Foreground Color
                    </label>
                    <input type="color" id="fgColor" value="#000000" class="input-field h-10">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Background Color
                    </label>
                    <input type="color" id="bgColor" value="#FFFFFF" class="input-field h-10">
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Error Correction Level
                  </label>
                  <select id="errorLevel" class="input-field">
                    <option value="L">Low (7%)</option>
                    <option value="M" selected>Medium (15%)</option>
                    <option value="Q">Quartile (25%)</option>
                    <option value="H">High (30%)</option>
                  </select>
                </div>
              </div>
            </div>

            <button type="submit" class="btn-primary w-full">
              Generate QR Code
            </button>
          </form>
        </div>

        <div id="qrResult" class="hidden">
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 text-center">
            <div class="mb-4">
              <canvas id="qrCanvas" class="mx-auto"></canvas>
            </div>
            <div class="space-x-3">
              <button id="downloadQR" class="btn-primary">
                <i class="fas fa-download mr-2"></i>Download
              </button>
              <button id="shareQR" class="btn-primary">
                <i class="fas fa-share-alt mr-2"></i>Share
              </button>
            </div>
          </div>
        </div>
      </div>
    `,
    
    scan: `
      <div class="max-w-2xl mx-auto space-y-6 fade-in">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Scan QR Code
          </h2>
          <div id="reader" class="w-full"></div>
          <div id="scanResult" class="hidden mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 class="font-medium text-gray-900 dark:text-gray-100 mb-2">Scanned Result:</h3>
            <p id="scanResultText" class="text-gray-600 dark:text-gray-300"></p>
            <div class="mt-3">
              <button id="copyScanResult" class="btn-primary">
                <i class="fas fa-copy mr-2"></i>Copy
              </button>
            </div>
          </div>
        </div>
      </div>
    `,

    history: `
      <div class="max-w-2xl mx-auto space-y-6 fade-in">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            History
          </h2>
          <div id="historyList" class="space-y-4">
            <!-- History items will be inserted here -->
          </div>
        </div>
      </div>
    `
  }
  
  return templates[tabId] || ''
}

// QR Code Generation
function initializeQRGeneration() {
  const form = document.getElementById('qrForm')
  const contentType = document.getElementById('contentType')
  const inputFields = document.getElementById('inputFields')
  const toggleCustomization = document.getElementById('toggleCustomization')
  const customizationOptions = document.getElementById('customizationOptions')

  // Content type input fields
  const inputTemplates = {
    text: `
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Text Content
        </label>
        <textarea id="content" rows="4" class="input-field" 
          placeholder="Enter your text here"></textarea>
      </div>
    `,
    
    url: `
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          URL
        </label>
        <input type="url" id="content" class="input-field" 
          placeholder="https://example.com">
      </div>
    `,
    
    email: `
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email Address
          </label>
          <input type="email" id="email" class="input-field" 
            placeholder="example@email.com">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Subject (optional)
          </label>
          <input type="text" id="subject" class="input-field" 
            placeholder="Email subject">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Message (optional)
          </label>
          <textarea id="body" rows="4" class="input-field" 
            placeholder="Email body"></textarea>
        </div>
      </div>
    `,
    
    phone: `
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Phone Number
        </label>
        <input type="tel" id="content" class="input-field" 
          placeholder="+1234567890">
      </div>
    `,
    
    wifi: `
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Network Name (SSID)
          </label>
          <input type="text" id="ssid" class="input-field" 
            placeholder="Network name">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password
          </label>
          <input type="password" id="password" class="input-field" 
            placeholder="Network password">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Encryption Type
          </label>
          <select id="encryption" class="input-field">
            <option value="WPA">WPA/WPA2</option>
            <option value="WEP">WEP</option>
            <option value="nopass">No Password</option>
          </select>
        </div>
      </div>
    `
  }

  // Event Listeners
  contentType.addEventListener('change', () => {
    inputFields.innerHTML = inputTemplates[contentType.value]
  })

  toggleCustomization.addEventListener('click', () => {
    const isHidden = customizationOptions.classList.contains('hidden')
    customizationOptions.classList.toggle('hidden')
    toggleCustomization.textContent = isHidden ? 'Hide options' : 'Show options'
  })

  form.addEventListener('submit', handleQRGeneration)

  // Initialize with text input
  inputFields.innerHTML = inputTemplates.text
}

// QR Generation Handler
async function handleQRGeneration(e) {
  e.preventDefault()

  const contentType = document.getElementById('contentType').value
  const fgColor = document.getElementById('fgColor').value
  const bgColor = document.getElementById('bgColor').value
  const errorLevel = document.getElementById('errorLevel').value
  
  let content = ''

  // Get content based on type
  switch (contentType) {
    case 'email':
      const email = document.getElementById('email').value
      const subject = document.getElementById('subject').value
      const body = document.getElementById('body').value
      content = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      break
    
    case 'wifi':
      const ssid = document.getElementById('ssid').value
      const password = document.getElementById('password').value
      const encryption = document.getElementById('encryption').value
      content = `WIFI:T:${encryption};S:${ssid};P:${password};;`
      break
    
    default:
      content = document.getElementById('content').value
  }

  if (!content) {
    showAlert('Please enter content for the QR code', 'error')
    return
  }

  try {
    const canvas = document.getElementById('qrCanvas')
    await QRCode.toCanvas(canvas, content, {
      width: 300,
      margin: 2,
      color: {
        dark: fgColor,
        light: bgColor
      },
      errorCorrectionLevel: errorLevel
    })

    document.getElementById('qrResult').classList.remove('hidden')
    
    // Add to history
    addToHistory(content, canvas.toDataURL(), false)
    
    // Setup download button
    const downloadBtn = document.getElementById('downloadQR')
    downloadBtn.onclick = () => {
      const link = document.createElement('a')
      link.download = 'qrcode.png'
      link.href = canvas.toDataURL()
      link.click()
    }

    // Setup share button
    const shareBtn = document.getElementById('shareQR')
    shareBtn.onclick = async () => {
      try {
        const blob = await new Promise(resolve => canvas.toBlob(resolve))
        const file = new File([blob], 'qrcode.png', { type: 'image/png' })
        
        if (navigator.share) {
          await navigator.share({
            files: [file],
            title: 'QR Code',
            text: 'Generated QR Code'
          })
        } else {
          showAlert('Sharing is not supported on this device', 'error')
        }
      } catch (err) {
        console.error('Error sharing:', err)
        showAlert('Failed to share QR code', 'error')
      }
    }
  } catch (err) {
    console.error('Error generating QR code:', err)
    showAlert('Failed to generate QR code', 'error')
  }
}

// QR Scanner
function initializeScanner() {
  const html5QrcodeScanner = new Html5QrcodeScanner(
    "reader",
    { 
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0
    }
  )

  html5QrcodeScanner.render((decodedText) => {
    const resultDiv = document.getElementById('scanResult')
    const resultText = document.getElementById('scanResultText')
    
    resultDiv.classList.remove('hidden')
    resultText.textContent = decodedText
    
    // Add to history
    addToHistory(decodedText, null, true)
    
    // Setup copy button
    const copyBtn = document.getElementById('copyScanResult')
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(decodedText)
        .then(() => showAlert('Copied to clipboard!', 'success'))
        .catch(() => showAlert('Failed to copy', 'error'))
    }
  })
}

// History Management
function addToHistory(content, qrImage, isScanned) {
  const history = JSON.parse(localStorage.getItem('qrHistory') || '[]')
  history.unshift({
    content,
    qrImage,
    isScanned,
    timestamp: new Date().toISOString()
  })
  localStorage.setItem('qrHistory', JSON.stringify(history.slice(0, 10)))
  updateHistoryUI()
}

function updateHistoryUI() {
  const historyList = document.getElementById('historyList')
  if (!historyList) return

  const history = JSON.parse(localStorage.getItem('qrHistory') || '[]')
  
  historyList.innerHTML = history.map(item => `
    <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div class="flex-1">
        <div class="flex items-center space-x-2 mb-1">
          <span class="px-2 py-1 text-xs font-medium rounded-full ${
            item.isScanned 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
          }">
            ${item.isScanned ? 'Scanned' : 'Generated'}
          </span>
          <span class="text-xs text-gray-500 dark:text-gray-400">
            ${new Date(item.timestamp).toLocaleString()}
          </span>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-300">${item.content}</p>
      </div>
      ${item.qrImage ? `
        <div class="ml-4">
          <img src="${item.qrImage}" class="w-16 h-16 rounded">
        </div>
      ` : ''}
    </div>
  `).join('')
}

// Utility Functions
function showAlert(message, type = 'info') {
  const alertDiv = document.createElement('div')
  alertDiv.className = `fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
    type === 'error' 
      ? 'bg-red-500 text-white' 
      : type === 'success'
        ? 'bg-green-500 text-white'
        : 'bg-blue-500 text-white'
  } fade-in`
  alertDiv.textContent = message
  
  document.body.appendChild(alertDiv)
  setTimeout(() => {
    alertDiv.remove()
  }, 3000)
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initializeApp()
  loadTab(state.currentTab)
  updateTheme()
  updateHistoryUI()
}) 