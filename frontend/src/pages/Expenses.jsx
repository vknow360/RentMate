import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import AnimatedSection from '../components/AnimatedSection';

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
    <div className="min-h-[calc(100vh-64px)] pb-12">
      {/* Top Banner / Dashboard Header */}
      <div className="bg-bg-surface border-b border-glass-border pt-8 pb-12 px-4 sm:px-6 lg:px-8 mb-8">
        <AnimatedSection>
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-3xl font-heading font-bold text-text-primary">Expenses Dashboard</h1>
                <p className="text-text-secondary mt-2">Split bills, track balances, and settle up easily.</p>
              </div>
              
              {/* Group Selector inline in header */}
              <div className="flex items-center bg-bg-base p-2 rounded-xl border border-glass-border shadow-inner">
                <select 
                  value={selectedGroup} 
                  onChange={(e) => { setSelectedGroup(e.target.value); setNewGroupName(''); }}
                  className="bg-transparent border-none text-sm font-bold text-text-primary focus:ring-0 cursor-pointer outline-none px-2"
                >
                  <option value="" className="bg-bg-surface">Select Household</option>
                  {groups.map(g => <option key={g} value={g} className="bg-bg-surface">{g}</option>)}
                </select>
                <div className="mx-3 text-glass-border">|</div>
                <input 
                  type="text" 
                  placeholder="+ New Group" 
                  value={newGroupName}
                  onChange={(e) => { setNewGroupName(e.target.value); setSelectedGroup(''); }}
                  className="bg-transparent border-none text-sm w-32 focus:ring-0 outline-none text-text-primary placeholder-text-tertiary px-2"
                />
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        
        {/* Metrics Row */}
        <AnimatedSection delay={100}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative z-10">
            <div className="glass-card p-6 flex flex-col justify-center border-t-4 border-t-text-secondary hover-lift">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Overall Balance</h3>
              <p className={`text-3xl font-bold font-heading mt-2 ${overallBalance > 0 ? 'text-success' : overallBalance < 0 ? 'text-error' : 'text-text-primary'}`}>
                {overallBalance > 0 ? `+₹${overallBalance}` : overallBalance < 0 ? `-₹${Math.abs(overallBalance)}` : '₹0'}
              </p>
            </div>
            <div className="glass-card p-6 flex flex-col justify-center border-t-4 border-t-error hover-lift">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">You Owe</h3>
              <p className="text-3xl font-bold font-heading mt-2 text-error">₹{totalYouOwe}</p>
            </div>
            <div className="glass-card p-6 flex flex-col justify-center border-t-4 border-t-success hover-lift">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">You Are Owed</h3>
              <p className="text-3xl font-bold font-heading mt-2 text-success">₹{totalYouAreOwed}</p>
            </div>
          </div>
        </AnimatedSection>

        {/* Dashboard Columns Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Activity Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatedSection direction="up" delay={200}>
              <div className="glass-card overflow-hidden">
                <div className="px-6 py-4 border-b border-glass-border bg-bg-surface flex justify-between items-center">
                  <h2 className="text-lg font-bold font-heading text-text-primary uppercase tracking-wider flex items-center gap-2">
                    <svg className="w-5 h-5 text-accent-warm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Recent Activity
                  </h2>
                </div>
                
                <div className="p-0">
                  {loading ? (
                    <div className="p-8 flex justify-center">
                      <div className="w-10 h-10 border-4 border-accent-warm border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : expenses.length > 0 ? (
                    <ul className="divide-y divide-glass-border">
                      {expenses.map(expense => (
                        <li key={expense._id} className="p-6 hover:bg-bg-surface/50 transition-colors flex justify-between items-center group">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-inner ${
                              expense.category === 'Rent' ? 'bg-accent-violet/20 text-accent-violet border border-accent-violet/30' :
                              expense.category === 'Groceries' ? 'bg-accent-rose/20 text-accent-rose border border-accent-rose/30' :
                              expense.category === 'Electricity' ? 'bg-accent-sky/20 text-accent-sky border border-accent-sky/30' :
                              'bg-text-secondary/20 text-text-secondary border border-text-secondary/30'
                            }`}>
                              {expense.category === 'Rent' ? '🏠' : expense.category === 'Groceries' ? '🛒' : expense.category === 'Electricity' ? '⚡' : '💸'}
                            </div>
                            <div>
                              <p className="font-bold text-text-primary text-base">{expense.category}</p>
                              <p className="text-sm text-text-secondary font-medium mt-1">
                                <span className={expense.paidBy._id === user._id ? 'text-accent-warm' : ''}>{expense.paidBy._id === user._id ? 'You' : expense.paidBy.name}</span> paid <span className="font-bold text-text-primary">₹{expense.amount}</span>
                              </p>
                              {expense.description && <p className="text-xs text-text-tertiary mt-1 italic">{expense.description}</p>}
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end">
                            <p className="text-xs text-text-tertiary font-medium bg-bg-surface px-2 py-1 rounded-md border border-glass-border">{new Date(expense.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                            {expense.createdBy._id === user._id && (
                              <button onClick={() => handleDelete(expense._id)} className="text-xs text-error opacity-0 group-hover:opacity-100 transition-opacity mt-2 font-bold hover:underline">
                                Delete
                              </button>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-16 text-center flex flex-col items-center">
                      <div className="w-20 h-20 bg-bg-surface rounded-full flex items-center justify-center text-3xl mb-6 border border-glass-border animate-float">📝</div>
                      <p className="text-text-primary font-bold font-heading text-xl mb-2">No expenses yet</p>
                      <p className="text-text-secondary">Select a group and add an expense to get started.</p>
                    </div>
                  )}
                </div>
              </div>
            </AnimatedSection>
          </div>

          {/* Right Column: Add Expense & Balances */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Quick Action Widget */}
            <AnimatedSection direction="left" delay={300}>
              <div className="glass-card overflow-hidden">
                <div className="p-6">
                  {!showAddForm ? (
                    <button 
                      onClick={() => setShowAddForm(true)}
                      className="w-full bg-accent-warm text-bg-base py-3 rounded-xl font-bold shadow-[0_0_15px_rgba(212,165,116,0.3)] hover:bg-accent-warm-muted transition-colors flex items-center justify-center hover-lift"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                      Add an Expense
                    </button>
                  ) : (
                    <div className="animate-fade-in">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold font-heading text-text-primary uppercase tracking-wider text-accent-warm">New Expense</h3>
                        <button onClick={() => setShowAddForm(false)} className="text-text-secondary hover:text-text-primary transition-colors bg-bg-surface w-8 h-8 rounded-full flex items-center justify-center border border-glass-border">✕</button>
                      </div>
                      <form onSubmit={handleSubmitExpense} className="space-y-5">
                        <div>
                          <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Category</label>
                          <select name="category" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-3 bg-bg-surface border border-glass-border rounded-lg text-sm text-text-primary focus:ring-2 focus:ring-accent-warm outline-none">
                            <option value="Rent">Rent</option>
                            <option value="Electricity">Electricity</option>
                            <option value="Water">Water</option>
                            <option value="Internet">Internet</option>
                            <option value="Groceries">Groceries</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Amount</label>
                          <div className="relative rounded-lg shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <span className="text-text-secondary font-bold sm:text-sm">₹</span>
                            </div>
                            <input type="number" required min="1" placeholder="0.00" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full pl-8 px-4 py-3 bg-bg-surface border border-glass-border rounded-lg text-sm text-text-primary focus:ring-2 focus:ring-accent-warm outline-none" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Description</label>
                          <input type="text" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 bg-bg-surface border border-glass-border rounded-lg text-sm text-text-primary focus:ring-2 focus:ring-accent-warm outline-none placeholder-text-tertiary" placeholder="e.g. May Groceries" />
                        </div>
                        
                        <div className="pt-2">
                          <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Split With</label>
                          <div className="relative">
                            <input type="text" value={userSearchQuery} onChange={handleSearchUser} className="w-full px-4 py-3 bg-bg-surface border border-glass-border rounded-lg text-sm text-text-primary focus:ring-2 focus:ring-accent-warm outline-none placeholder-text-tertiary" placeholder="Search email..." />
                            {searchResults.length > 0 && (
                              <div className="absolute z-10 w-full mt-2 bg-bg-surface border border-glass-border rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                {searchResults.map(u => (
                                  <div key={u._id} onClick={() => addUserToSplit(u)} className="px-4 py-3 hover:bg-bg-elevated cursor-pointer text-sm border-b border-glass-border last:border-0 flex items-center justify-between transition-colors">
                                    <span className="font-bold text-text-primary">{u.name}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <span className="bg-accent-warm/20 text-accent-warm px-3 py-1.5 rounded-full text-xs font-bold border border-accent-warm/30">You</span>
                            {formData.splitBetween.map(u => (
                              <span key={u._id} className="bg-bg-surface text-text-primary px-3 py-1.5 rounded-full text-xs font-medium border border-glass-border flex items-center">
                                {u.name}
                                <button type="button" onClick={() => removeUserFromSplit(u._id)} className="ml-2 text-text-tertiary hover:text-error transition-colors">✕</button>
                              </span>
                            ))}
                          </div>
                        </div>

                        <button type="submit" className="w-full bg-text-primary text-bg-base py-3 rounded-lg text-sm font-bold hover:bg-white transition-colors mt-4 shadow-md hover-lift">
                          Save Expense
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </AnimatedSection>

            {/* Balances List */}
            <AnimatedSection direction="left" delay={400}>
              <div className="glass-card overflow-hidden">
                <div className="px-6 py-4 border-b border-glass-border bg-bg-surface">
                  <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2">
                    <svg className="w-4 h-4 text-accent-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    Group Balances
                  </h3>
                </div>
                <div className="p-0">
                  {!selectedGroup ? (
                    <div className="p-6 text-center text-sm text-text-tertiary italic">Select a group to view balances.</div>
                  ) : balances.length > 0 ? (
                    <ul className="divide-y divide-glass-border">
                      {balances.map(b => (
                        <li key={b.user._id} className="px-6 py-4 flex justify-between items-center hover:bg-bg-surface/30 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-bg-surface border border-glass-border flex items-center justify-center text-xs font-bold text-text-secondary">
                              {b.user.name.charAt(0)}
                            </div>
                            <span className="font-bold text-text-primary text-sm">{b.user._id === user._id ? 'You' : b.user.name}</span>
                          </div>
                          <span className={`font-bold font-heading text-sm px-3 py-1 rounded-full border ${b.balance > 0 ? 'text-success bg-success/10 border-success/30' : b.balance < 0 ? 'text-error bg-error/10 border-error/30' : 'text-text-secondary bg-bg-surface border-glass-border'}`}>
                            {b.balance > 0 ? `+₹${b.balance}` : b.balance < 0 ? `-₹${Math.abs(b.balance)}` : 'Settled'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-8 text-center flex flex-col items-center">
                      <span className="text-4xl mb-3">🎉</span>
                      <p className="text-text-primary font-bold">All settled up!</p>
                      <p className="text-xs text-text-secondary mt-1">No outstanding balances.</p>
                    </div>
                  )}
                </div>
              </div>
            </AnimatedSection>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Expenses;
