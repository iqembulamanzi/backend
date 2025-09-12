// Water Guardian Admin Dashboard JavaScript
class DashboardManager {
  constructor() {
    this.currentPage = 'dashboard'
    this.serverStatus = 'unknown'
    this.init()
  }

  init() {
    this.bindEvents()
    this.checkServerStatus()
    this.loadDashboardData()
    this.updateActivityLog('Dashboard initialized')
  }

  bindEvents() {
    // Sidebar navigation
    document.querySelectorAll('.sidebar-menu li').forEach((item) => {
      item.addEventListener('click', (e) => {
        const page = e.currentTarget.dataset.page
        this.navigateToPage(page)
      })
    })

    // Menu toggle for mobile
    document.getElementById('menuToggle').addEventListener('click', () => {
      document.querySelector('.sidebar').classList.toggle('show')
    })

    // Refresh button
    document.getElementById('refreshBtn').addEventListener('click', () => {
      this.refreshData()
    })

    // API testing
    document.getElementById('sendRequest').addEventListener('click', () => {
      this.sendAPIRequest()
    })

    // Database management
    document
      .getElementById('refreshCollections')
      .addEventListener('click', () => {
        this.refreshCollections()
      })

    document.getElementById('clearDatabase').addEventListener('click', () => {
      if (
        confirm(
          'Are you sure you want to clear the database? This action cannot be undone.'
        )
      ) {
        this.clearDatabase()
      }
    })
  }

  navigateToPage(page) {
    // Update active menu item
    document.querySelectorAll('.sidebar-menu li').forEach((item) => {
      item.classList.remove('active')
    })
    document.querySelector(`[data-page="${page}"]`).classList.add('active')

    // Hide all pages
    document.querySelectorAll('.page').forEach((p) => {
      p.classList.add('hidden')
    })

    // Show selected page
    document.getElementById(`${page}-page`).classList.remove('hidden')

    // Update page title
    const pageTitles = {
      dashboard: 'Dashboard',
      'api-testing': 'API Testing',
      database: 'Database Management',
      sensors: 'Sensor Management',
      'ai-analysis': 'AI Analysis',
      reports: 'Reports & Analytics',
      settings: 'System Settings',
    }

    document.getElementById('pageTitle').textContent =
      pageTitles[page] || 'Dashboard'
    this.currentPage = page

    // Load page-specific data
    this.loadPageData(page)
  }

  async checkServerStatus() {
    try {
      const response = await fetch('/health')
      if (response.ok) {
        this.serverStatus = 'online'
        this.updateStatusIndicator('online', 'Server Online')
      } else {
        this.serverStatus = 'offline'
        this.updateStatusIndicator('offline', 'Server Error')
      }
    } catch (error) {
      this.serverStatus = 'offline'
      this.updateStatusIndicator('offline', 'Server Offline')
      console.error('Server status check failed:', error)
    }
  }

  updateStatusIndicator(status, text) {
    const dot = document.getElementById('serverStatus')
    const textElement = document.getElementById('serverStatusText')

    dot.className = 'status-dot'
    dot.classList.add(status)
    textElement.textContent = text
  }

  async loadDashboardData() {
    // Update server status
    document.getElementById('server-status').textContent =
      this.serverStatus === 'online' ? 'Online' : 'Offline'

    // Update database status
    document.getElementById('db-status').textContent = 'Connected'

    // Update AI status
    document.getElementById('ai-status').textContent = 'Active'

    // Update sensors count (mock data for now)
    document.getElementById('sensors-count').textContent = '12'
  }

  async loadPageData(page) {
    switch (page) {
      case 'database':
        await this.loadCollections()
        break
      case 'sensors':
        await this.loadSensors()
        break
      case 'ai-analysis':
        await this.loadAIAnalysis()
        break
    }
  }

  async sendAPIRequest() {
    const method = document.getElementById('method').value
    const endpoint = document.getElementById('endpoint').value
    const requestBody = document.getElementById('requestBody').value

    try {
      const options = {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
      }

      if (requestBody && (method === 'POST' || method === 'PUT')) {
        options.body = requestBody
      }

      const response = await fetch(endpoint, options)
      const responseText = await response.text()

      document.getElementById('responseStatus').textContent =
        `${response.status} ${response.statusText}`

      try {
        const jsonResponse = JSON.parse(responseText)
        document.getElementById('responseBody').textContent = JSON.stringify(
          jsonResponse,
          null,
          2
        )
      } catch {
        document.getElementById('responseBody').textContent = responseText
      }

      this.updateActivityLog(
        `API ${method} request to ${endpoint} - ${response.status}`
      )
    } catch (error) {
      document.getElementById('responseStatus').textContent = 'Error'
      document.getElementById('responseBody').textContent =
        `Error: ${error.message}`
      this.updateActivityLog(`API request failed: ${error.message}`)
    }
  }

  async loadCollections() {
    const collectionsList = document.getElementById('collections-list')

    try {
      // Mock collections data - in real implementation, this would call an API
      const mockCollections = [
        { name: 'sensors', count: 12, size: '2.3 MB' },
        { name: 'water_quality', count: 15420, size: '45.8 MB' },
        { name: 'ai_predictions', count: 8920, size: '12.4 MB' },
        { name: 'users', count: 5, size: '0.8 MB' },
        { name: 'reports', count: 234, size: '8.9 MB' },
      ]

      let html = '<div class="collections-grid">'
      mockCollections.forEach((collection) => {
        html += `
                    <div class="collection-card">
                        <h4>${collection.name}</h4>
                        <p><strong>Documents:</strong> ${collection.count.toLocaleString()}</p>
                        <p><strong>Size:</strong> ${collection.size}</p>
                        <div class="collection-actions">
                            <button class="btn-secondary" onclick="viewCollection('${collection.name}')">View</button>
                            <button class="btn-danger" onclick="clearCollection('${collection.name}')">Clear</button>
                        </div>
                    </div>
                `
      })
      html += '</div>'

      collectionsList.innerHTML = html
    } catch (error) {
      collectionsList.innerHTML = `<p>Error loading collections: ${error.message}</p>`
    }
  }

  async loadSensors() {
    // Mock sensor data - in real implementation, this would call an API
    const sensorsPage = document.getElementById('sensors-page')
    sensorsPage.innerHTML = `
            <h2>Sensor Management</h2>
            <div class="sensors-grid">
                <div class="sensor-card">
                    <h3>pH Sensor - River A</h3>
                    <p><strong>Status:</strong> <span class="status-online">Online</span></p>
                    <p><strong>Last Reading:</strong> 7.2 pH</p>
                    <p><strong>Location:</strong> River A, Bridge Point</p>
                </div>
                <div class="sensor-card">
                    <h3>Temperature Sensor - Lake B</h3>
                    <p><strong>Status:</strong> <span class="status-online">Online</span></p>
                    <p><strong>Last Reading:</strong> 23.5°C</p>
                    <p><strong>Location:</strong> Lake B, North Shore</p>
                </div>
                <div class="sensor-card">
                    <h3>Turbidity Sensor - Stream C</h3>
                    <p><strong>Status:</strong> <span class="status-warning">Warning</span></p>
                    <p><strong>Last Reading:</strong> 15.8 NTU</p>
                    <p><strong>Location:</strong> Stream C, Dam Site</p>
                </div>
            </div>
        `
  }

  async loadAIAnalysis() {
    const aiPage = document.getElementById('ai-analysis-page')
    aiPage.innerHTML = `
            <h2>AI Analysis Dashboard</h2>
            <div class="ai-stats">
                <div class="ai-stat-card">
                    <h3>Model Accuracy</h3>
                    <p class="accuracy-score">94.7%</p>
                </div>
                <div class="ai-stat-card">
                    <h3>Predictions Today</h3>
                    <p class="prediction-count">1,247</p>
                </div>
                <div class="ai-stat-card">
                    <h3>Active Alerts</h3>
                    <p class="alert-count">3</p>
                </div>
            </div>
            <div class="recent-predictions">
                <h3>Recent Predictions</h3>
                <div class="predictions-list">
                    <div class="prediction-item">
                        <p><strong>River A:</strong> Water quality deteriorating - Action recommended</p>
                        <span class="prediction-time">2 minutes ago</span>
                    </div>
                    <div class="prediction-item">
                        <p><strong>Lake B:</strong> Normal water quality maintained</p>
                        <span class="prediction-time">15 minutes ago</span>
                    </div>
                    <div class="prediction-item">
                        <p><strong>Stream C:</strong> Pollution detected - Immediate attention required</p>
                        <span class="prediction-time">1 hour ago</span>
                    </div>
                </div>
            </div>
        `
  }

  async refreshCollections() {
    this.updateActivityLog('Refreshing database collections...')
    await this.loadCollections()
    this.updateActivityLog('Database collections refreshed')
  }

  async clearDatabase() {
    this.updateActivityLog('Clearing database...')
    // Mock implementation - in real app, this would call an API
    setTimeout(() => {
      this.updateActivityLog('Database cleared successfully')
      this.loadCollections()
    }, 2000)
  }

  refreshData() {
    this.checkServerStatus()
    this.loadDashboardData()
    this.loadPageData(this.currentPage)
    this.updateActivityLog('Dashboard data refreshed')
  }

  updateActivityLog(message) {
    const activityList = document.getElementById('activity-list')
    const timestamp = new Date().toLocaleTimeString()

    const activityItem = document.createElement('div')
    activityItem.className = 'activity-item'
    activityItem.innerHTML = `
            <div class="activity-icon">
                <i class="fas fa-info-circle"></i>
            </div>
            <div class="activity-content">
                <p>${message}</p>
                <span class="activity-time">${timestamp}</span>
            </div>
        `

    // Insert at the beginning
    activityList.insertBefore(activityItem, activityList.firstChild)

    // Keep only the last 10 items
    while (activityList.children.length > 10) {
      activityList.removeChild(activityList.lastChild)
    }
  }
}

// Global functions for button clicks
function viewCollection(name) {
  alert(`Viewing collection: ${name}`)
}

function clearCollection(name) {
  if (confirm(`Are you sure you want to clear the ${name} collection?`)) {
    alert(`Clearing collection: ${name}`)
  }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.dashboard = new DashboardManager()
})
