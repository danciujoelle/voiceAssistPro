import { TabsComponent, TabPanel } from './components/TabsComponent'
import EmergencyAssistant from './components/EmergencyAssistant'
import OrderAssistant from './components/OrderAssistant'
import './App.css'

function App() {
  return (
    <div className="app">
      <TabsComponent defaultTab={0}>
        <TabPanel label="Dispatcher Copilot" icon="🚑">
          <EmergencyAssistant />
        </TabPanel>
        <TabPanel label="Order Copilot" icon="🛒">
          <OrderAssistant />
        </TabPanel>
      </TabsComponent>
    </div>
  );
}

export default App
