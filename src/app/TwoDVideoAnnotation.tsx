import React, { forwardRef, ForwardedRef } from 'react';
import Canvas from '../Canvas/Canvas';
import { CanvasProvider } from '../contexts/CanvasProvider';
import PropTypes from 'prop-types';


interface Shape {
  id: string;
  [key: string]: any; // Adjust this with your actual shape properties
}

interface TwoDVideoAnnotationProps {
  rootRef?: ForwardedRef<any>;
  videoUrl: string;
  shapes: Shape[];
  setShapes: React.Dispatch<React.SetStateAction<Shape[]>>;
  selectedShapeTool?: 'rectangle' | 'circle' | 'polygon' | null;
  hideAnnotations?: boolean;
  lockEdit?: boolean;
  annotationColor?: string;
  selectedAnnotationData?: (data: Shape | null) => void;
  videoControls?: Record<string, any>;
  videoTimeAnnotation:boolean;
  showVideoDuration:boolean;
}

const TwoDVideoAnnotation: React.FC<TwoDVideoAnnotationProps> = ({
  rootRef,
  videoUrl,
  shapes,
  setShapes,
  selectedShapeTool,
  hideAnnotations,
  lockEdit,
  annotationColor,
  selectedAnnotationData,
  videoControls,
  videoTimeAnnotation,
  showVideoDuration
}) => {
  if (!videoUrl) {
    console.error("Provide a video url");
    return null;
  }

  return (
    <CanvasProvider shapes={shapes} setShapes={setShapes}>
      <div
        style={{
          padding: '0',
          position: 'relative',
        }}
      >
        <Canvas
          ref={rootRef}
          url={videoUrl}
          videoControls={videoControls || {}}
          //@ts-ignore
          selectedShapeTool={selectedShapeTool}
          selectedAnnotationData={selectedAnnotationData}
          hideAnnotations={hideAnnotations || false}
          lockEdit={lockEdit || false}
          annotationColor={annotationColor || '#FF0000'}
          videoTimeAnnotation={videoTimeAnnotation}
          showVideoDuration={showVideoDuration}
        />
      </div>
    </CanvasProvider>
  );
};
TwoDVideoAnnotation.propTypes = {
  rootRef: PropTypes.object,
  videoUrl: PropTypes.string.isRequired,
  selectedShapeTool: PropTypes.oneOf(['rectangle', 'circle', 'polygon', null]),
  hideAnnotations: PropTypes.bool,
  lockEdit: PropTypes.bool,
  showVideoDuration:PropTypes.bool,
  shapes: PropTypes.arrayOf(PropTypes.object).isRequired,
  setShapes: PropTypes.func.isRequired,
  annotationColor: PropTypes.string,
  videoControls: PropTypes.object,
  selectedAnnotationData: PropTypes.func
};
export default TwoDVideoAnnotation;

