import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useExpenseStore } from './store/expenseStore';
import Navbar from './components/Navbar';
import ExpenseList from './components/ExpenseList';
import ExpenseForm from './components/ExpenseForm';
import Analytics from './components/Analytics';
import Budget from './components/Budget';
import Settings from './components/Settings';
import Settlement from './components/Settlement';

function App() {
  const { initializeStore } = useExpenseStore();

  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pt-16 pb-20">
          <Routes>
            <Route path="/" element={<ExpenseList />} />
            <Route path="/add" element={<ExpenseForm />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/settlement" element={<Settlement />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
