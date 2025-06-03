import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Routes from './Routes';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes />
      </AnimatePresence>
    </div>
  );
}

export default App;