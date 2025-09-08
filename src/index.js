import { Hono } from 'hono'
import { handleChatRequest } from './handlers.js'

const app = new Hono()

// CORS middleware
app.use('*', async (c, next) => {
  c.res.headers.append('Access-Control-Allow-Origin', '*')
  c.res.headers.append('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  c.res.headers.append('Access-Control-Allow-Headers', 'Content-Type')
  await next()
})

// API Routes
app.get('/', (c) => c.json({ message: 'Burme Mark API' }))
app.get('/api/health', (c) => c.json({ status: 'ok' }))
app.post('/api/chat', handleChatRequest)

export default app
