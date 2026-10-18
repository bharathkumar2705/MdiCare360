import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

export default function TelemedicineRoom() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { accessToken, user } = useSelector((s) => s.auth);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const socketRef = useRef(null);
  const [status, setStatus] = useState('WAITING');
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState('');
  const localStreamRef = useRef(null);

  useEffect(() => {
    let timer;
    if (status === 'CONNECTED') {
      timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [status]);

  useEffect(() => {
    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
          auth: { token: accessToken },
        });
        socketRef.current = socket;

        socket.on('connect', () => {
          socket.emit('webrtc:join-room', { roomId: appointmentId });
          setStatus('WAITING');
        });

        socket.on('webrtc:user-joined', async ({ socketId }) => {
          setStatus('CONNECTING');
          const peer = createPeer(stream, socket);
          peerRef.current = peer;
          const offer = await peer.createOffer();
          await peer.setLocalDescription(offer);
          socket.emit('webrtc:offer', { roomId: appointmentId, offer, targetSocketId: socketId });
        });

        socket.on('webrtc:offer', async ({ offer, from }) => {
          const peer = createPeer(stream, socket);
          peerRef.current = peer;
          await peer.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);
          socket.emit('webrtc:answer', { answer, targetSocketId: from });
        });

        socket.on('webrtc:answer', async ({ answer }) => {
          await peerRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
          setStatus('CONNECTED');
        });

        socket.on('webrtc:ice-candidate', ({ candidate }) => {
          peerRef.current?.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
        });

        socket.on('webrtc:user-left', () => {
          setStatus('DISCONNECTED');
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
          toast('The other party has left the call.');
        });

        socket.on('message:received', (msg) => {
          setMessages((m) => [...m, msg]);
        });
      } catch (err) {
        toast.error('Could not access camera/microphone: ' + err.message);
      }
    };
    init();
    return () => {
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      peerRef.current?.close();
      socketRef.current?.disconnect();
    };
  }, [appointmentId, accessToken]);

  const createPeer = (stream, socket) => {
    const peer = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    stream.getTracks().forEach((t) => peer.addTrack(t, stream));
    peer.ontrack = (e) => { if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0]; setStatus('CONNECTED'); };
    peer.onicecandidate = (e) => { if (e.candidate) socket.emit('webrtc:ice-candidate', { candidate: e.candidate, targetSocketId: peer._targetSocketId }); };
    return peer;
  };

  const toggleMute = () => {
    localStreamRef.current?.getAudioTracks().forEach((t) => { t.enabled = muted; });
    setMuted(!muted);
  };

  const toggleCam = () => {
    localStreamRef.current?.getVideoTracks().forEach((t) => { t.enabled = camOff; });
    setCamOff(!camOff);
  };

  const endCall = () => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    socketRef.current?.emit('webrtc:leave-room', { roomId: appointmentId });
    navigate('/patient/appointments');
    toast.success('Consultation ended');
  };

  const sendMessage = () => {
    if (!msgInput.trim()) return;
    const msg = { content: msgInput, senderId: { _id: user._id, name: user.name }, createdAt: new Date(), local: true };
    setMessages((m) => [...m, msg]);
    setMsgInput('');
  };

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div style={{ height: '100vh', background: '#0A1628', display: 'flex', overflow: 'hidden' }}>
      {/* Main video */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
        {/* Status bar */}
        <div style={{ position: 'absolute', top: 16, left: 16, right: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ padding: '6px 16px', borderRadius: 99, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: status === 'CONNECTED' ? '#10B981' : status === 'WAITING' ? '#F59E0B' : '#EF4444', display: 'inline-block' }} />
              <span style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>
                {status === 'WAITING' ? 'Waiting for other party...' : status === 'CONNECTED' ? `Connected • ${fmt(duration)}` : status === 'DISCONNECTED' ? 'Call ended' : 'Connecting...'}
              </span>
            </div>
          </div>
          <div style={{ padding: '6px 16px', borderRadius: 99, background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: 12 }}>
            MediCare360 Consultation
          </div>
        </div>

        {/* Remote video */}
        <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', background: '#0A1628' }} />

        {/* No remote video placeholder */}
        {status !== 'CONNECTED' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, marginBottom: 16 }}>👨‍⚕️</div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 18, fontWeight: 600 }}>
              {status === 'WAITING' ? 'Waiting for doctor to join...' : 'Connecting...'}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 8 }}>Your camera is active. Please wait.</p>
          </div>
        )}

        {/* Local video PiP */}
        <video ref={localVideoRef} autoPlay playsInline muted
          style={{ position: 'absolute', bottom: 100, right: 16, width: 160, height: 120, objectFit: 'cover', borderRadius: 12, border: '2px solid rgba(255,255,255,0.3)', background: '#1a2a4a' }} />

        {/* Controls */}
        <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 16, zIndex: 10 }}>
          {[
            { icon: muted ? '🔇' : '🎤', label: muted ? 'Unmute' : 'Mute', action: toggleMute, active: muted },
            { icon: camOff ? '📷' : '📹', label: camOff ? 'Show Cam' : 'Hide Cam', action: toggleCam, active: camOff },
          ].map(({ icon, label, action, active }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <button className="video-control-btn" onClick={action} style={{ background: active ? 'rgba(239,68,68,0.8)' : 'rgba(255,255,255,0.15)', color: 'white' }} title={label}>{icon}</button>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, marginTop: 4 }}>{label}</div>
            </div>
          ))}
          <div style={{ textAlign: 'center' }}>
            <button className="video-control-btn danger" onClick={endCall} title="End Call">📵</button>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, marginTop: 4 }}>End Call</div>
          </div>
        </div>
      </div>

      {/* Chat panel */}
      <div style={{ width: 320, background: 'rgba(255,255,255,0.05)', borderLeft: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'white', fontWeight: 700 }}>💬 In-call Chat</div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {messages.length === 0 && <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, textAlign: 'center', marginTop: 40 }}>No messages yet</p>}
          {messages.map((m, i) => (
            <div key={i} style={{ alignSelf: m.local ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
              <div style={{ padding: '8px 14px', borderRadius: 16, background: m.local ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)', color: 'white', fontSize: 13 }}>
                {m.content}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2, textAlign: m.local ? 'right' : 'left' }}>
                {m.senderId?.name}
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: 8 }}>
          <input value={msgInput} onChange={(e) => setMsgInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..." style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: 13 }} />
          <button onClick={sendMessage} style={{ padding: '8px 14px', borderRadius: 8, background: 'var(--color-primary)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700 }}>→</button>
        </div>
      </div>
    </div>
  );
}
