import { useState } from 'react';
import toast from 'react-hot-toast';

export default function PatientMessages() {
  const [conversations] = useState([
    { id: '1', doctorName: 'Dr. Priya Sharma', specialization: 'Cardiology', lastMsg: 'Your ECG readings look stable. Continue current dosage.', time: '10:30 AM', unread: 0 },
    { id: '2', doctorName: 'Dr. Arjun Mehta', specialization: 'Dermatology', lastMsg: 'Please upload a photo of the affected area.', time: 'Yesterday', unread: 1 },
  ]);
  const [activeConv, setActiveConv] = useState(conversations[0]);
  const [messages, setMessages] = useState([
    { sender: 'doctor', text: 'Hello! How are you feeling after starting the medication?', time: '10:15 AM' },
    { sender: 'patient', text: 'Good morning Dr. Priya. The palpitations have significantly reduced.', time: '10:20 AM' },
    { sender: 'doctor', text: 'Your ECG readings look stable. Continue current dosage.', time: '10:30 AM' },
  ]);
  const [inputMsg, setInputMsg] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    const newMsg = { sender: 'patient', text: inputMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages([...messages, newMsg]);
    setInputMsg('');
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: 'doctor', text: 'Thank you for the update. I have updated your consultation chart.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ]);
    }, 1500);
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text-primary, #0F172A)', margin: 0 }}>
          Clinical Consultations & Messaging
        </h1>
        <p style={{ color: 'var(--color-text-secondary, #64748B)', fontSize: 14, marginTop: 4 }}>
          End-to-end encrypted messaging with your verified healthcare providers.
        </p>
      </div>

      <div
        style={{
          background: 'white',
          borderRadius: 20,
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          height: 600,
          overflow: 'hidden',
        }}
      >
        {/* Left conversations list */}
        <div style={{ borderRight: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', fontWeight: 700, fontSize: 15, color: '#0F172A' }}>
            Practitioners
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {conversations.map((c) => (
              <div
                key={c.id}
                onClick={() => setActiveConv(c)}
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #F1F5F9',
                  cursor: 'pointer',
                  background: activeConv.id === c.id ? '#EFF6FF' : 'transparent',
                  borderLeft: activeConv.id === c.id ? '4px solid #0284C7' : '4px solid transparent',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: '#0F172A' }}>{c.doctorName}</span>
                  <span style={{ fontSize: 11, color: '#94A3B8' }}>{c.time}</span>
                </div>
                <div style={{ fontSize: 12, color: '#0284C7', fontWeight: 600, marginBottom: 4 }}>
                  {c.specialization}
                </div>
                <div style={{ fontSize: 12, color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.lastMsg}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Chat Area */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white' }}>
          {/* Top Chat Bar */}
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#0F172A' }}>{activeConv.doctorName}</div>
              <div style={{ fontSize: 12, color: '#16A34A', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16A34A', display: 'inline-block' }} />
                Online & Verified
              </div>
            </div>
            <button
              onClick={() => toast.success('Starting secure telehealth connection...')}
              className="btn btn-secondary"
              style={{ fontSize: 12, padding: '6px 14px' }}
            >
              📹 Video Call
            </button>
          </div>

          {/* Messages list */}
          <div style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: m.sender === 'patient' ? 'flex-end' : 'flex-start',
                  maxWidth: '70%',
                  background: m.sender === 'patient' ? '#0284C7' : '#F1F5F9',
                  color: m.sender === 'patient' ? 'white' : '#0F172A',
                  padding: '12px 18px',
                  borderRadius: 16,
                  borderBottomRightRadius: m.sender === 'patient' ? 4 : 16,
                  borderBottomLeftRadius: m.sender === 'patient' ? 16 : 4,
                  fontSize: 14,
                  lineHeight: 1.5,
                }}
              >
                <div>{m.text}</div>
                <div
                  style={{
                    fontSize: 10,
                    marginTop: 4,
                    textAlign: 'right',
                    color: m.sender === 'patient' ? 'rgba(255,255,255,0.7)' : '#94A3B8',
                  }}
                >
                  {m.time}
                </div>
              </div>
            ))}
          </div>

          {/* Input Box */}
          <form onSubmit={handleSend} style={{ padding: '16px 20px', borderTop: '1px solid #E2E8F0', display: 'flex', gap: 12 }}>
            <input
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Type your health update or clinical question..."
              className="form-input"
              style={{ flex: 1, padding: '12px 16px', borderRadius: 12, border: '1px solid #CBD5E1' }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0 24px', fontWeight: 700 }}>
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}