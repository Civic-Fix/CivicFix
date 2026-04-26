import app from './src/app.js'

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});