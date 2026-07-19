/**
 * Members & Invitations controller
 * Handles workspace membership, invitations, role management and notifications.
 */

import { Request, Response } from 'express';
import { getDatabaseForInstance } from '../config/database';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';

const INSTANCE_ID = () => process.env.INSTANCE_ID || 'default-instance';
const INSTANCE_NAME = process.env.INSTANCE_NAME || 'LogicAI';
const EXTERNAL_PORT = process.env.EXTERNAL_PORT || '3000';

const ROLES = ['admin', 'editor', 'viewer'] as const;
type Role = (typeof ROLES)[number];

const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrateur',
  editor: 'Éditeur',
  viewer: 'Observateur',
};

// ──── Email helper ─────────────────────────────────────────────────────────────

function createTransporter() {
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  if (!host) return null;
  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_USER || '',
      pass: process.env.SMTP_PASS || process.env.EMAIL_PASS || '',
    },
  });
}

async function sendInviteEmail(to: string, token: string, role: Role) {
  const transporter = createTransporter();
  if (!transporter) return;

  const baseUrl = `http://localhost:${EXTERNAL_PORT}`;
  const acceptUrl = `${baseUrl}/invite/accept?token=${token}`;
  const roleLabel = ROLE_LABELS[role];

  await transporter.sendMail({
    from: `"${INSTANCE_NAME}" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
    to,
    subject: `Invitation à rejoindre ${INSTANCE_NAME}`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:32px;background:#0d0d0d;color:#e5e7eb;border-radius:12px;">
        <img src="${baseUrl}/LogicAI.ico" alt="LogicAI" style="width:40px;margin-bottom:16px;" />
        <h2 style="color:#f97316;margin:0 0 8px;">Invitation à rejoindre ${INSTANCE_NAME}</h2>
        <p style="margin:0 0 24px;color:#9ca3af;">Vous avez été invité(e) à rejoindre cet espace en tant que <strong style="color:#e5e7eb;">${roleLabel}</strong>.</p>
        <a href="${acceptUrl}"
           style="display:inline-block;padding:12px 28px;background:#f97316;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">
          Accepter l'invitation →
        </a>
        <p style="margin-top:24px;color:#6b7280;font-size:12px;">Ce lien est valable 7 jours. Si vous n'attendiez pas cette invitation, ignorez cet email.</p>
      </div>
    `,
  }).catch((err: Error) => {
    console.warn('[members] Email send failed:', err.message);
  });
}

// ──── Helper: generate unique uuid-like token ──────────────────────────────────

function newId() {
  return crypto.randomUUID();
}

// ──── GET /api/members ─────────────────────────────────────────────────────────

export const getMembers = async (req: Request, res: Response) => {
  try {
    const prisma = getDatabaseForInstance(INSTANCE_ID()) as any;
    const instanceId = INSTANCE_ID();

    let members = await prisma.instanceMember.findMany({
      where: { instanceId, status: 'active' },
      orderBy: { createdAt: 'asc' },
    });

    // Bootstrap: if no members, promote the current user as admin
    if (members.length === 0 && req.userId) {
      const me = await prisma.user.findUnique({ where: { id: req.userId } });
      if (me) {
        const bootstrapped = await prisma.instanceMember.upsert({
          where: { instanceId_userId: { instanceId, userId: me.id } },
          create: {
            id: newId(),
            instanceId,
            userId: me.id,
            email: me.email,
            firstName: me.firstName ?? null,
            lastName: me.lastName ?? null,
            role: 'admin',
            status: 'active',
          },
          update: { status: 'active', role: 'admin' },
        });
        members = [bootstrapped];
      }
    }

    return res.json({ success: true, data: members });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ──── GET /api/members/search?q= ──────────────────────────────────────────────

export const searchUser = async (req: Request, res: Response) => {
  try {
    const q = String(req.query.q || '').trim();
    if (!q || q.length < 2) return res.json({ success: true, data: null });

    const prisma = getDatabaseForInstance(INSTANCE_ID()) as any;
    const instanceId = INSTANCE_ID();

    // Exclude users already active or pending members
    const existingMembers = await prisma.instanceMember.findMany({
      where: { instanceId, status: { in: ['active', 'pending'] } },
      select: { userId: true },
    });
    const existingInvitations = await prisma.instanceInvitation.findMany({
      where: { instanceId, status: 'pending' },
      select: { email: true },
    });

    const excludeUserIds: string[] = existingMembers.map((m: any) => m.userId);
    const excludeEmails: string[] = existingInvitations.map((i: any) => i.email);

    const user = await prisma.user.findFirst({
      where: {
        AND: [
          { id: { notIn: excludeUserIds } },
          { email: { notIn: excludeEmails } },
          {
            OR: [
              { email: { contains: q } },
              { firstName: { contains: q } },
              { lastName: { contains: q } },
            ],
          },
        ],
      },
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    return res.json({ success: true, data: user ?? null });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ──── POST /api/members/invite ─────────────────────────────────────────────────

export const inviteMember = async (req: Request, res: Response) => {
  try {
    const { email, role = 'viewer' } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, message: 'Email requis' });
    }
    if (!ROLES.includes(role as Role)) {
      return res.status(400).json({ success: false, message: 'Rôle invalide' });
    }

    const prisma = getDatabaseForInstance(INSTANCE_ID()) as any;
    const instanceId = INSTANCE_ID();

    // Duplicate invitation check
    const existingInvite = await prisma.instanceInvitation.findFirst({
      where: { instanceId, email: email.toLowerCase(), status: 'pending' },
    });
    if (existingInvite) {
      return res.status(409).json({ success: false, message: 'Une invitation est déjà en attente pour cet email' });
    }

    // Already a member check
    const existingMember = await prisma.instanceMember.findFirst({
      where: { instanceId, email: email.toLowerCase(), status: 'active' },
    });
    if (existingMember) {
      return res.status(409).json({ success: false, message: 'Cet utilisateur est déjà membre' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invitation = await prisma.instanceInvitation.create({
      data: {
        id: newId(),
        instanceId,
        email: email.toLowerCase(),
        role,
        token,
        invitedBy: req.userId ?? null,
        expiresAt,
        status: 'pending',
      },
    });

    // If user already registered → create notification
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existingUser) {
      await prisma.notification.create({
        data: {
          id: newId(),
          userId: existingUser.id,
          instanceId,
          type: 'invitation',
          title: `Invitation à rejoindre ${INSTANCE_NAME}`,
          body: `Vous avez été invité(e) en tant que ${ROLE_LABELS[role as Role]}.`,
          data: JSON.stringify({ invitationToken: token, invitationId: invitation.id }),
          read: false,
        },
      }).catch(() => {
        console.warn('[members] Could not create notification (table may not exist yet)');
      });
    }

    // Send email async (non-blocking)
    sendInviteEmail(email, token, role as Role).catch(() => {});

    return res.status(201).json({ success: true, data: invitation });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ──── GET /api/members/invitations ────────────────────────────────────────────

export const getInvitations = async (req: Request, res: Response) => {
  try {
    const prisma = getDatabaseForInstance(INSTANCE_ID()) as any;
    const invitations = await prisma.instanceInvitation.findMany({
      where: { instanceId: INSTANCE_ID(), status: 'pending' },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: invitations });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ──── DELETE /api/members/invitations/:id ─────────────────────────────────────

export const cancelInvitation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const prisma = getDatabaseForInstance(INSTANCE_ID()) as any;
    await prisma.instanceInvitation.updateMany({
      where: { id, instanceId: INSTANCE_ID(), status: 'pending' },
      data: { status: 'cancelled' },
    });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ──── POST /api/members/invitations/:token/accept  (public) ───────────────────

export const acceptInvitation = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const prisma = getDatabaseForInstance(INSTANCE_ID()) as any;

    const invitation = await prisma.instanceInvitation.findUnique({ where: { token } });
    if (!invitation || invitation.status !== 'pending') {
      return res.status(404).json({ success: false, message: 'Invitation invalide ou déjà utilisée' });
    }
    if (new Date(invitation.expiresAt) < new Date()) {
      await prisma.instanceInvitation.update({ where: { token }, data: { status: 'expired' } });
      return res.status(410).json({ success: false, message: "L'invitation a expiré" });
    }

    const user = await prisma.user.findUnique({ where: { email: invitation.email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Aucun compte trouvé pour cet email. Inscrivez-vous d'abord.",
      });
    }

    // Upsert member
    await prisma.instanceMember.upsert({
      where: { instanceId_userId: { instanceId: invitation.instanceId, userId: user.id } },
      create: {
        id: newId(),
        instanceId: invitation.instanceId,
        userId: user.id,
        email: user.email,
        firstName: user.firstName ?? null,
        lastName: user.lastName ?? null,
        role: invitation.role,
        invitedBy: invitation.invitedBy ?? null,
        status: 'active',
      },
      update: { status: 'active', role: invitation.role },
    });

    // Mark invitation accepted
    await prisma.instanceInvitation.update({
      where: { token },
      data: { status: 'accepted', acceptedAt: new Date() },
    });

    // Mark related invitation notifications as read
    await prisma.notification.updateMany({
      where: { userId: user.id, type: 'invitation', instanceId: invitation.instanceId },
      data: { read: true },
    }).catch(() => {});

    return res.json({ success: true, message: "Bienvenue ! Vous avez rejoint l'instance." });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ──── PATCH /api/members/invitations/:token/decline  (public) ─────────────────

export const declineInvitation = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const prisma = getDatabaseForInstance(INSTANCE_ID()) as any;
    await prisma.instanceInvitation.updateMany({
      where: { token, status: 'pending' },
      data: { status: 'cancelled' },
    });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ──── PATCH /api/members/:memberId/role ───────────────────────────────────────

export const updateMemberRole = async (req: Request, res: Response) => {
  try {
    const { memberId } = req.params;
    const { role } = req.body;
    if (!ROLES.includes(role as Role)) {
      return res.status(400).json({ success: false, message: 'Rôle invalide' });
    }
    const prisma = getDatabaseForInstance(INSTANCE_ID()) as any;
    await prisma.instanceMember.updateMany({
      where: { id: memberId, instanceId: INSTANCE_ID() },
      data: { role },
    });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ──── DELETE /api/members/:memberId ───────────────────────────────────────────

export const removeMember = async (req: Request, res: Response) => {
  try {
    const { memberId } = req.params;
    const prisma = getDatabaseForInstance(INSTANCE_ID()) as any;
    await prisma.instanceMember.updateMany({
      where: { id: memberId, instanceId: INSTANCE_ID() },
      data: { status: 'removed' },
    });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ──── GET /api/notifications ──────────────────────────────────────────────────

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const prisma = getDatabaseForInstance(INSTANCE_ID()) as any;
    const notifications = await prisma.notification.findMany({
      where: { userId: req.userId, instanceId: INSTANCE_ID() },
      orderBy: { createdAt: 'desc' },
      take: 30,
    }).catch(() => []);
    return res.json({ success: true, data: notifications });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ──── PATCH /api/notifications/:id/read ──────────────────────────────────────

export const markNotificationRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const prisma = getDatabaseForInstance(INSTANCE_ID()) as any;
    await prisma.notification.updateMany({
      where: { id, userId: req.userId },
      data: { read: true },
    }).catch(() => {});
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ──── PATCH /api/notifications/read-all ──────────────────────────────────────

export const markAllNotificationsRead = async (req: Request, res: Response) => {
  try {
    const prisma = getDatabaseForInstance(INSTANCE_ID()) as any;
    await prisma.notification.updateMany({
      where: { userId: req.userId, instanceId: INSTANCE_ID(), read: false },
      data: { read: true },
    }).catch(() => {});
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
