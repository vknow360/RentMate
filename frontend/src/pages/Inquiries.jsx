import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import AnimatedSection from '../components/AnimatedSection';

const Inquiries = () => {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeInquiryId, setActiveInquiryId] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const endpoint = user.role === 'owner' ? '/inquiries/owner' : '/inquiries/mine';
        const res = await api.get(endpoint);
        setInquiries(res.data.data);
      } catch (error) {
        console.error('Failed to fetch inquiries', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInquiries();
  }, [user.role]);

  const activeInquiry = inquiries.find(iq => iq._id === activeInquiryId);

  const handleStatusUpdate = async (id, status, responseText = undefined) => {
    try {
      const res = await api.put(`/inquiries/${id}`, { status, response: responseText });
      setInquiries(inquiries.map(iq => iq._id === id ? res.data.data : iq));
      if (responseText) setReplyText('');
    } catch (error) {
      alert('Failed to update inquiry');
    }
  };

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeInquiryId) return;
    handleStatusUpdate(activeInquiryId, 'responded', replyText);
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
      <div className="w-16 h-16 border-4 border-accent-warm border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-64px)] flex overflow-hidden">
      
      {/* LEFT PANE: Conversation List */}
      <div className="w-full md:w-1/3 lg:w-1/4 bg-bg-surface border-r border-glass-border flex flex-col h-full z-10 shadow-lg">
        <div className="p-4 border-b border-glass-border bg-bg-base/50">
          <h1 className="text-lg font-bold font-heading uppercase tracking-wider text-text-primary">
            {user.role === 'owner' ? 'Inbox' : 'Sent Inquiries'}
          </h1>
        </div>
        
        <div className="overflow-y-auto flex-1 p-3 space-y-2 custom-scrollbar">
          {inquiries.length > 0 ? (
            inquiries.map((inquiry, idx) => (
              <AnimatedSection key={inquiry._id} delay={idx * 50}>
                <button 
                  onClick={() => setActiveInquiryId(inquiry._id)}
                  className={`w-full text-left p-3.5 rounded-xl transition-all duration-300 flex flex-col gap-1.5 ${activeInquiryId === inquiry._id ? 'bg-accent-warm/10 border-accent-warm/50 shadow-[0_0_15px_rgba(212,165,116,0.15)] border' : 'hover:bg-bg-elevated border border-transparent'}`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider ${inquiry.status === 'pending' ? 'bg-warning/20 text-warning border border-warning/30' : inquiry.status === 'responded' ? 'bg-success/20 text-success border border-success/30' : 'bg-bg-base text-text-secondary border border-glass-border'}`}>
                      {inquiry.status === 'pending' ? (user.role === 'owner' ? 'Needs Reply' : 'Awaiting Reply') : inquiry.status === 'responded' ? (user.role === 'owner' ? 'Replied' : 'Owner Replied') : 'Closed'}
                    </span>
                    <span className="text-[10px] text-text-tertiary font-medium">{new Date(inquiry.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-bold text-sm text-text-primary truncate">
                    {user.role === 'owner' ? inquiry.studentId?.name : inquiry.ownerId?.name}
                  </h3>
                  <p className="text-xs text-text-secondary font-medium truncate">Re: {inquiry.propertyId?.title}</p>
                  <p className="text-xs text-text-tertiary truncate mt-1 italic">{inquiry.messages?.length > 0 ? inquiry.messages[inquiry.messages.length - 1].text : inquiry.message}</p>
                </button>
              </AnimatedSection>
            ))
          ) : (
            <div className="p-8 text-center text-text-secondary text-sm glass-card mt-4 border-dashed">No messages found.</div>
          )}
        </div>
      </div>

      {/* RIGHT PANE: Active Chat */}
      <div className={`flex-1 flex flex-col bg-bg-base h-full relative ${!activeInquiryId ? 'hidden md:flex' : 'flex'}`}>
        {/* Background Decorative Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-bg-surface/50 to-transparent pointer-events-none"></div>

        {activeInquiry ? (
          <div className="relative z-10 flex flex-col h-full">
            {/* Chat Header */}
            <div className="bg-bg-surface/80 backdrop-blur-md px-6 py-4 border-b border-glass-border flex justify-between items-center shadow-md">
              <div className="flex items-center gap-4">
                {user.role === 'owner' ? (
                  <>
                    <img src={activeInquiry.studentId?.profileImage || `https://ui-avatars.com/api/?name=${activeInquiry.studentId?.name}&background=random`} alt="avatar" className="w-10 h-10 rounded-full object-cover border-2 border-glass-border shadow-sm" />
                    <div>
                      <h2 className="font-bold text-base text-text-primary">{activeInquiry.studentId?.name}</h2>
                      <p className="text-xs text-text-secondary font-medium">Inquiry for: <span className="text-accent-warm">{activeInquiry.propertyId?.title}</span></p>
                    </div>
                  </>
                ) : (
                  <>
                    <img src={activeInquiry.ownerId?.profileImage || `https://ui-avatars.com/api/?name=${activeInquiry.ownerId?.name}&background=random`} alt="avatar" className="w-10 h-10 rounded-full object-cover border-2 border-glass-border shadow-sm" />
                    <div>
                      <h2 className="font-bold text-base text-text-primary">{activeInquiry.ownerId?.name}</h2>
                      <p className="text-xs text-text-secondary font-medium">Owner of: <span className="text-accent-warm">{activeInquiry.propertyId?.title}</span></p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              
              {(() => {
                const messagesToRender = activeInquiry.messages?.length > 0 ? activeInquiry.messages : [];
                // Fallback for old data without messages array
                if (messagesToRender.length === 0 && activeInquiry.message) {
                  messagesToRender.push({ sender: 'student', text: activeInquiry.message, timestamp: activeInquiry.createdAt });
                  if (activeInquiry.response) {
                    messagesToRender.push({ sender: 'owner', text: activeInquiry.response, timestamp: activeInquiry.respondedAt });
                  }
                }

                return messagesToRender.map((msg, index) => {
                  const isMyMessage = msg.sender === user.role;
                  return (
                    <AnimatedSection key={index} direction={isMyMessage ? 'left' : 'right'} delay={index * 100}>
                      <div className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl p-4 shadow-lg ${isMyMessage ? 'bg-accent-warm text-bg-base rounded-tr-none shadow-[0_0_15px_rgba(212,165,116,0.2)]' : 'bg-bg-surface border border-glass-border text-text-primary rounded-tl-none'}`}>
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
                          <p className={`text-[10px] mt-2 text-right font-medium ${isMyMessage ? 'text-bg-base/70' : 'text-text-tertiary'}`}>
                            {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                      </div>
                    </AnimatedSection>
                  );
                });
              })()}

            </div>

            {/* Chat Input Area */}
            {activeInquiry.status !== 'closed' ? (
              <div className="bg-bg-surface/80 backdrop-blur-md p-4 border-t border-glass-border">
                <form onSubmit={handleReplySubmit} className="flex gap-3">
                  <input 
                    type="text" 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type a message..." 
                    className="flex-1 px-5 py-3 text-sm bg-bg-base border border-glass-border rounded-full focus:bg-bg-surface focus:border-accent-warm focus:ring-2 focus:ring-accent-warm/20 transition-all outline-none text-text-primary placeholder-text-tertiary"
                  />
                  <button 
                    type="submit"
                    disabled={!replyText.trim()}
                    className="bg-accent-warm text-bg-base w-12 h-12 rounded-full flex items-center justify-center hover:bg-accent-warm-muted transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(212,165,116,0.3)] hover-lift"
                  >
                    <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                  </button>
                </form>
                {user.role === 'owner' && (
                  <div className="mt-3 text-center">
                    <button onClick={() => handleStatusUpdate(activeInquiry._id, 'closed')} className="text-[10px] text-text-secondary hover:text-error hover:underline uppercase tracking-widest font-bold transition-colors">
                      Close inquiry without replying
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-bg-surface/50 backdrop-blur-md p-4 border-t border-glass-border text-center text-xs text-text-secondary font-medium tracking-wide uppercase">
                This inquiry is closed.
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-text-tertiary relative z-10">
            <div className="w-24 h-24 rounded-full border border-glass-border bg-bg-surface flex items-center justify-center mb-6 shadow-inner animate-float">
              <svg className="w-12 h-12 text-glass-border" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            </div>
            <p className="text-xl font-medium font-heading text-text-secondary">Select a conversation</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inquiries;
