import React, { forwardRef } from "react";
import { Circle } from "react-konva";
//@ts-ignore
import { KonvaEventObject } from "konva/lib/Node"; // Import KonvaEventObject

interface CircleShapeProps {
  properties: {
    x: number;
    y: number;
    radius: number;
    screenWidth: number;
    screenHeight: number;
    strokeWidth?: number;
    opacity?: number;
  };
  scaleX?: number;
  scaleY?: number;
  color: string;
  draggable?: boolean;
  onClick?: (event: KonvaEventObject<MouseEvent>) => void; // Use KonvaEventObject
  onDragEnd?: (event: KonvaEventObject<MouseEvent>) => void; // Use KonvaEventObject
  onDragStart?: (event: KonvaEventObject<MouseEvent>) => void; // Use KonvaEventObject
  onTransformEnd?: (event: KonvaEventObject<MouseEvent>) => void; // Use KonvaEventObject
  onTransformStart?: (event: KonvaEventObject<MouseEvent>) => void; // Use KonvaEventObject
  onDragMove?: (event: KonvaEventObject<MouseEvent>) => void; // Use KonvaEventObject
  dragBoundFunc?: (pos: { x: number; y: number }) => { x: number; y: number };
  currentWidth: number;
  currentHeight: number;
  onMouseEnter?: (event: KonvaEventObject<MouseEvent>) => void; // Use KonvaEventObject
}

export const CircleShape = forwardRef<any, CircleShapeProps>(
  (
    {
      properties,
      scaleX,
      scaleY,
      color,
      draggable,
      onClick,
      onDragEnd,
      onDragStart,
      onTransformEnd,
      onTransformStart,
      onDragMove,
      dragBoundFunc,
      currentWidth,
      currentHeight,
      onMouseEnter,
    },
    ref
  ) => (
    <Circle
      ref={ref}
      x={properties.x * (currentWidth / properties.screenWidth)}
      y={properties.y * (currentHeight / properties.screenHeight)}
      radius={properties.radius * (currentWidth / properties.screenWidth)}
      stroke={color}
      strokeWidth={properties.strokeWidth || 2}
      opacity={properties.opacity || 1}
      draggable={draggable}
      onClick={onClick}
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onMouseEnter={onMouseEnter}
      dragBoundFunc={dragBoundFunc}
      onTransformStart={onTransformStart}
      onTransformEnd={onTransformEnd}
    />
  )
);

CircleShape.displayName = "CircleShape"; // Set display name for better debugging