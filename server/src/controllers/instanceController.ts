import { Request, Response } from 'express';
import { getDatabaseForInstance } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

/**
 * Récupère l'instance ID depuis la requête
 */
function getInstanceIdFromRequest(req: Request): string {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const instanceId = process.env.INSTANCE_ID || 'default-instance';
      return instanceId;
    } catch {
      // Ignore les erreurs de décodage
    }
  }
  return process.env.INSTANCE_ID || 'default-instance';
}

/**
 * Instance Controller - Gère les membres et invitations des instances
 */
export class InstanceController {
  /**
   * Get all members of an instance
   * GET /api/instances/:instanceId/members
   */
  static async getInstanceMembers(req: Request, res: Response): Promise<void> {
    try {
      const instanceId = getInstanceIdFromRequest(req);
      const prisma = getDatabaseForInstance(instanceId);

      const members = await prisma.instanceMember.findMany({
        where: { instanceId, status: 'active' },
        orderBy: { createdAt: 'asc' },
      });

      res.json({
        success: true,
        data: members,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch members',
      });
    }
  }

  /**
   * Invite a new member to an instance
   * POST /api/instances/:instanceId/members/invite
   */
  static async inviteMember(req: Request, res: Response): Promise<void> {
    try {
      const instanceId = getInstanceIdFromRequest(req);
      const { email, role = 'viewer' } = req.body;
      const prisma = getDatabaseForInstance(instanceId);

      // Validate input
      if (!email) {
        res.status(400).json({
          success: false,
          error: 'Email is required',
        });
        return;
      }

      // Check if member already exists
      const existing = await prisma.instanceMember.findFirst({
        where: { instanceId, email },
      });

      if (existing) {
        res.status(400).json({
          success: false,
          error: 'User is already a member of this instance',
        });
        return;
      }

      // Create invitation token
      const token = uuidv4();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      // Create invitation record
      const invitation = await prisma.instanceInvitation.create({
        data: {
          instanceId,
          email,
          role,
          token,
          expiresAt,
          invitedBy: req.headers['x-user-id'] as string || 'unknown',
        },
      });

      // TODO: Send email with invitation link
      // await sendInvitationEmail(email, token, instanceId);

      // Generate invite link
      const inviteLink = `${req.protocol}://${req.get('host')}/invite/${instanceId}/${token}`;

      res.status(201).json({
        success: true,
        data: {
          invitation,
          inviteLink,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to invite member',
      });
    }
  }

  /**
   * Accept an invitation
   * POST /api/instances/:instanceId/accept-invitation/:token
   */
  static async acceptInvitation(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;
      const { userId, email, firstName, lastName } = req.body;
      const instanceId = getInstanceIdFromRequest(req);
      const prisma = getDatabaseForInstance(instanceId);

      // Find invitation
      const invitation = await prisma.instanceInvitation.findUnique({
        where: { token },
      });

      if (!invitation) {
        res.status(404).json({
          success: false,
          error: 'Invitation not found',
        });
        return;
      }

      // Check if expired
      if (invitation.expiresAt < new Date()) {
        await prisma.instanceInvitation.update({
          where: { id: invitation.id },
          data: { status: 'expired' },
        });
        res.status(400).json({
          success: false,
          error: 'Invitation has expired',
        });
        return;
      }

      // Create instance member
      const member = await prisma.instanceMember.create({
        data: {
          instanceId,
          userId: userId || email,
          email: invitation.email,
          firstName,
          lastName,
          role: invitation.role,
          status: 'active',
          invitedBy: invitation.invitedBy,
        },
      });

      // Update invitation status
      await prisma.instanceInvitation.update({
        where: { id: invitation.id },
        data: { status: 'accepted', acceptedAt: new Date() },
      });

      res.json({
        success: true,
        data: member,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to accept invitation',
      });
    }
  }

  /**
   * Update member role
   * PUT /api/instances/:instanceId/members/:memberId
   */
  static async updateMemberRole(req: Request, res: Response): Promise<void> {
    try {
      const { memberId } = req.params;
      const { role } = req.body;
      const instanceId = getInstanceIdFromRequest(req);
      const prisma = getDatabaseForInstance(instanceId);

      // Check if member exists
      const existing = await prisma.instanceMember.findFirst({
        where: { id: memberId, instanceId },
      });

      if (!existing) {
        res.status(404).json({
          success: false,
          error: 'Member not found',
        });
        return;
      }

      // Update role
      const member = await prisma.instanceMember.update({
        where: { id: memberId },
        data: { role },
      });

      res.json({
        success: true,
        data: member,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update member',
      });
    }
  }

  /**
   * Remove member from instance
   * DELETE /api/instances/:instanceId/members/:memberId
   */
  static async removeMember(req: Request, res: Response): Promise<void> {
    try {
      const { memberId } = req.params;
      const instanceId = getInstanceIdFromRequest(req);
      const prisma = getDatabaseForInstance(instanceId);

      // Check if member exists
      const existing = await prisma.instanceMember.findFirst({
        where: { id: memberId, instanceId },
      });

      if (!existing) {
        res.status(404).json({
          success: false,
          error: 'Member not found',
        });
        return;
      }

      // Remove member (soft delete by updating status)
      await prisma.instanceMember.update({
        where: { id: memberId },
        data: { status: 'removed' },
      });

      res.json({
        success: true,
        message: 'Member removed successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to remove member',
      });
    }
  }

  /**
   * Update online status
   * PUT /api/instances/:instanceId/members/:memberId/presence
   */
  static async updatePresence(req: Request, res: Response): Promise<void> {
    try {
      const { memberId } = req.params;
      const { isOnline, cursor } = req.body;
      const instanceId = getInstanceIdFromRequest(req);
      const prisma = getDatabaseForInstance(instanceId);

      const member = await prisma.instanceMember.update({
        where: { id: memberId, instanceId },
        data: {
          isOnline,
          lastSeen: new Date(),
        },
      });

      // TODO: Broadcast to other connected users via WebSocket
      // websocket.broadcast('presence:update', { memberId, isOnline, cursor });

      res.json({
        success: true,
        data: member,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update presence',
      });
    }
  }

  /**
   * Get pending invitations
   * GET /api/instances/:instanceId/invitations
   */
  static async getPendingInvitations(req: Request, res: Response): Promise<void> {
    try {
      const instanceId = getInstanceIdFromRequest(req);
      const prisma = getDatabaseForInstance(instanceId);

      const invitations = await prisma.instanceInvitation.findMany({
        where: { instanceId, status: 'pending' },
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        data: invitations,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch invitations',
      });
    }
  }

  /**
   * Resend invitation
   * POST /api/instances/:instanceId/invitations/:invitationId/resend
   */
  static async resendInvitation(req: Request, res: Response): Promise<void> {
    try {
      const { invitationId } = req.params;
      const instanceId = getInstanceIdFromRequest(req);
      const prisma = getDatabaseForInstance(instanceId);

      const invitation = await prisma.instanceInvitation.findFirst({
        where: { id: invitationId, instanceId },
      });

      if (!invitation) {
        res.status(404).json({
          success: false,
          error: 'Invitation not found',
        });
        return;
      }

      // Update expiry
      const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await prisma.instanceInvitation.update({
        where: { id: invitationId },
        data: { expiresAt: newExpiresAt },
      });

      // TODO: Resend email
      // await sendInvitationEmail(invitation.email, invitation.token, instanceId);

      res.json({
        success: true,
        message: 'Invitation resent successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to resend invitation',
      });
    }
  }
}

export default InstanceController;
