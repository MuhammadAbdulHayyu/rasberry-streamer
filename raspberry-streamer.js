const wrtc = require('wrtc');
const WebSocket = require('ws');
const { spawn } = require('child_process');

const ws = new WebSocket('ws://YOUR_SIGNALING_SERVER_IP:3001');

let pc;

ws.on('open', async () => {
  console.log('Connected to signaling server');
  
  pc = new wrtc.RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
  });

  const ffmpeg = spawn('ffmpeg', [
    '-f', 'v4l2',
    '-i', '/dev/video0',
    '-f', 'rawvideo',
    '-pix_fmt', 'yuv420p',
    '-'
  ]);

  const videoSource = new wrtc.nonstandard.RTCVideoSource();
  const track = videoSource.createTrack();
  pc.addTrack(track);

  ffmpeg.stdout.on('data', (data) => {
    videoSource.onFrame({ width: 640, height: 480, data });
  });

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      ws.send(JSON.stringify({ type: 'candidate', candidate: event.candidate }));
    }
  };

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  ws.send(JSON.stringify({ type: 'offer', sdp: pc.localDescription }));
});

ws.on('message', async (message) => {
  const data = JSON.parse(message);

  if (data.type === 'answer') {
    await pc.setRemoteDescription(new wrtc.RTCSessionDescription(data));
  } else if (data.type === 'candidate') {
    await pc.addIceCandidate(new wrtc.RTCIceCandidate(data.candidate));
  }
});
