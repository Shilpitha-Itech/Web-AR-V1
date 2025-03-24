import { useCallback, useEffect, useRef, useState } from "react";
import { useCameraKit } from "./hooks/useCameraKit";
import { createMediaStreamSource, Transform2D } from "@snap/camera-kit";

function App() {
  const { session, lenses } = useCameraKit();
  const canvasContainerRef = useRef(null);
  const [imageData, setImageData] = useState(null);
  const [showPanel2, setShowPanel2] = useState(false);

  const startCameraKit = useCallback(async () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    const source = createMediaStreamSource(mediaStream, {
      transform: Transform2D.MirrorX,
    });

    await session.setSource(source);
    await source.setRenderSize(window.innerWidth, window.innerHeight);
    session.applyLens(lenses[0]);
    session.play("live");

    if (canvasContainerRef.current) {
      session.output.live.id = "my-canvas";
      canvasContainerRef.current.innerHTML = "";
      canvasContainerRef.current.appendChild(session.output.live);
    }
  }, [session, lenses]);

  useEffect(() => {
    startCameraKit();
  }, [startCameraKit]);

  // Capture function (Hides Panel 1)
  const capture = () => {
    const canvas = document.getElementById("my-canvas");
    if (!canvas) {
      console.error("❌ Canvas not found!");
      return;
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = width;
    offscreenCanvas.height = height;
    const offscreenCtx = offscreenCanvas.getContext("2d");

    offscreenCtx.drawImage(canvas, 0, 0, width, height);
    const dataURL = offscreenCanvas.toDataURL("image/png");

    setImageData(dataURL);
    setShowPanel2(true); // Hide panel 1, show panel 2
  };

  // Download function
  const download = () => {
    if (!imageData) return;
    const link = document.createElement("a");
    link.href = imageData;
    link.download = "LensCapture.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {/* Panel 1 (Hidden when showPanel2 is true) */}
      {!showPanel2 && (
        <div id="panel1" className="container">
          <div ref={canvasContainerRef} className="video-container"></div>
          <button className="button-capture" onClick={capture}></button>
        </div>
      )}

      {/* Panel 2 - Image Preview */}
      {showPanel2 && (
        <div id="panel2" className="container">
          <img
            src={imageData}
            alt="Captured Image"
            class="image-container"
            id="captured-image"
          />
          <button className="button-download" onClick={download}>
            ⬇️ Download
          </button>
          <button className="button-server" onClick={download}>
            🖧 Send to Server
          </button>
          <button
            className="button-close"
            onClick={() => {
              setShowPanel2(false);
              startCameraKit(); // Restart camera when closing Panel 2
            }}
          >
            x
          </button>
        </div>
      )}
    </>
  );
}

export default App;
