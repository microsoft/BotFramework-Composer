import React from 'react';
interface KeyboardZoneProps {
  onCommand: (action: any, e: KeyboardEvent) => object | void;
  children: React.ReactChild;
}
export declare const KeyboardZone: React.ForwardRefExoticComponent<
  KeyboardZoneProps & React.RefAttributes<HTMLDivElement>
>;
export {};
//# sourceMappingURL=KeyboardZone.d.ts.map
