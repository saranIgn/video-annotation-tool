import React, { forwardRef } from "react";
import { Rect } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";
import { Rect as KonvaRect } from "konva/lib/shapes/Rect";

type Properties = {
  x: number;
  y: number;
  width: number;
  height: number;
  screenWidth: number;
  screenHeight: number;
  strokeWidth?: number;
  opacity?: number;
};

type RectangleProps = {
  properties: Properties;
  scaleX?: number;
  scaleY?: number;
  color: string;
  draggable?: boolean;
  currentWidth: number;
  currentHeight: number;
  dragBoundFunc?: (pos: { x: number; y: number }) => { x: number; y: number };
  onClick?: (e: KonvaEventObject<MouseEvent>) => void;
  onDragEnd?: (e: KonvaEventObject<DragEvent>) => void;
  onDragStart?: (e: KonvaEventObject<DragEvent>) => void;
  onDragMove?: (e: KonvaEventObject<DragEvent>) => void;
  onTransformStart?: (e: KonvaEventObject<Event>) => void;
  onTransformEnd?: (e: KonvaEventObject<Event>) => void;
  onMouseEnter?: (e: KonvaEventObject<MouseEvent>) => void;
};

export const Rectangle = forwardRef<KonvaRect, RectangleProps>(
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
    <Rect
      ref={ref}
      x={properties.x * (currentWidth / properties.screenWidth)}
      y={properties.y * (currentHeight / properties.screenHeight)}
      width={properties.width * (currentWidth / properties.screenWidth)}
      height={properties.height * (currentHeight / properties.screenHeight)}
      shadowBlur={5}
      stroke={color}
      strokeWidth={properties?.strokeWidth || 2}
      opacity={properties?.opacity ?? 1}
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
