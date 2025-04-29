

# Video Annotation Tool

[![npm version](https://img.shields.io/npm/v/@saran-ign/video-annotation-tool.svg)](https://www.npmjs.com/package/@saran-ign/video-annotation-tool)
[![npm downloads](https://img.shields.io/npm/dm/@saran-ign/video-annotation-tool.svg)](https://www.npmjs.com/package/@saran-ign/video-annotation-tool)
[![License](https://img.shields.io/npm/l/@saran-ign/video-annotation-tool.svg)](https://github.com/saranIgn/video-annotation-tool/blob/main/LICENSE)


📦 Description
@saran-ign/video-annotation-tool is a powerful Typescript React-based video player component that comes with built-in annotation capabilities. It enables developers to easily integrate interactive video tagging, markup, and labeling features into any React application.

Designed for media annotation workflows, this tool supports seamless interaction with video content—ideal for applications in video analysis, machine learning dataset preparation, education, surveillance, and more.

## Features

✨ Key Features
🎞️ Custom Video Player – Built on top of robust video libraries with support for modern formats (HLS, MP4, etc.)

🏷️ Interactive Annotation – Add, update, and remove annotations with a visual overlay.

🔁 Playback Sync – Ensure annotations are time-aligned with video playback.

🎯 Flexible Integration – Easily embeddable in any React project.

🛠️ Highly Customizable – Extend or theme annotations, labels, and controls as needed.

⚙️ Performance Optimized – Lightweight and efficient even with large annotation sets.

- ### Keyboard Shortcuts for Improved Productivity

- **Ctrl + Z**: Undo the last action.  
- **Ctrl + Y**: Redo the undone action.  
- **Delete Button**: Remove selected shapes.
---


## Installation

Install the package using npm or yarn:

```bash
npm install @saran-ign/video-annotation-tool
```

---

## Usage



### App.ts Example

```tsx
import { useRef, useState } from "react";
import { TwoDVideoAnnotation } from "@saran-ign/video-annotation-tool";
import { FaUndo, FaRedo, FaTrash } from "react-icons/fa";

function App() {
  const annotationRef = useRef(null);
  const [allAnnotations, setAllAnnotations] = useState([]);

  return (
    <div className="app">
      {/* Toolbar */}
      <div className="tools">
        <button onClick={() => annotationRef.current?.undo()}>
          <FaUndo /> Undo
        </button>
        <button onClick={() => annotationRef.current?.redo()}>
          <FaRedo /> Redo
        </button>
        <button onClick={() => annotationRef.current?.deleteShape()}>
          <FaTrash /> Delete
        </button>
      </div>

      {/* Video Annotation Tool */}
      <TwoDVideoAnnotation
        rootRef={annotationRef}
        shapes={allAnnotations}
        setShapes={setAllAnnotations}
        selectedShapeTool={"rectangle"} 
        videoTimeAnnotation={true}
        videoUrl="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
      />
    </div>
  );
}

export default App;

```

  ## Shapes objects and properties examples, expected as initial Data array of shapes of objects if passed 

  ```ts
// Example of initial data array with shape objects
const initialShapes = [
  {
    id: "rectangle1", // Unique identifier for the shape
    color: "blue", // Color of the annotation
    label: "My Rectangle", // Optional label for the shape
    data: {}, // Custom data for user-defined purposes
    properties: {
      type: "rectangle", // Shape type
      x: 13, // X-coordinate of the rectangle
      y: 5, // Y-coordinate of the rectangle
      width: 4, // Width of the rectangle
      height: 4, // Height of the rectangle
      startTime: 0, // Start time of the annotation (seconds)
      endTime: 0.5, // End time of the annotation (seconds)
      scaleX: 1, // Horizontal scale factor
      scaleY: 1, // Vertical scale factor
      screenHeight: 600, // Height of the annotation area
      screenWidth: 400, // Width of the annotation area
      strokeWidth: 2, // Stroke width for the rectangle
      opacity: 0.8, // Opacity of the rectangle
    },
  },
  {
    id: "circle1", // Unique identifier for the circle
    color: "red",
    label: "My Circle", // Optional label for the circle
    data: {}, 
    properties: {
      type: "circle", 
      x: 10,
      y: 15, 
      radius: 4, // Radius of the circle
      startTime: 1, 
      endTime: 1.5, 
      scaleX: 1, 
      scaleY: 1,
      screenHeight: 600, 
      screenWidth: 400, 
      strokeWidth: 2, 
      opacity: 0.8,
    },
  },
  {
    id: "line1", 
    color: "green", 
    label: "My Line", 
    data: {}, 
    properties: {
      type: "line",
      x: 20,
      y: 30, 
      points: [0, 0, 100, 0, 100, 100], // Array of points defining the line
      startTime: 2, 
      endTime: 2.5, 
      scaleX: 1, 
      scaleY: 1, 
      screenHeight: 600, 
      screenWidth: 400, 
      strokeWidth: 2, 
      opacity: 0.8, 
    },
  },
];

            
  ```

## API

### TwoDVideoAnnotation Props

| Prop                   | Type       | Default | Description                                                                 |
|------------------------|------------|---------|-----------------------------------------------------------------------------|
| `rootRef`              | `ref`      | -       | Ref to access methods (e.g., undo, redo, deleteShape).                     |
| `shapes`               | `array`    | `[]`    | Initial array of annotations.                                                   |
| `setShapes`            | `function` | -       | State setter to update annotations.                                        |
| `videoUrl`             | `string`   | -       | URL of the video to annotate.                                              |
| `selectedShapeTool`    | `string`   | -       | The currently selected shape tool ('rectangle' , 'circle' , 'line').                                         |
| `hideAnnotations`      | `boolean`  | `false` | Whether to hide all annotations.                                           |
| `annotationColor`      | `string`   | `"red"` | Color for new annotations.                                                 |
| `videoControls`        | `object`   | `{}`    | Video playback controls ({`autoPlay:true`, `loop:true`}, etc.).                        |
| `lockEdit`             | `boolean`  | `false` | Disable editing annotations.                                               |
| `selectedAnnotationData`| `function`| -       | Callback triggered when annotation is selected.                            |
| `videoTimeAnnotation`             | `boolean`  | `true` | Enable editing video annotations particular time. 
| `showVideoDuration`             | `boolean`  | `true` | Enable videoDuration. 
---

### Developers

-  Sarankumar Sengottuvel  

---



