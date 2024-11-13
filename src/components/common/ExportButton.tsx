import { useExpenseStore } from '../../store/expenseStore';

const ExportButton = () => {
  const handleExport = () => {
    const expenses = useExpenseStore.getState().expenses;
    const dataStr = JSON.stringify(expenses, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', `expenses-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleExport}
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
    >
      Export Expenses
    </button>
  );
};

export default ExportButton;
