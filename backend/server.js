import app from './src/app.js'

const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST);

server.on('listening', () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});

server.on('error', (error) => {
  console.error('Server failed to start:', error.message);
  process.exit(1);
});
