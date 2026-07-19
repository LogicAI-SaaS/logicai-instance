/**
 * PresenceAvatars – stacked circular avatars for connected collaborators.
 */

interface ConnectedMember {
  memberId: string;
  memberName: string;
  color: string;
}

interface PresenceAvatarsProps {
  members: ConnectedMember[];
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0] || '')
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function PresenceAvatars({ members }: PresenceAvatarsProps) {
  if (members.length === 0) return null;

  const visible = members.slice(0, 5);
  const overflow = members.length - 5;

  return (
    <div className="flex items-center" title={members.map((m) => m.memberName).join(', ')}>
      {visible.map((m, i) => (
        <div
          key={m.memberId}
          title={m.memberName}
          className="size-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white ring-2 ring-[#0d0d0d] cursor-default select-none"
          style={{
            backgroundColor: m.color || '#4ECDC4',
            marginLeft: i > 0 ? '-6px' : 0,
            zIndex: 10 - i,
          }}
        >
          {getInitials(m.memberName)}
        </div>
      ))}
      {overflow > 0 && (
        <div
          className="size-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white ring-2 ring-[#0d0d0d] bg-gray-600 cursor-default select-none"
          style={{ marginLeft: '-6px', zIndex: 5 }}
          title={`+${overflow} autres`}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
