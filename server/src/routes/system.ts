import { Router, Request, Response } from 'express';
import https from 'https';
import os from 'os';

const router = Router();

const CURRENT_VERSION = process.env.APP_VERSION || '1.0.0';
const UPDATE_CHECK_URL =
  process.env.UPDATE_CHECK_URL ||
  'https://api.github.com/repos/logicai-io/logicai/releases/latest';

function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] ?? 0;
    const nb = pb[i] ?? 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
}

function httpsGet(url: string, timeoutMs = 6000): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          'User-Agent': `LogicAI/${CURRENT_VERSION}`,
          Accept: 'application/vnd.github.v3+json',
        },
      },
      (res) => {
        // Follow redirects
        if (
          res.statusCode &&
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          httpsGet(res.headers.location, timeoutMs).then(resolve).catch(reject);
          return;
        }
        if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => resolve(data));
        res.on('error', reject);
      }
    );
    req.on('error', reject);
    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error('Request timeout'));
    });
  });
}

/**
 * GET /api/system/info
 * Returns current version, uptime and memory info.
 */
router.get('/info', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      version: CURRENT_VERSION,
      buildDate: process.env.BUILD_DATE ?? null,
      nodeVersion: process.version,
      uptime: Math.floor(process.uptime()),
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
      },
    },
  });
});

/**
 * GET /api/system/check-update
 * Checks UPDATE_CHECK_URL (default: GitHub releases) for a newer version.
 * Falls back gracefully if the request fails.
 */
router.get('/check-update', async (_req: Request, res: Response) => {
  try {
    const raw = await httpsGet(UPDATE_CHECK_URL);
    const data = JSON.parse(raw) as any;

    // GitHub releases format: tag_name = "v1.2.3"
    // Plain format: { version: "1.2.3" }
    const latestVersion = (data.tag_name || data.version || CURRENT_VERSION).replace(/^v/, '');
    const hasUpdate = compareVersions(latestVersion, CURRENT_VERSION) > 0;

    res.json({
      success: true,
      data: {
        currentVersion: CURRENT_VERSION,
        latestVersion,
        hasUpdate,
        changelog: data.body || data.changelog || null,
        releaseDate: data.published_at || data.releaseDate || null,
        releaseUrl: data.html_url || null,
      },
    });
  } catch (err: any) {
    // Distinguish 404 / empty update URL from real network errors
    const msg: string = err?.message ?? '';
    const isNotConfigured =
      !UPDATE_CHECK_URL ||
      UPDATE_CHECK_URL.includes('logicai-io/logicai') || // default placeholder
      msg.includes('HTTP 404') ||
      msg.includes('HTTP 403') ||
      msg.includes('Not Found');
    const isNetworkError =
      msg.includes('timeout') ||
      msg.includes('ENOTFOUND') ||
      msg.includes('ECONNREFUSED') ||
      msg.includes('ECONNRESET');

    res.json({
      success: true,
      data: {
        currentVersion: CURRENT_VERSION,
        latestVersion: CURRENT_VERSION,
        hasUpdate: false,
        checkFailed: true,
        checkFailedReason: isNotConfigured
          ? 'not_configured'
          : isNetworkError
          ? 'network'
          : 'unknown',
      },
    });
  }
});

export default router;
