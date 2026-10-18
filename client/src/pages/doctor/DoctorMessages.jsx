import { useState } from 'react';
import toast from 'react-hot-toast';

export default function DoctorMessages() {
  const [conversations] = useState([
    {
      id: 'p-1',
      patientName: 'Rajesh Sharma',
      age: '48 yrs, Male',
      bloodGroup: 'B+',
      lastMsg: 'Good morning Dr. Bharath. My morning BP reading was 128/84 mmHg.',
      time: '10:35 AM',
      unread: 1,
      messages: [
        { sender: 'doctor', text: 'Good morning Mr. Rajesh. Please record your blood pressure for 3 consecutive mornings after breakfast.', time: '09:15 AM' },
        { sender: 'patient', text: 'Good morning Dr. Bharath. My morning BP reading was 128/84 mmHg.', time: '10:35 AM' },
      ],
    },
    {
      id: 'p-2',
      patientName: 'Ananya Reddy',
      age: '32 yrs, Female',
      bloodGroup: 'O+',
      lastMsg: 'The allergic sneezing has reduced substantially with the nasal spray.',
      time: 'Yesterday',
      unread: 0,
      messages: [
        { sender: 'patient', text: 'Doctor, should I continue the antihistamine spray if my symptoms have stopped?', time: 'Yesterday 04:10 PM' },
        { sender: 'doctor', text: 'Please complete the remaining 2 days of the course to prevent recurrence.', time: 'Yesterday 04:30 PM' },
        { sender: 'patient', text: 'The allergic sneezing has reduced substantially with the nasal spray.', time: 'Yesterday 04:45 PM' },
      ],
    },
    {
      id: 'p-3',
      patientName: 'Vikram Patel',
      age: '61 yrs, Male',
      bloodGroup: 'A+',
      lastMsg: 'Uploaded my HbA1c lab report for your review.',
      time: '15 Oct',
      unread: 0,
      messages: [
        { sender: 'patient', text: 'Uploaded my HbA1c lab report for your review.', time: '15 Oct 11:20 AM' },
        { sender: 'doctor', text: 'Thank you Vikram. I reviewed the numbers and updated your metformin dosage in the new e-prescription.', time: '15 Oct 12:15 PM' },
      ],
    },
  ]);

  const [activeConv, setActiveConv] = useState(conversations[0]);
  const [inputText, setInputText] = useState('');
  const [convMessages, setConvMessages] = useState(conversations[0].messages);

  const handleSelectConv = (c) => {
    setActiveConv(c);
    setConvMessages(c.messages);
  };

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      sender: 'doctor',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setConvMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // Simulate patient acknowledgment
    setTimeout(() => {
      setConvMessages((prev) => [
        ...prev,
        {
          sender: 'patient',
          text: 'Thank you doctor, noted!',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 2000);
  };

  const handleQuickTemplate = (templateText) => {
    setInputText(templateText);
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text-primary, #0F172A)', margin: 0 }}>
          Patient Clinical Chat & Consultations
        </h1>
        <p style={{ color: 'var(--color-text-secondary, #64748B)', fontSize: 14, marginTop: 4 }}>
          Secure, HIPAA-compliant messaging with your active society patients.
        </p>
      </div>

      {/* Chat Container */}
      <div
        style={{
          background: 'white',
          borderRadius: 20,
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          height: 640,
          overflow: 'hidden',
        }}
      >
        {/* Left: Patient Thread List */}
        <div style={{ borderRight: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', fontWeight: 700, fontSize: 15, color: '#0F172A' }}>
            Patient Inquiries ({conversations.length})
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {conversations.map((c) => (
              <div
                key={c.id}
                onClick={() => handleSelectConv(c)}
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #F1F5F9',
                  cursor: 'pointer',
                  background: activeConv.id === c.id ? '#EFF6FF' : 'transparent',
                  borderLeft: activeConv.id === c.id ? '4px solid #0284C7' : '4px solid transparent',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: '#0F172A' }}>{c.patientName}</span>
                  <span style={{ fontSize: 11, color: '#94A3B8' }}>{c.time}</span>
                </div>
                <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>
                  {c.age} • <span style={{ color: '#DC2626', fontWeight: 600 }}>{c.bloodGroup}</span>
                </div>
                <div style={{ fontSize: 12, color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.lastMsg}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Active Chat Area */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white' }}>
          {/* Header */}
          <div style={{ padding: '14px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#EFF6FF', color: '#1D4ED8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16 }}>
                {activeConv.patientName.charAt(0)}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#0F172A' }}>{activeConv.patientName}</div>
                <div style={{ fontSize: 12, color: '#16A34A', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16A34A', display: 'inline-block' }} />
                  Active patient • {activeConv.age}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => toast.success(`Starting direct telemedicine video consultation with ${activeConv.patientName}...`)}
                className="btn btn-primary"
                style={{ fontSize: 12, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <span>📹</span>
                <span>Video Call</span>
              </button>
            </div>
          </div>

          {/* Quick Clinical Templates */}
          <div style={{ padding: '8px 20px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', gap: 8, overflowX: 'auto', whiteSpace: 'nowrap' }}>
            {[
              'Please share latest blood pressure log.',
              'Your e-Prescription has been updated.',
              'Kindly upload your latest fasting blood test.',
              'Take medications with warm water after meals.',
            ].map((tmpl, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickTemplate(tmpl)}
                style={{
                  fontSize: 11,
                  padding: '4px 10px',
                  background: 'white',
                  border: '1px solid #CBD5E1',
                  borderRadius: 14,
                  cursor: 'pointer',
                  color: '#475569',
                  fontWeight: 500,
                }}
              >
                {tmpl}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14, background: '#FDFDFD' }}>
            {convMessages.map((msg, i) => {
              const isDoctor = msg.sender === 'doctor';
              return (
                <div
                  key={i}
                  style={{
                    alignSelf: isDoctor ? 'flex-end' : 'flex-start',
                    maxWidth: '70%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isDoctor ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      padding: '12px 16px',
                      borderRadius: isDoctor ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                      background: isDoctor ? '#0284C7' : '#F1F5F9',
                      color: isDoctor ? 'white' : '#0F172A',
                      fontSize: 14,
                      lineHeight: 1.4,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    }}
                  >
                    {msg.text}
                  </div>
                  <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4, padding: '0 4px' }}>
                    {msg.time} {isDoctor && '• Sent ✓✓'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={handleSend}
            style={{ padding: '16px 20px', borderTop: '1px solid #E2E8F0', display: 'flex', gap: 10, background: 'white' }}
          >
            <input
              type="text"
              placeholder={`Write clinical message to ${activeConv.patientName}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: 12,
                border: '1px solid #CBD5E1',
                fontSize: 14,
                outline: 'none',
              }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '12px 20px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <span>Send</span>
              <span>➤</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
