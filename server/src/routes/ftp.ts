import { Router, Request, Response } from 'express';
import { Client as SSHClient } from 'ssh2';

const router = Router();

export interface FtpItem {
  name: string;
  type: 'file' | 'dir';
  size: number;
  date?: string;
}

interface BrowseRequest {
  protocol: 'ftp' | 'ftps' | 'sftp';
  host: string;
  port?: number;
  user?: string;
  password?: string;
  privateKey?: string;
  path?: string;
}

/**
 * POST /api/ftp/browse
 * Returns directory listing for a given FTP/SFTP connection + path.
 * Used by the frontend FTP folder browser in the workflow editor.
 */
router.post('/browse', async (req: Request, res: Response) => {
  const { protocol, host, port, user, password, privateKey, path }: BrowseRequest = req.body;

  if (!host || !protocol) {
    return res.status(400).json({ success: false, error: 'host and protocol are required' });
  }

  if (!['ftp', 'ftps', 'sftp'].includes(protocol)) {
    return res.status(400).json({ success: false, error: 'Invalid protocol' });
  }

  try {
    let items: FtpItem[] = [];

    if (protocol === 'sftp') {
      items = await browseSftp({
        host,
        port: port || 22,
        user: user || '',
        password,
        privateKey,
        path: path || '/',
      });
    } else {
      items = await browseFtp({
        host,
        port: port || 21,
        user: user || 'anonymous',
        password: password || '',
        secure: protocol === 'ftps',
        path: path || '/',
      });
    }

    // Sort: directories first, then files, alphabetically
    items.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    res.json({ success: true, items });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Connection failed' });
  }
});

/**
 * Browse via FTP or FTPS using basic-ftp
 */
async function browseFtp(config: {
  host: string;
  port: number;
  user: string;
  password: string;
  secure: boolean;
  path: string;
}): Promise<FtpItem[]> {
  // dynamic import so build does not break if not yet installed
  const { Client } = await import('basic-ftp');
  const client = new Client(8000);
  client.ftp.verbose = false;

  try {
    await client.access({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      secure: config.secure,
      // Accept self-signed certs for FTPS in a workflow context
      secureOptions: config.secure ? { rejectUnauthorized: false } : undefined,
    });

    const list = await client.list(config.path);
    return list
      .filter(item => item.name !== '.' && item.name !== '..')
      .map(item => ({
        name: item.name,
        type: item.isDirectory ? 'dir' : 'file',
        size: item.size,
        date: item.modifiedAt?.toISOString(),
      }));
  } finally {
    client.close();
  }
}

/**
 * Browse via SFTP using ssh2
 */
function browseSftp(config: {
  host: string;
  port: number;
  user: string;
  password?: string;
  privateKey?: string;
  path: string;
}): Promise<FtpItem[]> {
  return new Promise((resolve, reject) => {
    const conn = new SSHClient();

    const timeout = setTimeout(() => {
      conn.end();
      reject(new Error('SFTP connection timeout (10s)'));
    }, 10_000);

    conn.on('ready', () => {
      conn.sftp((err, sftp) => {
        if (err) {
          clearTimeout(timeout);
          conn.end();
          return reject(err);
        }

        sftp.readdir(config.path, (err2, list) => {
          clearTimeout(timeout);
          conn.end();
          if (err2) return reject(err2);

          resolve(
            list
              .filter(f => f.filename !== '.' && f.filename !== '..')
              .map(f => {
                // S_IFDIR = 0o40000
                const isDir = !!(f.attrs.mode && f.attrs.mode & 0o40000);
                return {
                  name: f.filename,
                  type: isDir ? 'dir' : 'file',
                  size: f.attrs.size || 0,
                };
              }),
          );
        });
      });
    })
      .on('error', err => {
        clearTimeout(timeout);
        reject(err);
      })
      .connect({
        host: config.host,
        port: config.port,
        username: config.user,
        password: config.password,
        privateKey: config.privateKey,
        readyTimeout: 8_000,
      });
  });
}

export default router;
