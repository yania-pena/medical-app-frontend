import { ConfigProvider } from "antd";
import "./App.css";
import { AuthProvider } from './context/AuthContext';
import MedicalApp from './pages/MedicalApp';
function App() {

  return (
    <div className="App">
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#007E85',
          },
        }}
      >
        <AuthProvider>
          <MedicalApp />
        </AuthProvider>
      </ConfigProvider>
    </div>
  );
}

export default App