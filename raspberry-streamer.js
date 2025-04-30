const { spawn } = require('child_process');

const STREAM_URL = 'rtmp://a.rtmp.youtube.com/live2';
const STREAM_KEY = '2fc1-txhh-sv0a-ut7s-4y01'; // Ganti dengan milikmu

const libcamera = spawn('libcamera-vid', [
  '-t', '0',
  '--width', '640',
  '--height', '480',
  '--framerate', '30',
  '--codec', 'yuv420',
  '--inline',
  '--nopreview',
  '-o', '-'
]);

const ffmpeg = spawn('ffmpeg', [
  // Video input
  '-f', 'rawvideo',
  '-pix_fmt', 'yuv420p',
  '-s', '640x480',
  '-r', '30',
  '-i', 'pipe:0',

  // Audio dummy input
  '-f', 'lavfi',
  '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100',

  // Output settings
  '-shortest',
  '-c:v', 'libx264',
  '-preset', 'veryfast',
  '-b:v', '2000k',
  '-maxrate', '2000k',
  '-bufsize', '4000k',
  '-g', '60',
  '-pix_fmt', 'yuv420p',

  '-c:a', 'aac',
  '-ar', '44100',
  '-b:a', '128k',

  '-f', 'flv',
  `${STREAM_URL}/${STREAM_KEY}`
]);

// Pipe video output to ffmpeg input
libcamera.stdout.pipe(ffmpeg.stdin);

// Logging
ffmpeg.stderr.on('data', (data) => {
  console.error(`[FFmpeg] ${data}`);
});
libcamera.stderr.on('data', (data) => {
  console.error(`[libcamera-vid] ${data}`);
});

ffmpeg.on('close', (code) => {
  console.log(`FFmpeg exited with code ${code}`);
});
libcamera.on('close', (code) => {
  console.log(`libcamera-vid exited with code ${code}`);
});
