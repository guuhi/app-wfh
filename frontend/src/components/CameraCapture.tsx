import { useCallback, useEffect, useRef, useState } from 'react';

interface Props {
  /** Called with the captured JPEG, or null after "Retake". */
  onChange: (photo: Blob | null) => void;
  disabled?: boolean;
}

/**
 * Live camera capture (no file picker): start camera -> take photo -> preview -> retake.
 * Needs HTTPS or localhost, otherwise the browser blocks camera access.
 */
export default function CameraCapture({ onChange, disabled }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<'off' | 'live' | 'captured'>('off');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState('');

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  // Turn the camera off when the component disappears.
  useEffect(() => stopCamera, [stopCamera]);

  // Free the preview image memory when it is replaced or the component unmounts.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function startCamera() {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play();
      }
      setStatus('live');
    } catch {
      stopCamera();
      setError(
        'Camera unavailable. Allow camera access in the browser (HTTPS or localhost only).',
      );
    }
  }

  function takePhoto() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        stopCamera();
        setPreviewUrl(URL.createObjectURL(blob));
        setStatus('captured');
        onChange(blob);
      },
      'image/jpeg',
      0.85,
    );
  }

  function retake() {
    onChange(null);
    setPreviewUrl(null);
    void startCamera();
  }

  return (
    <div className="camera">
      <div className="camera-frame">
        <video ref={videoRef} playsInline muted hidden={status !== 'live'} />
        {status === 'captured' && previewUrl && (
          <img src={previewUrl} alt="Captured photo" />
        )}
        {status === 'off' && <p className="muted">Camera is off</p>}
      </div>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <div className="row">
        {status === 'off' && (
          <button
            type="button"
            className="btn"
            onClick={startCamera}
            disabled={disabled}
          >
            Start camera
          </button>
        )}
        {status === 'live' && (
          <button
            type="button"
            className="btn"
            onClick={takePhoto}
            disabled={disabled}
          >
            Take photo
          </button>
        )}
        {status === 'captured' && (
          <button
            type="button"
            className="btn btn-quiet"
            onClick={retake}
            disabled={disabled}
          >
            Retake
          </button>
        )}
      </div>
    </div>
  );
}
