import { useState } from 'react'
import PropTypes from 'prop-types'
import './TabsComponent.css'

const TabsComponent = ({ children, defaultTab = 0 }) => {
  const [activeTab, setActiveTab] = useState(defaultTab)

  // Extract tab data from children
  const tabs = children.map((child, index) => ({
    id: index,
    label: child.props.label,
    icon: child.props.icon,
    content: child
  }))

  return (
    <div className="tabs-container">
      <nav className="tabs-nav" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon && <span className="tab-icon">{tab.icon}</span>}
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>
      
      <div className="tab-content">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            id={`tabpanel-${tab.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${tab.id}`}
            className={`tab-panel ${activeTab === tab.id ? 'active' : ''}`}
          >
            {activeTab === tab.id && tab.content}
          </div>
        ))}
      </div>
    </div>
  )
}

// Tab Panel component for individual tabs
const TabPanel = ({ children }) => {
  return <div className="tab-panel-content">{children}</div>
}

TabsComponent.propTypes = {
  children: PropTypes.node.isRequired,
  defaultTab: PropTypes.number,
}

TabPanel.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.string,
  children: PropTypes.node.isRequired,
}

export { TabsComponent, TabPanel }
