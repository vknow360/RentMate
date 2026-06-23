import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

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
    <div className="flex justify-center items-center h-[calc(100vh-64px)] bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>
  );

  return (
    <div className="bg-gray-50 h-[calc(100vh-64px)] flex overflow-hidden">
      
      {/* LEFT PANE: Conversation List */}
      <div className="w-full md:w-1/3 lg:w-1/4 bg-white border-r border-gray-200 flex flex-col h-full z-10">
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <h1 className="text-base font-bold text-gray-900">
            {user.role === 'owner' ? 'Inbox' : 'Sent Inquiries'}
          </h1>
        </div>
        
        <div className="overflow-y-auto flex-1 p-2 space-y-1">
          {inquiries.length > 0 ? (
            inquiries.map(inquiry => (
              <button 
                key={inquiry._id} 
                onClick={() => setActiveInquiryId(inquiry._id)}
                className={`w-full text-left p-2.5 rounded transition-colors flex flex-col gap-1 ${activeInquiryId === inquiry._id ? 'bg-primary-50 border border-primary-100 shadow-sm' : 'hover:bg-gray-50 border border-transparent'}`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${inquiry.status === 'pending' ? 'bg-red-100 text-red-700' : inquiry.status === 'responded' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {inquiry.status === 'pending' ? (user.role === 'owner' ? 'Needs Reply' : 'Awaiting Reply') : inquiry.status === 'responded' ? (user.role === 'owner' ? 'Replied' : 'Owner Replied') : 'Closed'}
                  </span>
                  <span className="text-[10px] text-gray-400">{new Date(inquiry.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="font-bold text-sm text-gray-900 truncate">
                  {user.role === 'owner' ? inquiry.studentId?.name : inquiry.ownerId?.name}
                </h3>
                <p className="text-[11px] text-gray-500 font-medium truncate">Re: {inquiry.propertyId?.title}</p>
                <p className="text-xs text-gray-600 truncate mt-0.5">{inquiry.messages?.length > 0 ? inquiry.messages[inquiry.messages.length - 1].text : inquiry.message}</p>
              </button>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500 text-sm">No messages found.</div>
          )}
        </div>
      </div>

      {/* RIGHT PANE: Active Chat */}
      <div className={`flex-1 flex flex-col bg-gray-50 h-full ${!activeInquiryId ? 'hidden md:flex' : 'flex'}`}>
        {activeInquiry ? (
          <>
            {/* Chat Header */}
            <div className="bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center shadow-sm z-10">
              <div className="flex items-center gap-4">
                {user.role === 'owner' ? (
                  <>
                    <img src={activeInquiry.studentId?.profileImage || 'https://via.placeholder.com/40'} alt="avatar" className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                    <div>
                      <h2 className="font-bold text-sm text-gray-900">{activeInquiry.studentId?.name}</h2>
                      <p className="text-xs text-gray-500 font-medium">Inquiry for: {activeInquiry.propertyId?.title}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <img src={activeInquiry.ownerId?.profileImage || 'https://via.placeholder.com/40'} alt="avatar" className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                    <div>
                      <h2 className="font-bold text-gray-900">{activeInquiry.ownerId?.name}</h2>
                      <p className="text-xs text-gray-500 font-medium">Owner of: {activeInquiry.propertyId?.title}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
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
                    <div key={index} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-2xl p-4 shadow-sm ${isMyMessage ? 'bg-primary-600 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'}`}>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
                        <p className={`text-[10px] mt-2 text-right ${isMyMessage ? 'text-primary-200' : 'text-gray-400'}`}>
                          {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    </div>
                  );
                });
              })()}

            </div>

            {/* Chat Input Area */}
            {activeInquiry.status !== 'closed' ? (
              <div className="bg-white p-3 border-t border-gray-200">
                <form onSubmit={handleReplySubmit} className="flex gap-2">
                  <input 
                    type="text" 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type a message..." 
                    className="flex-1 px-4 py-2 text-sm bg-gray-100 border-transparent rounded-full focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500 transition-colors"
                  />
                  <button 
                    type="submit"
                    disabled={!replyText.trim()}
                    className="bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                  </button>
                </form>
                {user.role === 'owner' && (
                  <div className="mt-2 text-center">
                    <button onClick={() => handleStatusUpdate(activeInquiry._id, 'closed')} className="text-[10px] text-gray-400 hover:text-gray-600 underline uppercase tracking-wide">
                      Close inquiry without replying
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-100 p-3 border-t border-gray-200 text-center text-xs text-gray-500 font-medium">
                This inquiry is closed.
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            <p className="text-lg font-medium">Select a conversation to view</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inquiries;
