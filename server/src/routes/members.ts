import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getMembers,
  searchUser,
  inviteMember,
  getInvitations,
  cancelInvitation,
  acceptInvitation,
  declineInvitation,
  updateMemberRole,
  removeMember,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../controllers/membersController';

const router = Router();

// ── Members ──────────────────────────────────────────────────────────────────
router.get('/', authMiddleware, getMembers);
router.get('/search', authMiddleware, searchUser);
router.post('/invite', authMiddleware, inviteMember);

// ── Invitations ───────────────────────────────────────────────────────────────
router.get('/invitations', authMiddleware, getInvitations);
router.delete('/invitations/:id', authMiddleware, cancelInvitation);
router.post('/invitations/:token/accept', acceptInvitation);   // public
router.patch('/invitations/:token/decline', declineInvitation); // public

// ── Member management ─────────────────────────────────────────────────────────
router.patch('/:memberId/role', authMiddleware, updateMemberRole);
router.delete('/:memberId', authMiddleware, removeMember);

// ── Notifications ─────────────────────────────────────────────────────────────
router.get('/notifications', authMiddleware, getNotifications);
router.patch('/notifications/read-all', authMiddleware, markAllNotificationsRead);
router.patch('/notifications/:id/read', authMiddleware, markNotificationRead);

export default router;
