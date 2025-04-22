import React, { forwardRef } from "react";
import { Line } from "react-konva";
//@ts-ignore
import { KonvaEventObject } from "konva/lib/Node";// Import KonvaEventObject

interface LineShapeProps {
  properties: {
    x: number;
    y: number;
    points: number[]; // Array of points for the line
    screenWidth: number;
    screenHeight: number;
    tension?: number; // Optional tension for the line
    strokeWidth?: number; // Optional stroke width
    opacity?: number; // Optional opacity
  };
  color: string; // Color of the line
  draggable?: boolean; // Whether the line is draggable
  onClick?: (event: KonvaEventObject<MouseEvent>) => void; // Click event handler
  onDragEnd?: (event: KonvaEventObject<MouseEvent>) => void; // Drag end event handler
  onDragStart?: (event: KonvaEventObject<MouseEvent>) => void; // Drag start event handler
  onTransformEnd?: (event: KonvaEventObject<MouseEvent>) => void; // Transform end event handler
  onTransformStart?: (event: KonvaEventObject<MouseEvent>) => void; // Transform start event handler
  onDragMove?: (event: KonvaEventObject<MouseEvent>) => void; // Drag move event handler
  dragBoundFunc?: (pos: { x: number; y: number }) => { x: number; y: number }; // Function to constrain dragging
  currentWidth: number; // Current width of the canvas
  currentHeight: number; // Current height of the canvas
  onMouseEnter?: (event: KonvaEventObject<MouseEvent>) => void; // Mouse enter event handler
}

export const LineShape = forwardRef<any, LineShapeProps>(
  (
    {
      properties,
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
    <Line
      ref={ref}
      x={properties.x * (currentWidth / properties.screenWidth)}
      y={properties.y * (currentHeight / properties.screenHeight)}
      points={properties.points.map((point, index) =>
        index % 2 === 0
          ? point * (currentWidth / properties.screenWidth)
          : point * (currentHeight / properties.screenHeight)
      )}
      tension={properties.tension || 0}
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

LineShape.displayName = "LineShape"; // Set display name for better debugging