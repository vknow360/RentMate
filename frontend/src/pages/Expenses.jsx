import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import AnimatedSection from '../components/AnimatedSection';
import GlassCard from '../components/GlassCard';

const Expenses = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Tab control: timeline, addForm, analytics
  const [activeTab, setActiveTab] = useState('timeline');

  // Form State
  const [formData, setFormData] = useState({
    category: 'Rent',
    amount: '',
    description: '',
    splitBetween: [] // User objects
  });
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchExpenses = useCallback(async (groupId) => {
    try {
      setLoading(true);
      const res = await api.get(`/expenses?groupId=${groupId}`);
      setExpenses(res.data.data);
    } catch (error) {
      console.error('Failed to fetch expenses', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBalances = useCallback(async (groupId) => {
    try {
      const res = await api.get(`/expenses/balances?groupId=${groupId}`);
      setBalances(res.data.data);
    } catch (error) {
      console.error('Failed to fetch balances', error);
    }
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchExpenses(selectedGroup);
      fetchBalances(selectedGroup);
    } else {
      setExpenses([]);
      setBalances([]);
    }
  }, [selectedGroup, fetchExpenses, fetchBalances]);

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
      
      setFormData({ category: 'Rent', amount: '', description: '', splitBetween: [] });
      setActiveTab('timeline');
      
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
      if (b.balance > 0) totalYouAreOwed += b.balance;
      else if (b.balance < 0) totalYouOwe += Math.abs(b.balance);
    }
  });

  // Calculate category breakdowns
  const categoryTotals = {
    Rent: 0,
    Electricity: 0,
    Water: 0,
    Internet: 0,
    Groceries: 0,
    Other: 0
  };
  let grandTotalSpent = 0;
  expenses.forEach(e => {
    const cat = e.category || 'Other';
    const amount = e.amount || 0;
    if (categoryTotals[cat] !== undefined) {
      categoryTotals[cat] += amount;
    } else {
      categoryTotals['Other'] += amount;
    }
    grandTotalSpent += amount;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
      {/* Title Header */}
      <AnimatedSection>
        <div className="mb-10 mt-6">
          <h1 className="text-4xl font-heading font-extrabold tracking-tight text-white mb-2">
            Expense <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-warm via-accent-violet to-accent-sky">Splitter</span>
          </h1>
          <p className="text-text-secondary">
            Manage flatmate bills, track outstanding splits, and settle category balances cleanly.
          </p>
        </div>
      </AnimatedSection>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Context Sidebar */}
        <div className="space-y-6">
          
          {/* Household Context Selector */}
          <AnimatedSection direction="up">
            <GlassCard className="p-5">
              <h3 className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-3">Household Group</h3>
              
              <div className="space-y-3">
                <div className="flex items-center bg-bg-base/80 px-3.5 py-2.5 rounded-xl border border-glass-border shadow-inner">
                  <span className="text-lg mr-2">🏢</span>
                  <select 
                    value={selectedGroup} 
                    onChange={(e) => { setSelectedGroup(e.target.value); setNewGroupName(''); }}
                    className="w-full bg-transparent border-none text-xs font-bold text-text-primary focus:ring-0 cursor-pointer outline-none"
                  >
                    <option value="" className="bg-bg-surface">Select Household</option>
                    {groups.map(g => <option key={g} value={g} className="bg-bg-surface">{g}</option>)}
                  </select>
                </div>
                
                <input 
                  type="text" 
                  placeholder="+ New Household Group" 
                  value={newGroupName}
                  onChange={(e) => { setNewGroupName(e.target.value); setSelectedGroup(''); }}
                  className="w-full bg-bg-base/40 border border-glass-border focus:border-accent-warm/60 outline-none text-xs font-semibold px-4 py-2.5 rounded-xl text-text-primary placeholder-text-tertiary transition-all shadow-inner"
                />
              </div>
            </GlassCard>
          </AnimatedSection>

          {/* Integrated Balance Summary */}
          {selectedGroup && (
            <AnimatedSection direction="up" delay={100}>
              <GlassCard className="p-5 relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${
                  overallBalance > 0 ? 'from-success/20 to-success/5' : 
                  overallBalance < 0 ? 'from-error/20 to-error/5' : 
                  'from-glass-border/20 to-transparent'
                } opacity-30 z-0 pointer-events-none`} />
                
                <div className="relative z-10">
                  <h3 className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-4">Your Balance</h3>
                  
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="text-xs text-text-secondary">Overall Position</span>
                    <span className={`text-2xl font-heading font-black ${
                      overallBalance > 0 ? 'text-success' : 
                      overallBalance < 0 ? 'text-error' : 'text-white'
                    }`}>
                      {overallBalance > 0 ? `+₹${overallBalance.toLocaleString('en-IN')}` : 
                       overallBalance < 0 ? `-₹${Math.abs(overallBalance).toLocaleString('en-IN')}` : '₹0'}
                    </span>
                  </div>
                  
                  <div className="border-t border-glass-border/50 pt-3 space-y-2 text-xs">
                    <div className="flex justify-between text-text-secondary">
                      <span>You Owe:</span>
                      <span className="font-semibold text-error">₹{totalYouOwe.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-text-secondary">
                      <span>You Are Owed:</span>
                      <span className="font-semibold text-success">₹{totalYouAreOwed.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </AnimatedSection>
          )}

          {/* Settle Standings Board */}
          <AnimatedSection direction="up" delay={200}>
            <GlassCard className="overflow-hidden">
              <div className="px-5 py-4 border-b border-glass-border bg-bg-surface/50">
                <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                  Standings & Balances
                </h3>
              </div>
              <div className="p-0 max-h-60 overflow-y-auto">
                {!selectedGroup ? (
                  <div className="p-6 text-center text-xs text-text-tertiary italic">Select household to view dues.</div>
                ) : balances.length > 0 ? (
                  <ul className="divide-y divide-glass-border/30">
                    {balances.map(b => (
                      <li key={b.user._id} className="px-5 py-3 flex justify-between items-center hover:bg-bg-surface/10 transition-colors">
                        <span className="font-bold text-text-primary text-xs truncate max-w-[120px]">
                          {b.user._id === user._id ? 'You' : b.user.name}
                        </span>
                        <span className={`font-bold font-heading text-[10px] px-2 py-0.5 rounded-lg border ${
                          b.balance > 0 ? 'text-success bg-success/5 border-success/15' : 
                          b.balance < 0 ? 'text-error bg-error/5 border-error/15' : 
                          'text-text-tertiary bg-bg-surface border-glass-border'
                        }`}>
                          {b.balance > 0 ? `+₹${b.balance.toLocaleString('en-IN')}` : 
                           b.balance < 0 ? `-₹${Math.abs(b.balance).toLocaleString('en-IN')}` : 'Settled'}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-6 text-center text-xs text-text-tertiary italic">All dues settled up!</div>
                )}
              </div>
            </GlassCard>
          </AnimatedSection>
        </div>

        {/* Right Column: Tabbed Workspace */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Slider Tab Navigation */}
          <div className="flex bg-bg-surface/50 border border-glass-border p-1.5 rounded-xl">
            {[
              { id: 'timeline', label: '🕒 Recent Dues' },
              { id: 'addForm', label: '💸 Add Expense' },
              { id: 'analytics', label: '📊 Spend Insights' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 text-center py-2.5 rounded-lg font-bold text-xs transition-all duration-300 ${
                  activeTab === tab.id 
                    ? 'bg-accent-warm text-bg-base shadow-lg' 
                    : 'text-text-secondary hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Dynamic Tab Workspaces */}
          <div className="min-h-[350px]">
            {activeTab === 'timeline' && (
              <AnimatedSection direction="up">
                <GlassCard className="overflow-hidden">
                  <div className="p-0">
                    {loading ? (
                      <div className="p-16 flex justify-center">
                        <div className="w-8 h-8 border-4 border-accent-warm border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : expenses.length > 0 ? (
                      <ul className="divide-y divide-glass-border/40">
                        {expenses.map(expense => (
                          <li key={expense._id} className="p-5 hover:bg-bg-surface/20 transition-colors flex justify-between items-center group">
                            <div className="flex items-center gap-4">
                              {/* Category Rounded Badge */}
                              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg shadow-inner ${
                                expense.category === 'Rent' ? 'bg-accent-violet/10 text-accent-violet border border-accent-violet/20' :
                                expense.category === 'Groceries' ? 'bg-accent-rose/10 text-accent-rose border border-accent-rose/20' :
                                expense.category === 'Electricity' ? 'bg-accent-sky/10 text-accent-sky border border-accent-sky/20' :
                                expense.category === 'Water' ? 'bg-accent-teal/10 text-accent-teal border border-accent-teal/20' :
                                expense.category === 'Internet' ? 'bg-accent-warm/10 text-accent-warm border border-accent-warm/20' :
                                'bg-text-secondary/15 text-text-secondary border border-glass-border'
                              }`}>
                                {expense.category === 'Rent' ? '🏠' : 
                                 expense.category === 'Groceries' ? '🛒' : 
                                 expense.category === 'Electricity' ? '⚡' : 
                                 expense.category === 'Water' ? '💧' : 
                                 expense.category === 'Internet' ? '🌐' : '💸'}
                              </div>
                              <div>
                                <p className="font-bold text-text-primary text-sm flex items-center gap-2">
                                  {expense.category}
                                  {expense.description && (
                                    <span className="text-[10px] font-medium text-text-tertiary px-2 py-0.5 rounded bg-bg-surface border border-glass-border/40 max-w-[120px] truncate">
                                      {expense.description}
                                    </span>
                                  )}
                                </p>
                                <p className="text-xs text-text-secondary font-medium mt-1">
                                  <span className={expense.paidBy._id === user._id ? 'text-accent-warm font-bold' : ''}>
                                    {expense.paidBy._id === user._id ? 'You' : expense.paidBy.name}
                                  </span> paid <span className="font-bold text-text-primary">₹{expense.amount.toLocaleString('en-IN')}</span>
                                </p>
                              </div>
                            </div>
                            <div className="text-right flex flex-col items-end gap-1.5">
                              <span className="text-[10px] text-text-tertiary font-bold bg-bg-surface/80 px-2 py-1 rounded border border-glass-border">
                                {new Date(expense.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </span>
                              {expense.createdBy._id === user._id && (
                                <button 
                                  onClick={() => handleDelete(expense._id)} 
                                  className="text-xs text-error opacity-0 group-hover:opacity-100 transition-all font-bold flex items-center gap-1 hover:underline cursor-pointer"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-16 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-bg-surface rounded-2xl flex items-center justify-center text-2xl mb-4 border border-glass-border animate-float">📝</div>
                        <p className="text-text-primary font-bold font-heading text-lg mb-1">No activity</p>
                        <p className="text-text-secondary text-xs">Add an expense or select another group to get started.</p>
                      </div>
                    )}
                  </div>
                </GlassCard>
              </AnimatedSection>
            )}

            {activeTab === 'addForm' && (
              <AnimatedSection direction="up">
                <GlassCard className="p-6">
                  <h3 className="text-md font-heading font-bold text-white mb-6 uppercase tracking-wider text-accent-warm">Create New Expense</h3>
                  <form onSubmit={handleSubmitExpense} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-1.5">Category</label>
                        <select 
                          name="category" 
                          value={formData.category} 
                          onChange={(e) => setFormData({...formData, category: e.target.value})} 
                          className="w-full px-3 py-2.5 bg-bg-surface border border-glass-border rounded-xl text-xs text-text-primary focus:ring-2 focus:ring-accent-warm outline-none"
                        >
                          <option value="Rent">Rent</option>
                          <option value="Electricity">Electricity</option>
                          <option value="Water">Water</option>
                          <option value="Internet">Internet</option>
                          <option value="Groceries">Groceries</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-1.5">Amount (₹)</label>
                        <div className="relative rounded-xl shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <span className="text-text-secondary font-bold text-xs">₹</span>
                          </div>
                          <input 
                            type="number" 
                            required 
                            min="1" 
                            placeholder="0.00" 
                            value={formData.amount} 
                            onChange={(e) => setFormData({...formData, amount: e.target.value})} 
                            className="w-full pl-8 px-3.5 py-2.5 bg-bg-surface border border-glass-border focus:border-accent-warm rounded-xl text-xs text-text-primary outline-none transition-all" 
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-1.5">Description</label>
                      <input 
                        type="text" 
                        value={formData.description} 
                        onChange={(e) => setFormData({...formData, description: e.target.value})} 
                        className="w-full px-3.5 py-2.5 bg-bg-surface border border-glass-border focus:border-accent-warm rounded-xl text-xs text-text-primary outline-none placeholder-text-tertiary transition-all" 
                        placeholder="e.g. WiFi Bill" 
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-1.5">Split With</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={userSearchQuery} 
                          onChange={handleSearchUser} 
                          className="w-full px-3.5 py-2.5 bg-bg-surface border border-glass-border focus:border-accent-warm rounded-xl text-xs text-text-primary outline-none placeholder-text-tertiary transition-all" 
                          placeholder="Search email..." 
                        />
                        {searchResults.length > 0 && (
                          <div className="absolute z-10 w-full mt-2 bg-bg-surface border border-glass-border rounded-xl shadow-xl max-h-40 overflow-y-auto">
                            {searchResults.map(u => (
                              <div key={u._id} onClick={() => addUserToSplit(u)} className="px-3.5 py-2.5 hover:bg-bg-elevated cursor-pointer text-xs border-b border-glass-border last:border-0 flex items-center justify-between transition-colors">
                                <span className="font-bold text-text-primary">{u.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Active Splitees Badge Strip */}
                      <div className="mt-3.5 flex flex-wrap gap-1.5">
                        <span className="bg-accent-warm/10 text-accent-warm px-2.5 py-1 rounded-lg text-[10px] font-bold border border-accent-warm/20">You</span>
                        {formData.splitBetween.map(u => (
                          <span key={u._id} className="bg-bg-surface text-text-primary px-2.5 py-1 rounded-lg text-[10px] font-medium border border-glass-border flex items-center">
                            {u.name}
                            <button type="button" onClick={() => removeUserFromSplit(u._id)} className="ml-1.5 text-text-tertiary hover:text-error transition-colors">✕</button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <button type="submit" className="w-full bg-text-primary text-bg-base py-3 rounded-xl text-xs font-bold hover:bg-white transition-all mt-4 shadow-md hover-lift">
                      Save & Post Expense
                    </button>
                  </form>
                </GlassCard>
              </AnimatedSection>
            )}

            {activeTab === 'analytics' && (
              <AnimatedSection direction="up">
                <GlassCard className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-md font-heading font-bold text-white uppercase tracking-wider">Spending Insights</h3>
                    <span className="text-xs font-bold text-accent-warm bg-accent-warm/15 px-3 py-1 rounded-xl border border-accent-warm/20">
                      Total: ₹{grandTotalSpent.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {grandTotalSpent > 0 ? (
                    <div className="space-y-6">
                      {/* Visual stacked bar */}
                      <div className="w-full bg-bg-surface/40 border border-glass-border h-4 rounded-full overflow-hidden flex shadow-inner">
                        {Object.entries(categoryTotals).map(([cat, total]) => {
                          if (total === 0) return null;
                          const pct = (total / grandTotalSpent) * 100;
                          const colors = {
                            Rent: 'bg-accent-violet',
                            Electricity: 'bg-accent-sky',
                            Water: 'bg-accent-teal',
                            Internet: 'bg-accent-warm',
                            Groceries: 'bg-accent-rose',
                            Other: 'bg-text-tertiary'
                          };
                          return (
                            <div 
                              key={cat}
                              className={`${colors[cat] || 'bg-text-tertiary'} h-full transition-all duration-500`}
                              style={{ width: `${pct}%` }}
                              title={`${cat}: ${Math.round(pct)}%`}
                            />
                          );
                        })}
                      </div>

                      {/* Detail Breakdown list */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.entries(categoryTotals).map(([cat, total]) => {
                          if (total === 0) return null;
                          const pct = Math.round((total / grandTotalSpent) * 100);
                          const catConfig = {
                            Rent: { icon: '🏠', barColor: 'bg-accent-violet' },
                            Electricity: { icon: '⚡', barColor: 'bg-accent-sky' },
                            Water: { icon: '💧', barColor: 'bg-accent-teal' },
                            Internet: { icon: '🌐', barColor: 'bg-accent-warm' },
                            Groceries: { icon: '🛒', barColor: 'bg-accent-rose' },
                            Other: { icon: '💸', barColor: 'bg-text-tertiary' }
                          };
                          const config = catConfig[cat] || catConfig.Other;
                          
                          return (
                            <div key={cat} className="bg-bg-base/30 border border-glass-border/40 p-4 rounded-xl flex flex-col justify-between hover:border-glass-border transition-colors">
                              <div className="flex items-center justify-between mb-2">
                                <span className="flex items-center gap-1.5 text-xs font-bold text-text-secondary">
                                  <span>{config.icon}</span>
                                  {cat}
                                </span>
                                <span className="text-[10px] font-bold text-text-tertiary px-1.5 py-0.5 rounded bg-bg-surface border border-glass-border/60">
                                  {pct}%
                                </span>
                              </div>
                              <p className="text-base font-heading font-black text-white mt-1">₹{total.toLocaleString('en-IN')}</p>
                              {/* Mini progress bar */}
                              <div className="w-full bg-bg-surface/30 h-1.5 rounded-full overflow-hidden mt-3">
                                <div className={`h-full ${config.barColor}`} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-16 text-center flex flex-col items-center">
                      <div className="w-16 h-16 bg-bg-surface rounded-2xl flex items-center justify-center text-2xl mb-4 border border-glass-border animate-float">📈</div>
                      <p className="text-text-primary font-bold font-heading text-lg mb-1">No spending data</p>
                      <p className="text-text-secondary text-xs">Analytics will show up here after you add household bills.</p>
                    </div>
                  )}
                </GlassCard>
              </AnimatedSection>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default Expenses;
