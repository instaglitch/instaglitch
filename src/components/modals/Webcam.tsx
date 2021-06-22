import React, { useCallback, useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';

import { useProjectStore } from '../../ProjectStore';
import { Modal } from '../common/Modal';
import clsx from 'clsx';
import { BsArrowReturnLeft, BsCamera, BsBoxArrowInUp } from 'react-icons/bs';

export const Webcam: React.FC = observer(() => {
  const projectStore = useProjectStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [captureAvailable, setCaptureAvailable] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    setLoading(true);
    setPermissionDenied(false);
    const video = videoRef.current;

    navigator.mediaDevices
      .getUserMedia({
        video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      })
      .then(stream => {
        if (video) {
          setLoading(false);
          video.srcObject = stream;
          video.play();
        }
      })
      .catch(() => setPermissionDenied(true));

    return () => {
      video?.pause();
      if (video?.srcObject) {
        const stream: MediaStream = video?.srcObject as MediaStream;
        stream?.getTracks().forEach(function (track) {
          if (track.readyState === 'live') {
            track.stop();
          }
        });
      }
    };
  }, [setPermissionDenied]);

  const capture = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (canvas && video) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return;
      }

      ctx.drawImage(video, 0, 0);
      setCaptureAvailable(true);
    }
  }, [setCaptureAvailable]);

  const useCapture = useCallback(() => {
    if (canvasRef.current) {
      projectStore.addProjectFromURL(
        canvasRef.current.toDataURL('image/png'),
        'image',
        'webcam.png'
      );
      projectStore.modal = undefined;
      setCaptureAvailable(false);
    }
  }, [projectStore, setCaptureAvailable]);

  return (
    <Modal
      title="Webcam capture"
      className="webcam"
      onDismiss={() => (projectStore.modal = undefined)}
    >
      <div className="info">
        {permissionDenied && (
          <div>Webcam not available or permission denied.</div>
        )}
        {loading && <div>Loading...</div>}
        <video
          ref={videoRef}
          className={clsx({ hidden: captureAvailable && !permissionDenied })}
        >
          Video stream is not available.
        </video>
        <canvas
          ref={canvasRef}
          className={clsx({ hidden: !captureAvailable })}
        />
      </div>
      <div className="info actions">
        {captureAvailable && (
          <>
            <button onClick={() => setCaptureAvailable(false)}>
              <BsArrowReturnLeft /> <span>Try again</span>
            </button>
            <button onClick={useCapture}>
              <BsBoxArrowInUp /> <span>Use image</span>
            </button>
          </>
        )}
        {!captureAvailable && (
          <>
            <button onClick={() => (projectStore.modal = undefined)}>
              <BsArrowReturnLeft /> <span>Return</span>
            </button>
            <button onClick={capture}>
              <BsCamera /> <span>Capture</span>
            </button>
          </>
        )}
      </div>
    </Modal>
  );
});
