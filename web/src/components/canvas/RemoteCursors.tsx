/**
 * RemoteCursors - Affiche les curseurs distants des collaborateurs
 * Features:
 * - Curseurs colorés (comme Figma)
 * - Nom du membre à côté du curseur
 * - Animation fluide
 * - Suivi de la souris en temps réel
 */

import { useEffect, useRef } from 'react';
import type { RemoteCursor } from '../../types/collaboration';

interface RemoteCursorsProps {
  cursors: RemoteCursor[];
  containerRef: React.RefObject<HTMLDivElement>;
}

export default function RemoteCursors({ cursors, containerRef }: RemoteCursorsProps) {
  const cursorElementsRef = useRef<Map<string, HTMLDivElement>>(new Map());

  // Créer ou mettre à jour les éléments de curseur
  useEffect(() => {
    if (!containerRef.current) return;

    cursors.forEach((cursor) => {
      let cursorEl = cursorElementsRef.current.get(cursor.memberId);

      if (!cursorEl) {
        // Créer un nouveau curseur
        cursorEl = document.createElement('div');
        cursorEl.className = 'remote-cursor';
        cursorEl.style.cssText = `
          position: absolute;
          pointer-events: none;
          z-index: 9999;
          transition: transform 0.1s ease-out;
        `;

        // Curseur SVG
        cursorEl.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M5.65376 12.3673H5.00627L11.6423 3.29182L12.2474 3.89692L12.6174 3.89692L12.6174 5.39692L12.2474 5.89692L10.0063 11.4932L5.65376 20.9881V22.3883H18.5032L12.0063 13.2842L12.3565 13.0345C12.3565 12.8956 12.2679 12.8956C12.1793 12.8956 12.0965 12.9346C12.0087 12.9736 11.8361 12.9736C11.5874 12.9736 11.4254 12.7665C11.2634 12.5593 11.2275 12.1014C11.1915 11.6435 11.2958 11.3151C11.4395 11.0576 11.9219 10.9718C12.3313 10.9718 13.2011 11.6937C13.9082 11.6937 14.5319 13.1461C15.0139 14.5985 16.1688 13.7596C17.1993 12.9207 18.0363 11.8177L17.0363 11.8027V12.3673H18.5032L10.6157 19.7166L5.65376 12.3673Z" fill="${cursor.color}" stroke="white" stroke-width="1"/>
          </svg>
          <span class="cursor-name" style="
            position: absolute;
            left: 20px;
            top: 16px;
            padding: 4px 8px;
            background: ${cursor.color};
            color: white;
            font-size: 11px;
            font-weight: 500;
            border-radius: 4px;
            white-space: nowrap;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          ">${cursor.memberName}</span>
        `;

        containerRef.current.appendChild(cursorEl);
        cursorElementsRef.current.set(cursor.memberId, cursorEl);
      }

      // Mettre à jour la position
      cursorEl.style.transform = `translate(${cursor.x}px, ${cursor.y}px)`;
    });

    // Nettoyer les curseurs qui ne sont plus actifs
    const activeIds = new Set(cursors.map((c) => c.memberId));
    cursorElementsRef.current.forEach((el, memberId) => {
      if (!activeIds.has(memberId)) {
        el.remove();
        cursorElementsRef.current.delete(memberId);
      }
    });
  }, [cursors, containerRef]);

  return null; // Les curseurs sont ajoutés directement au DOM
}
