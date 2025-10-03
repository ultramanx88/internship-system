import { NextApiRequest } from 'next';
import { NextApiResponseServerIO } from '@/lib/socket';
import { initSocket } from '@/lib/socket';

export default function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (!res.socket.server.io) {
    console.log('🔌 Setting up Socket.io server...');
    const io = initSocket(res.socket.server);
    res.socket.server.io = io;
  } else {
    console.log('✅ Socket.io server already running');
  }
  res.end();
}