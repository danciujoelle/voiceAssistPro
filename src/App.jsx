import { TabsComponent, TabPanel } from './components/TabsComponent'
import EmergencyAssistant from './components/EmergencyAssistant'
import OrderAssistant from './components/OrderAssistant'
import CustomerSupportAssistant from "./components/CustomerSupportAssistant";
import './App.css'

function App() {
  return (
    <div className="app">
      <TabsComponent defaultTab={0} appLogo="/voice_assist.png">
        <TabPanel label="Dispatcher Copilot">
          <EmergencyAssistant />
        </TabPanel>
        <TabPanel label="Order Copilot">
          <OrderAssistant />
        </TabPanel>
        <TabPanel label="Customer Support">
          <CustomerSupportAssistant />
        </TabPanel>
      </TabsComponent>
    </div>
  );
}

export default App
