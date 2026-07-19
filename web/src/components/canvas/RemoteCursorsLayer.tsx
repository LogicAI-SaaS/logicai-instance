/**
 * RemoteCursorsLayer – renders remote user cursors as an overlay over the canvas.
 * Rendered OUTSIDE <ReactFlow> (but inside ReactFlowProvider) so it is NOT
 * subject to the viewport transform. useStore provides the transform to
 * manually convert flow → screen coordinates.
 */

import { useStore } from '@xyflow/react';
import type { RemoteCursor } from '../../hooks/useCollaboration';

interface RemoteCursorsLayerProps {
  cursors: RemoteCursor[];
}

export function RemoteCursorsLayer({ cursors }: RemoteCursorsLayerProps) {
  const transform = useStore((s) => s.transform);
  const [tx, ty, zoom] = transform;

  if (cursors.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 40 }}>
      {cursors.map((cursor) => {
        const sx = cursor.x * zoom + tx;
        const sy = cursor.y * zoom + ty;
        return (
          <div
            key={cursor.memberId}
            className="absolute"
            style={{
              left: sx,
              top: sy,
              transition: 'left 80ms linear, top 80ms linear',
              willChange: 'left, top',
            }}
          >
            {/* Cursor arrow — tip at top-left (0,0) */}
            <svg
              width="22"
              height="26"
              viewBox="0 0 22 26"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}
            >
              <path
                d="M1 1L1 18L5.5 13.5L8.5 21L11 20L8 12.5L14 12.5L1 1Z"
                fill={cursor.color}
                stroke="white"
                strokeWidth="1.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
            {/* Name label below the cursor */}
            <div
              className="absolute whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold leading-4 text-white shadow-lg"
              style={{
                backgroundColor: cursor.color,
                top: '22px',
                left: '4px',
                boxShadow: `0 2px 8px ${cursor.color}55`,
              }}
            >
              {cursor.memberName}
            </div>
          </div>
        );
      })}
    </div>
  );
}
