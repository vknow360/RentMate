import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Expenses = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    category: 'Rent',
    amount: '',
    description: '',
    splitBetween: [] // User IDs
  });
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchExpenses(selectedGroup);
      fetchBalances(selectedGroup);
    } else {
      setExpenses([]);
      setBalances([]);
    }
  }, [selectedGroup]);

  const fetchGroups = async () => {
    try {
      const res = await api.get('/expenses/groups');
      setGroups(res.data.data);
      if (res.data.data.length > 0 && !selectedGroup) {
        setSelectedGroup(res.data.data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch groups', error);
    }
  };

  const fetchExpenses = async (groupId) => {
    try {
      setLoading(true);
      const res = await api.get(`/expenses?groupId=${groupId}`);
      setExpenses(res.data.data);
    } catch (error) {
      console.error('Failed to fetch expenses', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBalances = async (groupId) => {
    try {
      const res = await api.get(`/expenses/balances?groupId=${groupId}`);
      setBalances(res.data.data);
    } catch (error) {
      console.error('Failed to fetch balances', error);
    }
  };

  const handleSearchUser = async (e) => {
    setUserSearchQuery(e.target.value);
    if (e.target.value.length > 2) {
      try {
        const res = await api.get(`/expenses/users/search?q=${e.target.value}`);
        setSearchResults(res.data.data.filter(u => u._id !== user._id && !formData.splitBetween.some(s => s._id === u._id)));
      } catch (error) {
        console.error('Failed to search users', error);
      }
    } else {
      setSearchResults([]);
    }
  };

  const addUserToSplit = (selectedUser) => {
    setFormData({
      ...formData,
      splitBetween: [...formData.splitBetween, selectedUser]
    });
    setSearchResults([]);
    setUserSearchQuery('');
  };

  const removeUserFromSplit = (userId) => {
    setFormData({
      ...formData,
      splitBetween: formData.splitBetween.filter(u => u._id !== userId)
    });
  };

  const handleSubmitExpense = async (e) => {
    e.preventDefault();
    const activeGroupId = selectedGroup || newGroupName;
    
    if (!activeGroupId) return alert('Please select or create a group');
    
    const allSplitUsers = [...formData.splitBetween];
    if (!allSplitUsers.some(u => u._id === user._id)) {
      allSplitUsers.push(user);
    }

    try {
      await api.post('/expenses', {
        groupId: activeGroupId,
        category: formData.category,
        amount: Number(formData.amount),
        description: formData.description,
        splitBetween: allSplitUsers.map(u => u._id),
        paidBy: user._id
      });
      
      setShowAddForm(false);
      setFormData({ category: 'Rent', amount: '', description: '', splitBetween: [] });
      
      if (!groups.includes(activeGroupId)) {
        await fetchGroups();
        setSelectedGroup(activeGroupId);
      } else {
        fetchExpenses(activeGroupId);
        fetchBalances(activeGroupId);
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add expense');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await api.delete(`/expenses/${id}`);
        fetchExpenses(selectedGroup);
        fetchBalances(selectedGroup);
      } catch (error) {
        alert('Failed to delete expense');
      }
    }
  };

  // Calculate top-level metrics
  let totalYouOwe = 0;
  let totalYouAreOwed = 0;
  let overallBalance = 0;

  balances.forEach(b => {
    if (b.user._id === user._id) {
      overallBalance = b.balance;
      // If balance > 0, it means the user paid more than their share and gets money back (Owed)
      // If balance < 0, user owes money
      if (b.balance > 0) totalYouAreOwed += b.balance;
      else if (b.balance < 0) totalYouOwe += Math.abs(b.balance);
    }
  });

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)] pb-12">
      {/* Top Banner / Dashboard Header */}
      <div className="bg-white border-b border-gray-200 pt-6 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Expenses Dashboard</h1>
              <p className="text-sm text-gray-500 mt-0.5">Split bills, track balances, and settle up easily.</p>
            </div>
            
            {/* Group Selector inline in header */}
            <div className="mt-4 md:mt-0 flex items-center bg-gray-50 p-2 rounded-lg border border-gray-200">
              <select 
                value={selectedGroup} 
                onChange={(e) => { setSelectedGroup(e.target.value); setNewGroupName(''); }}
                className="bg-transparent border-none text-sm font-medium text-gray-700 focus:ring-0 cursor-pointer outline-none"
              >
                <option value="">Select Household</option>
                {groups.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <div className="mx-2 text-gray-300">|</div>
              <input 
                type="text" 
                placeholder="+ New Group" 
                value={newGroupName}
                onChange={(e) => { setNewGroupName(e.target.value); setSelectedGroup(''); }}
                className="bg-transparent border-none text-sm w-32 focus:ring-0 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area (Pulled up over the banner) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
        
        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded shadow-sm border border-gray-200 p-4 flex flex-col justify-center">
            <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Overall Balance</h3>
            <p className={`text-xl font-bold mt-1 ${overallBalance > 0 ? 'text-green-600' : overallBalance < 0 ? 'text-red-600' : 'text-gray-900'}`}>
              {overallBalance > 0 ? `+₹${overallBalance}` : overallBalance < 0 ? `-₹${Math.abs(overallBalance)}` : '₹0'}
            </p>
          </div>
          <div className="bg-white rounded shadow-sm border border-gray-200 p-4 flex flex-col justify-center">
            <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">You Owe</h3>
            <p className="text-xl font-bold mt-1 text-red-600">₹{totalYouOwe}</p>
          </div>
          <div className="bg-white rounded shadow-sm border border-gray-200 p-4 flex flex-col justify-center">
            <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">You Are Owed</h3>
            <p className="text-xl font-bold mt-1 text-green-600">₹{totalYouAreOwed}</p>
          </div>
        </div>

        {/* Dashboard Columns Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Activity Timeline */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-white">
                <h2 className="text-sm font-bold text-gray-900">Recent Activity</h2>
              </div>
              
              <div className="p-0">
                {loading ? (
                  <div className="p-6 flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-600"></div></div>
                ) : expenses.length > 0 ? (
                  <ul className="divide-y divide-gray-100">
                    {expenses.map(expense => (
                      <li key={expense._id} className="p-4 hover:bg-gray-50 transition-colors flex justify-between items-center group">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-sm ${
                            expense.category === 'Rent' ? 'bg-purple-100 text-purple-600' :
                            expense.category === 'Groceries' ? 'bg-orange-100 text-orange-600' :
                            expense.category === 'Electricity' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            {expense.category === 'Rent' ? '🏠' : expense.category === 'Groceries' ? '🛒' : expense.category === 'Electricity' ? '⚡' : '💸'}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{expense.category}</p>
                            <p className="text-xs text-gray-500 font-medium">
                              {expense.paidBy._id === user._id ? 'You' : expense.paidBy.name} paid ₹{expense.amount}
                            </p>
                            {expense.description && <p className="text-[10px] text-gray-400 mt-0.5">{expense.description}</p>}
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <p className="text-xs text-gray-400 font-medium">{new Date(expense.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                          {expense.createdBy._id === user._id && (
                            <button onClick={() => handleDelete(expense._id)} className="text-[10px] text-red-500 opacity-0 group-hover:opacity-100 transition-opacity mt-1 hover:underline">
                              Delete
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-12 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl mb-4">📝</div>
                    <p className="text-gray-900 font-medium text-lg">No expenses yet</p>
                    <p className="text-gray-500 text-sm mt-1">Select a group and add an expense to get started.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Add Expense & Balances */}
          <div className="lg:col-span-1 space-y-4">
            
            {/* Quick Action Widget */}
            <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4">
                {!showAddForm ? (
                  <button 
                    onClick={() => setShowAddForm(true)}
                    className="w-full bg-primary-600 text-white py-2 rounded text-sm font-bold shadow-sm shadow-primary-200 hover:bg-primary-700 transition-colors flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    Add an Expense
                  </button>
                ) : (
                  <div className="animate-fade-in">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-bold text-gray-900">New Expense</h3>
                      <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                    </div>
                    <form onSubmit={handleSubmitExpense} className="space-y-4">
                      <div>
                        <select name="category" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500">
                          <option value="Rent">Rent</option>
                          <option value="Electricity">Electricity</option>
                          <option value="Water">Water</option>
                          <option value="Internet">Internet</option>
                          <option value="Groceries">Groceries</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">₹</span>
                          </div>
                          <input type="number" required min="1" placeholder="0.00" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full pl-7 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500" />
                        </div>
                      </div>
                      <div>
                        <input type="text" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500" placeholder="Description (e.g. May Groceries)" />
                      </div>
                      
                      <div className="pt-2">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Split With</label>
                        <div className="relative">
                          <input type="text" value={userSearchQuery} onChange={handleSearchUser} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500" placeholder="Search email..." />
                          {searchResults.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                              {searchResults.map(u => (
                                <div key={u._id} onClick={() => addUserToSplit(u)} className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-50 last:border-0 flex items-center justify-between">
                                  <span className="font-medium text-gray-900">{u.name}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-bold border border-primary-100">You</span>
                          {formData.splitBetween.map(u => (
                            <span key={u._id} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium border border-gray-200 flex items-center">
                              {u.name}
                              <button type="button" onClick={() => removeUserFromSplit(u._id)} className="ml-1 text-gray-400 hover:text-red-500">×</button>
                            </span>
                          ))}
                        </div>
                      </div>

                      <button type="submit" className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors mt-2">
                        Save Expense
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>

            {/* Balances List */}
            <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-white">
                <h3 className="text-[10px] font-bold text-gray-900 uppercase tracking-wider">Group Balances</h3>
              </div>
              <div className="p-0">
                {!selectedGroup ? (
                  <div className="p-4 text-center text-xs text-gray-500">Select a group to view balances.</div>
                ) : balances.length > 0 ? (
                  <ul className="divide-y divide-gray-50">
                    {balances.map(b => (
                      <li key={b.user._id} className="px-4 py-3 flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                            {b.user.name.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900 text-xs">{b.user._id === user._id ? 'You' : b.user.name}</span>
                        </div>
                        <span className={`font-bold text-xs ${b.balance > 0 ? 'text-green-600' : b.balance < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                          {b.balance > 0 ? `+₹${b.balance}` : b.balance < 0 ? `-₹${Math.abs(b.balance)}` : 'Settled'}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-6 text-center text-sm text-gray-500">All settled up! 🎉</div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Expenses;
