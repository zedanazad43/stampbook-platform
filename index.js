// Entry point for Stampcoin Platform
// Starts the main server
try {
  require('./server');
} catch (err) {
  console.error('Failed to start server:', err.message);
  process.exit(1);
}
