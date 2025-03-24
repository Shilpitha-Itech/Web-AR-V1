import { bootstrapCameraKit } from '@snap/camera-kit';
import { createContext, useEffect, useRef, useState } from 'react';

const apiToken =
  'eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNzA0MzY4OTA4LCJzdWIiOiIzMDUxZjgzYi1hMDZkLTRjNDktYTFjMi04OGY2ZWU3NmE4NWJ-U1RBR0lOR35kZTUzOGQwMy00YzkyLTQ2YzMtOWQ0Ni05NWI5N2Y0MjMyMGQifQ.NBp5Qb95IKuulKsJnOOA3hqeL5MP8ikNEUJYK1CUde4';
const lensGroupId = '7aa9b444-cac5-400c-8577-e60d9711ec3c';

export const CameraKitContext = createContext(null);

export const CameraKit = ({ children }) => {
  const isInitialized = useRef(false);
  const [session, setSession] = useState(null);
  const [lenses, setLenses] = useState([]);

  useEffect(() => {
    const initializeCameraKit = async () => {
      const cameraKit = await bootstrapCameraKit({ apiToken });
      const session = await cameraKit.createSession();
      const { lenses } = await cameraKit.lensRepository.loadLensGroups([
        lensGroupId,
      ]);

      setLenses(lenses);
      setSession(session);
    };

    if (isInitialized.current) return;
    isInitialized.current = true;

    initializeCameraKit();
  }, []);

  return !session ? (
    <div>Initializing Camera Kit...</div>
  ) : (
    <CameraKitContext.Provider value={{ session, lenses }}>
      {children}
    </CameraKitContext.Provider>
  );
};
