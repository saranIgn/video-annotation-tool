import React, { createContext, useCallback, useContext, useState, ReactNode } from "react";

interface Shape {
  id: string;
  [key: string]: any; // Add more specific shape properties as needed
}

interface Dimensions {
  width: number;
  height: number;
}

interface Position {
  x: number | null;
  y: number | null;
}

interface CanvasContextType {
  shapes: Shape[];
  setShapes: React.Dispatch<React.SetStateAction<Shape[]>>;
  isDrawing: boolean;
  setIsDrawing: React.Dispatch<React.SetStateAction<boolean>>;
  newShape: Shape | null;
  setNewShape: React.Dispatch<React.SetStateAction<Shape | null>>;
  selectedShapeId: string | null;
  setSelectedShapeId: React.Dispatch<React.SetStateAction<string | null>>;
  rectPosititon: Position;
  setRectPosition: React.Dispatch<React.SetStateAction<Position>>;
  videoRefVal: React.RefObject<HTMLVideoElement> | null;
  setVideoRefVal: React.Dispatch<React.SetStateAction<React.RefObject<HTMLVideoElement> | null>>;
  dimensions: Dimensions;
  setDimensions: React.Dispatch<React.SetStateAction<Dimensions>>;
  history: Shape[][];
  setHistory: React.Dispatch<React.SetStateAction<Shape[][]>>;
  redoStack: Shape[][];
  setRedoStack: React.Dispatch<React.SetStateAction<Shape[][]>>;
  undo: () => void;
  redo: () => void;
  deleteShape: () => void;
}

interface CanvasProviderProps {
  children: ReactNode;
  shapes: Shape[];
  setShapes: React.Dispatch<React.SetStateAction<Shape[]>>;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export const CanvasProvider: React.FC<CanvasProviderProps> = ({ children, shapes, setShapes }) => {
    // GENERAL STATES
    const [isDrawing, setIsDrawing] = useState(false);
    const [newShape, setNewShape] = useState<Shape | null>(null);
    const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
    const [rectPosititon, setRectPosition] = useState<Position>({ x: null, y: null });
    const [videoRefVal, setVideoRefVal] = useState<React.RefObject<HTMLVideoElement> | null>(null);
    const [dimensions, setDimensions] = useState<Dimensions>({
        width: 500,
        height: 300,
    });

    // STACK STATES
    const [history, setHistory] = useState<Shape[][]>([]);
    const [redoStack, setRedoStack] = useState<Shape[][]>([]);

    /**
     * Handle UNDO.
     */
    const undo = useCallback(() => {
        if (history.length > 0) {
            const lastState = history[history.length - 1];
            setRedoStack((prevRedoStack) => [shapes, ...prevRedoStack]);
            setShapes(lastState);
            setHistory((prevHistory) => prevHistory.slice(0, -1));
        }
    }, [history, shapes, setShapes]);

    /**
     * Handle REDO.
     */
    const redo = useCallback(() => {
        if (redoStack.length > 0) {
            const nextState = redoStack[0];
            setHistory((prevHistory) => [...prevHistory, shapes]);
            setShapes(nextState);
            setRedoStack((prevRedoStack) => prevRedoStack.slice(1));
        }
    }, [redoStack, shapes, setShapes]);

    /**
     * Handle shape deletion by filtering out the shape with the given ID.
     */
    const deleteShape = useCallback(() => {
        setHistory((prevHistory) => [...prevHistory, shapes]);
        setRedoStack([]);
        setShapes((prevShapes) =>
            prevShapes.filter((shape) => shape.id !== selectedShapeId)
        );
        setSelectedShapeId(null);
    }, [selectedShapeId, shapes, setShapes]);

    return (
        <CanvasContext.Provider value={{
            shapes, setShapes,
            isDrawing, setIsDrawing,
            newShape, setNewShape,
            selectedShapeId, setSelectedShapeId,
            rectPosititon, setRectPosition,
            videoRefVal, setVideoRefVal,
            dimensions, setDimensions,
            history, setHistory,
            redoStack, setRedoStack,
            deleteShape, undo, redo
        }}>
            {children}
        </CanvasContext.Provider>
    );
};

export const useCanvas = (): CanvasContextType => {
    const context = useContext(CanvasContext);
    if (context === undefined) {
        throw new Error('useCanvas must be used within a CanvasProvider');
    }
    return context;
};