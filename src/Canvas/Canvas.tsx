// @ts-nocheck
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Stage, Layer, Rect, Transformer, Circle, Line } from "react-konva";
import { throttle } from "lodash";
import generateId from "../utils/generateId";
import Player from "../VideoPlayer/Player";
import TransparentVideoController from "../VideoPlayerController/TransparentVideoplayerController";
import useVideoController from "../VideoPlayerController/UseVideoPlayerControllerHook";
import { useCanvas } from "../contexts/CanvasProvider";
import { LineShape } from "../shapes/Line";
import { CircleShape } from "../shapes/Circle";
import { Rectangle } from "../shapes/Rectangle";

interface ShapeProperties {
  type: "rectangle" | "circle" | "line";
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  points?: number[];
  startTime: number;
  endTime: number;
  scaleX: number;
  scaleY: number;
  screenHeight: number;
  screenWidth: number;
  strokeWidth: number;
  opacity: number;
}

interface Shape {
  id: string;
  color: string;
  label: string;
  data: Record<string, any>;
  properties: ShapeProperties;
}

interface CanvasRef {
  undo: () => void;
  redo: () => void;
  deleteShape: () => void;
}

interface CanvasProps {
  children?: React.ReactNode;
  url: string;
  selectedShapeTool?: "rectangle" | "circle" | "line" | null;
  hideAnnotations?: boolean;
  lockEdit?: boolean;
  annotationColor?: string;
  opacity?: number;
  strokeWidth?: number;
  selectedAnnotationData?: (data: Shape | null) => void;
  videoControls?: boolean | Record<string, any>;
  videoTimeAnnotation:boolean;
}

// In your CanvasProvider types file or at the top of the file
export interface CanvasContextType {
  shapes: Shape[];
  setShapes: React.Dispatch<React.SetStateAction<Shape[]>>;
  isDrawing: boolean;
  setIsDrawing: React.Dispatch<React.SetStateAction<boolean>>;
  newShape: Shape | null;
  setNewShape: React.Dispatch<React.SetStateAction<Shape | null>>;
  selectedShapeId: string | null;
  setSelectedShapeId: React.Dispatch<React.SetStateAction<string | null>>;
  rectPosititon: { x: number; y: number };
  setRectPosition: React.Dispatch<
    React.SetStateAction<{ x: number; y: number }>
  >;
  videoRefVal: React.RefObject<HTMLVideoElement> | null;
  setVideoRefVal: React.Dispatch<
    React.SetStateAction<React.RefObject<HTMLVideoElement> | null>
  >;
  dimensions: { width: number; height: number };
  setDimensions: React.Dispatch<
    React.SetStateAction<{ width: number; height: number }>
  >;
  history: Shape[][];
  setHistory: React.Dispatch<React.SetStateAction<Shape[][]>>;
  redoStack: Shape[][];
  setRedoStack: React.Dispatch<React.SetStateAction<Shape[][]>>;
  undo: () => void;
  redo: () => void;
  deleteShape: () => void;
}
interface CanvasRef {
  undo: () => void;
  redo: () => void;
  deleteShape: () => void;
}

const Canvas = forwardRef<CanvasRef, CanvasProps>(
  (
    {
      children,
      url,
      selectedShapeTool,
      hideAnnotations,
      lockEdit,
      annotationColor = "#000000",
      opacity = 1,
      strokeWidth = 2,
      selectedAnnotationData,
      videoControls,
      videoTimeAnnotation,
    },
    ref
  ) => {
    const {
      shapes,
      setShapes,
      isDrawing,
      setIsDrawing,
      newShape,
      setNewShape,
      selectedShapeId,
      setSelectedShapeId,
      rectPosititon,
      setRectPosition,
      videoRefVal,
      setVideoRefVal,
      dimensions,
      setDimensions,
      history,
      setHistory,
      redoStack,
      setRedoStack,
      undo,
      redo,
      deleteShape,
    } = useCanvas();

    // REF STATES
    const shapeRef = useRef<Record<string, any>>({});
    const transformerRef = useRef<any>(null);
    const stageRef = useRef<any>(null);
    const canvasParentRef = useRef<HTMLDivElement>(null);
    const layerRef = useRef<any>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    // HOOK VALUES
    const { currentTime, setCurrentTime, isFullScreen } = useVideoController(
      videoRefVal,
      canvasParentRef
    );

    const [canvasParentWidth, setcanvasParentWidth] = useState(
      canvasParentRef?.current?.offsetWidth || 0
    );
    const [canvasParentHeight, setcanvasParentHeight] = useState(
      canvasParentRef?.current?.offsetHeight || 0
    );

    useEffect(() => {
      if (videoRef) {
        setVideoRefVal(videoRef);
      }
      return () => {
        setVideoRefVal(null);
      };
    }, [videoRef]);

    //  =================== Exported Handlers ===================================
    useEffect(() => {
      if (typeof selectedAnnotationData === "function") {
        if (selectedShapeId) {
          const selectedData = shapes.find(
            (shape) => shape.id === selectedShapeId
          );
          selectedAnnotationData(selectedData || null);
        } else {
          selectedAnnotationData(null);
        }
      }
    }, [selectedShapeId, shapes, selectedAnnotationData]);

    useImperativeHandle(ref, () => ({
      undo,
      redo,
      deleteShape,
    }));

    // ============================================================================

    const handleMouseDown = useCallback(
      (e: any) => {
        if (isFullScreen) return;

        const cursor = window.getComputedStyle(document.body).cursor;

        if (cursor === "nwse-resize") return;

        if (
          selectedShapeTool !== "rectangle" &&
          selectedShapeTool !== "circle" &&
          selectedShapeTool !== "line"
        ) {
          console.warn(
            "Kindly Select appropriate tool which can only include line rectangle and circle"
          );
          return;
        }

        const stage = e.target.getStage();
        if (!stage) return;
        const { x, y } = stage.getPointerPosition();

        const startTime = currentTime;
        let shapeProperties: ShapeProperties;

        switch (selectedShapeTool) {
          case "rectangle":
            shapeProperties = {
              type: "rectangle",
              x,
              y,
              width: 4,
              height: 4,
              startTime,
              endTime: startTime + 0.5,
              scaleX: 1,
              scaleY: 1,
              screenHeight: canvasParentHeight,
              screenWidth: canvasParentWidth,
              strokeWidth: strokeWidth || 2,
              opacity: opacity,
            };
            break;

          case "circle":
            shapeProperties = {
              type: "circle",
              x,
              y,
              radius: 4,
              startTime,
              endTime: startTime + 0.5,
              scaleX: 1,
              scaleY: 1,
              screenHeight: canvasParentHeight,
              screenWidth: canvasParentWidth,
              strokeWidth: strokeWidth || 2,
              opacity: opacity,
            };
            break;

          case "line":
            shapeProperties = {
              type: "line",
              x,
              y,
              points: [0, 0, 100, 0, 100, 100],
              startTime,
              endTime: startTime + 0.5,
              scaleX: 1,
              scaleY: 1,
              screenHeight: canvasParentHeight,
              screenWidth: canvasParentWidth,
              strokeWidth: strokeWidth || 2,
              opacity: opacity,
            };
            break;

          default:
            return {} as ShapeProperties;
        }

        setNewShape({
          id: generateId(),
          color: annotationColor,
          label: "",
          data: {},
          properties: shapeProperties,
        });

        setIsDrawing(true);
      },
      [
        currentTime,
        isFullScreen,
        annotationColor,
        selectedShapeTool,
        strokeWidth,
        opacity,
        canvasParentHeight,
        canvasParentWidth,
      ]
    );

    const handleMouseMove = throttle((e: any) => {
      if (isFullScreen) return;
      if (!isDrawing || !newShape) return;

      const stage = e.target.getStage();
      if (!stage) return;
      const { x, y } = stage.getPointerPosition();

      if (x === newShape.properties.x && y === newShape.properties.y) return;

      let updatedShape: Shape;

      switch (newShape.properties.type) {
        case "rectangle":
          const width = x - newShape.properties.x;
          const height = y - newShape.properties.y;

          updatedShape = {
            ...newShape,
            properties: {
              ...newShape.properties,
              width,
              height,
            },
          };
          break;

        case "circle":
          const radius = Math.sqrt(
            Math.pow(x - newShape.properties.x, 2) +
              Math.pow(y - newShape.properties.y, 2)
          );

          updatedShape = {
            ...newShape,
            properties: {
              ...newShape.properties,
              radius,
            },
          };
          break;

        case "line":
          const points = [
            0,
            0,
            x - newShape.properties.x,
            y - newShape.properties.y,
          ];

          updatedShape = {
            ...newShape,
            properties: {
              ...newShape.properties,
              points,
            },
          };
          break;

        default:
          return;
      }

      setNewShape(updatedShape);
    }, 100);

    const handleMouseUp = useCallback(() => {
      if (newShape) {
        setHistory((prevHistory: any) => [...prevHistory, shapes]);
        setRedoStack([]);
        setShapes((prevShapes: any) => [...prevShapes, newShape]);
        setIsDrawing(false);
        setSelectedShapeId(newShape.id);
        setNewShape(null);
      }
    }, [newShape, shapes]);

    const handleSelectShape = useCallback((shapeId: string, e: any) => {
      e.cancelBubble = true;
      setSelectedShapeId(shapeId);
    }, []);

    const handleStageClick = (e: any) => {
      if (isFullScreen) return;

      if (e.target === e.target.getStage() || e.target.className === "Image") {
        setSelectedShapeId(null);
      }
    };

    const handleDragStart = (e: any) => {
      setHistory((prevHistory: any) => [...prevHistory, shapes]);
      setRedoStack([]);
      e.target.getStage().container().style.cursor = "move";
    };

    const handleDragEnd = useCallback(
      (e: any, shapeId: string) => {
        const { x, y } = rectPosititon;

        if (x !== null && y !== null) {
          setShapes((prevShapes: any[]) =>
            prevShapes.map((shape) =>
              shape.id === shapeId
                ? { ...shape, properties: { ...shape.properties, x, y } }
                : shape
            )
          );
        }
        e.target.getStage().container().style.cursor = "default";
      },
      [rectPosititon]
    );

    const handleTransformStart = useCallback(() => {
      document.body.style.cursor = "nwse-resize";
      setHistory((prevHistory: any) => [...prevHistory, shapes]);
      setRedoStack([]);
    }, [shapes]);

    const handleTransformEnd = useCallback(
      (e: any, shapeId: string) => {
        document.body.style.cursor = "auto";
        const node = e.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        node.scaleX(1);
        node.scaleY(1);

        if (!isFullScreen) {
          setShapes((prevShapes: any[]) =>
            prevShapes.map((shape) => {
              if (shape.id !== shapeId) return shape;

              const { type } = shape.properties;

              let updatedProperties: ShapeProperties;
              switch (type) {
                case "rectangle":
                  updatedProperties = {
                    ...shape.properties,
                    x: node.x(),
                    y: node.y(),
                    width: node.width() * scaleX,
                    height: node.height() * scaleY,
                  };
                  break;

                case "circle":
                  updatedProperties = {
                    ...shape.properties,
                    x: node.x(),
                    y: node.y(),
                    radius: node.radius() * scaleX,
                  };
                  break;

                case "line":
                  updatedProperties = {
                    ...shape.properties,
                    x: node.x(),
                    y: node.y(),
                    points: node
                      .points()
                      .map((point: number, index: number) =>
                        index % 2 === 0 ? point * scaleX : point * scaleY
                      ),
                  };
                  break;

                default:
                  return shape;
              }

              return {
                ...shape,
                properties: updatedProperties,
              };
            })
          );
        }
      },
      [isFullScreen]
    );

    useEffect(() => {
      setcanvasParentHeight(canvasParentRef?.current?.offsetHeight || 0);
      setcanvasParentWidth(canvasParentRef?.current?.offsetWidth || 0);
    }, [
      canvasParentRef?.current?.offsetHeight,
      canvasParentRef?.current?.offsetWidth,
    ]);

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "z") {
          undo();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === "y") {
          redo();
        }
        if (e.key === "Delete") {
          deleteShape();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }, [undo, redo, deleteShape]);

    useEffect(() => {
      if (selectedShapeId !== null && shapeRef.current[selectedShapeId]) {
        transformerRef.current?.nodes([shapeRef.current[selectedShapeId]]);
        transformerRef.current?.getLayer()?.batchDraw();
      } else {
        transformerRef.current?.nodes([]);
      }
    }, [selectedShapeId]);

    useEffect(() => {
      const handleTimeUpdate = () =>
        setCurrentTime(videoRef?.current?.currentTime || 0);
      const video = videoRef.current;
      video?.addEventListener("timeupdate", handleTimeUpdate);
      return () => video?.removeEventListener("timeupdate", handleTimeUpdate);
    }, [videoRef]);

    const isVisible = useCallback(
      (shapeId: string) => {
        const shape = shapes.find(
          (shape: { id: string }) => shape.id === shapeId
        );
        if (videoTimeAnnotation) {
          return (
            currentTime >= shape?.properties?.startTime &&
            currentTime <= shape?.properties?.endTime
          );
        } else {
          return true;
        }
      },
      [currentTime, shapes]
    );

    useEffect(() => {
      if (
        !videoRef.current?.paused ||
        lockEdit ||
        !isVisible(selectedShapeId || "")
      ) {
        setSelectedShapeId(null);
      }
    }, [
      videoRef.current?.paused,
      lockEdit,
      currentTime,
      isVisible,
      selectedShapeId,
    ]);

    const dragBoundFunc = (pos: { x: number; y: number }) => {
      if (!selectedShapeId || !shapeRef.current[selectedShapeId]) {
        return pos;
      }

      const newX = Math.max(
        0,
        Math.min(
          pos.x,
          dimensions.width - shapeRef.current[selectedShapeId].width()
        )
      );
      const newY = Math.max(
        0,
        Math.min(
          pos.y,
          dimensions.height - shapeRef.current[selectedShapeId].height()
        )
      );

      return { x: newX, y: newY };
    };

    const handleDragMove = (e: any) => {
      if (!selectedShapeId || !shapeRef.current[selectedShapeId]) return;

      const newX = Math.max(
        0,
        Math.min(
          e.target.x(),
          dimensions.width - shapeRef.current[selectedShapeId].width()
        )
      );
      const newY = Math.max(
        0,
        Math.min(
          e.target.y(),
          dimensions.height - shapeRef.current[selectedShapeId].height()
        )
      );

      setRectPosition({ x: newX, y: newY });
    };

    const [imagedim, setImgDim] = useState(dimensions);

    useEffect(() => {
      const updateSize = () => {
        if (canvasParentRef.current) {
          const { offsetWidth, offsetHeight } = canvasParentRef.current;
          setDimensions({
            width: offsetWidth,
            height: offsetHeight,
          });
          setImgDim({
            width: offsetWidth,
            height: offsetHeight,
          });
        }
      };

      updateSize();
      window.addEventListener("resize", updateSize);
      return () => window.removeEventListener("resize", updateSize);
    }, []);

    const handleMouseEnterInStage = (e: any) => {
      if (!selectedShapeTool) {
        e.target.getStage().container().style.cursor = "pointer";
      } else {
        e.target.getStage().container().style.cursor = "crosshair";
      }
    };

    return (
      <>
        <div
          ref={canvasParentRef}
          style={{
            maxWidth: window.innerWidth,
            aspectRatio: "16/9",
            minHeight: 300,
            minWidth: 500,
            position: "relative",
          }}
        >
          <Player
            url={url}
            videoControls={videoControls}
            ref={videoRef}
            dimensions={imagedim}
            parentref={canvasParentRef}
          />

          <Stage
            ref={stageRef}
            width={dimensions.width}
            height={dimensions.height}
            style={{
              backgroundColor: "black",
              display: hideAnnotations ? "none" : "block",
            }}
            onMouseEnter={handleMouseEnterInStage}
            onMouseLeave={(e) =>
              (e.target.getStage().container().style.cursor = "default")
            }
            onMouseDown={
              !lockEdit && !isFullScreen && selectedShapeTool
                ? handleMouseDown
                : undefined
            }
            onMouseMove={
              !lockEdit && !isFullScreen && selectedShapeTool
                ? handleMouseMove
                : undefined
            }
            onMouseUp={
              !lockEdit && !isFullScreen && selectedShapeTool
                ? handleMouseUp
                : undefined
            }
            onClick={!isFullScreen ? (e) => handleStageClick(e) : undefined}
          >
            <Layer ref={layerRef}>
              {shapes
                .filter(
                  (shape) =>
                    !videoTimeAnnotation || // If false, show all shapes
                    (videoTimeAnnotation && // If true, filter by time
                      currentTime >= shape.properties.startTime &&
                      currentTime <= shape.properties.endTime)
                )
                .map((shape) => {
                  switch (shape.properties.type) {
                    case "rectangle":
                      return (
                        <Rectangle
                          key={shape.id}
                          ref={(ref) => {
                            if (ref) {
                              shapeRef.current[shape.id] = ref;
                            }
                          }}
                          {...shape}
                          scaleX={stageRef.current?.scaleX()}
                          scaleY={stageRef.current?.scaleY()}
                          onMouseEnter={handleMouseEnterInStage}
                          draggable={
                            !selectedShapeTool &&
                            !isFullScreen &&
                            !lockEdit &&
                            shape.id === selectedShapeId
                          }
                          onClick={
                            !lockEdit && !isFullScreen && !selectedShapeTool
                              ? (e) => handleSelectShape(shape.id, e)
                              : undefined
                          }
                          onDragEnd={
                            selectedShapeId
                              ? (e) => handleDragEnd(e, shape.id)
                              : undefined
                          }
                          onDragStart={
                            selectedShapeId ? handleDragStart : undefined
                          }
                          onDragMove={
                            selectedShapeId ? handleDragMove : undefined
                          }
                          dragBoundFunc={dragBoundFunc}
                          onTransformEnd={
                            selectedShapeId
                              ? (e) => handleTransformEnd(e, shape.id)
                              : undefined
                          }
                          onTransformStart={
                            selectedShapeId ? handleTransformStart : undefined
                          }
                          currentHeight={canvasParentHeight}
                          currentWidth={canvasParentWidth}
                        />
                      );
                    case "circle":
                      return (
                        <CircleShape
                          key={shape.id}
                          ref={(ref) => {
                            if (ref) {
                              shapeRef.current[shape.id] = ref;
                            }
                          }}
                          {...shape}
                          scaleX={stageRef.current?.scaleX()}
                          scaleY={stageRef.current?.scaleY()}
                          onMouseEnter={handleMouseEnterInStage}
                          draggable={
                            !selectedShapeTool &&
                            !isFullScreen &&
                            !lockEdit &&
                            shape.id === selectedShapeId
                          }
                          onClick={
                            !lockEdit && !isFullScreen && !selectedShapeTool
                              ? (e) => handleSelectShape(shape.id, e)
                              : undefined
                          }
                          onDragEnd={
                            selectedShapeId
                              ? (e) => handleDragEnd(e, shape.id)
                              : undefined
                          }
                          onDragStart={
                            selectedShapeId ? handleDragStart : undefined
                          }
                          onDragMove={
                            selectedShapeId ? handleDragMove : undefined
                          }
                          dragBoundFunc={dragBoundFunc}
                          onTransformEnd={
                            selectedShapeId
                              ? (e) => handleTransformEnd(e, shape.id)
                              : undefined
                          }
                          onTransformStart={
                            selectedShapeId ? handleTransformStart : undefined
                          }
                          currentHeight={canvasParentHeight}
                          currentWidth={canvasParentWidth}
                        />
                      );
                    case "line":
                      return (
                        <LineShape
                          key={shape.id}
                          ref={(ref) => {
                            if (ref) {
                              shapeRef.current[shape.id] = ref;
                            }
                          }}
                          {...shape}
                          scaleX={stageRef.current?.scaleX()}
                          scaleY={stageRef.current?.scaleY()}
                          onMouseEnter={handleMouseEnterInStage}
                          draggable={
                            !selectedShapeTool &&
                            !isFullScreen &&
                            !lockEdit &&
                            shape.id === selectedShapeId
                          }
                          onClick={
                            !lockEdit && !isFullScreen && !selectedShapeTool
                              ? (e) => handleSelectShape(shape.id, e)
                              : undefined
                          }
                          onDragEnd={
                            selectedShapeId
                              ? (e) => handleDragEnd(e, shape.id)
                              : undefined
                          }
                          onDragStart={
                            selectedShapeId ? handleDragStart : undefined
                          }
                          onDragMove={
                            selectedShapeId ? handleDragMove : undefined
                          }
                          dragBoundFunc={dragBoundFunc}
                          onTransformEnd={
                            selectedShapeId
                              ? (e) => handleTransformEnd(e, shape.id)
                              : undefined
                          }
                          onTransformStart={
                            selectedShapeId ? handleTransformStart : undefined
                          }
                          currentHeight={canvasParentHeight}
                          currentWidth={canvasParentWidth}
                        />
                      );
                    default:
                      return null;
                  }
                })}

              {newShape && (
                <>
                  {(() => {
                    switch (newShape.properties.type) {
                      case "rectangle":
                        return (
                          <Rect
                            x={newShape.properties?.x}
                            y={newShape.properties?.y}
                            width={newShape.properties.width}
                            height={newShape.properties.height}
                            stroke="violet"
                            opacity={0.8}
                          />
                        );

                      case "circle":
                        return (
                          <Circle
                            x={newShape.properties?.x}
                            y={newShape.properties?.y}
                            radius={newShape.properties.radius}
                            stroke="violet"
                            opacity={0.8}
                          />
                        );

                      case "line":
                        return (
                          <Line
                            x={newShape.properties?.x}
                            y={newShape.properties?.y}
                            points={newShape.properties.points}
                            stroke="violet"
                            opacity={0.8}
                          />
                        );

                      default:
                        return null;
                    }
                  })()}
                </>
              )}

              <Transformer
                ref={transformerRef}
                keepRatio={false}
                rotateEnabled={false}
                anchorSize={7}
                anchorCornerRadius={10}
              />
            </Layer>
          </Stage>
        </div>
        <TransparentVideoController
          playerRef={videoRef}
          dimensions={dimensions}
          canvasParentRef={canvasParentRef}
        />
      </>
    );
  }
);

export default Canvas;
