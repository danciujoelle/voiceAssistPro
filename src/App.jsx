import { TabsComponent, TabPanel } from './components/TabsComponent'
import EmergencyAssistant from './components/EmergencyAssistant'
import OrderAssistant from './components/OrderAssistant'
import './App.css'

function App() {
  return (
    <div className="app">
      <TabsComponent defaultTab={0}>
        <TabPanel label="Emergency Assistant" icon="🚑">
          <EmergencyAssistant />
        </TabPanel>
        <TabPanel label="Order Assistant" icon="🛒">
          <OrderAssistant />
        </TabPanel>
      </TabsComponent>
    </div>
  )
}

export default App
