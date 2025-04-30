// stream-to-youtube.js

const { spawn } = require('child_process');

// ==========================
// GANTI SESUAI PUNYAMU
// ==========================
const STREAM_URL = 'rtmp://a.rtmp.youtube.com/live2';
const STREAM_KEY = 'abcd-1234-efgh-5678'; // <--- GANTI DENGAN STREAM KEY ANDA

// ==========================
// OPSIONAL: Gunakan audio dari mic USB (jika ada)
// - untuk tahu device: jalankan `arecord -l` di terminal
// ==========================
// const AUDIO_DEVICE = 'hw:1,0'; // Ganti jika perlu

// ==========================
// Jalankan ffmpeg
// ==========================

const ffmpegArgs = [
  '-f', 'v4l2',             // format video input
  '-framerate', '30',       // frame rate
  '-video_size', '640x480', // resolusi video
  '-i', '/dev/video0',      // kamera input

  // Jika ingin audio, hapus komentar di bawah ini
  // '-f', 'alsa',
  // '-i', AUDIO_DEVICE,

  '-f', 'flv',              // output format untuk RTMP
  '-vcodec', 'libx264',
  '-pix_fmt', 'yuv420p',
  '-preset', 'veryfast',
  '-g', '50',
  '-b:v', '2500k',
  '-maxrate', '2500k',
  '-bufsize', '5000k',
  '-an',                    // hilangkan audio, hapus ini kalau kamu pakai mic
  `${STREAM_URL}/${STREAM_KEY}`
];

console.log('🚀 Starting YouTube Live Stream...');
console.log('Streaming to:', `${STREAM_URL}/${STREAM_KEY}`);

const ffmpeg = spawn('ffmpeg', ffmpegArgs);

// Log output ffmpeg ke terminal
ffmpeg.stderr.on('data', (data) => {
  console.error(`[FFmpeg] ${data.toString()}`);
});

ffmpeg.on('close', (code) => {
  console.log(`⚠️ FFmpeg exited with code ${code}`);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Stopping stream...');
  ffmpeg.kill('SIGINT');
  process.exit();
});
