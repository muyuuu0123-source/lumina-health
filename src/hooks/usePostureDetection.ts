import { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';

export function usePostureDetection(enabled: boolean) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isBadPosture, setIsBadPosture] = useState(false);
  const [postureFeedback, setPostureFeedback] = useState<string | null>(null);
  const detectorRef = useRef<poseDetection.PoseDetector | null>(null);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    let active = true;

    async function init() {
      if (!enabled) return;
      
      try {
        await tf.ready();
        const detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
        );
        if (active) detectorRef.current = detector;

        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current && active) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
             videoRef.current?.play();
             detectPose();
          };
        }
      } catch (err) {
        console.error('Error initializing posture detection:', err);
      }
    }

    async function detectPose() {
      if (!videoRef.current || !detectorRef.current || !active) return;

      try {
        const poses = await detectorRef.current.estimatePoses(videoRef.current);
        if (poses.length > 0) {
          analyzePosture(poses[0]);
        }
      } catch (err) {
        console.error('Pose estimation error:', err);
      }

      animationFrameId.current = requestAnimationFrame(detectPose);
    }

    function analyzePosture(pose: poseDetection.Pose) {
      if (!pose.keypoints) return;
      
      const leftShoulder = pose.keypoints.find(k => k.name === 'left_shoulder');
      const rightShoulder = pose.keypoints.find(k => k.name === 'right_shoulder');
      const leftEar = pose.keypoints.find(k => k.name === 'left_ear');
      const rightEar = pose.keypoints.find(k => k.name === 'right_ear');
      const nose = pose.keypoints.find(k => k.name === 'nose');

      let bad = false;
      let feedback = [];

      // Check uneven shoulders
      if (leftShoulder && rightShoulder && leftShoulder.score! > 0.5 && rightShoulder.score! > 0.5) {
        const shoulderDiff = Math.abs(leftShoulder.y - rightShoulder.y);
        if (shoulderDiff > 20) { // Threshold for uneven shoulders
          bad = true;
          feedback.push('Uneven Shoulders');
        }
      }

      // Check forward head (approximate by checking if nose is too far down relative to shoulders or ears)
      if (nose && leftShoulder && rightShoulder && nose.score! > 0.5) {
        const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
        const headToShoulderDist = shoulderMidY - nose.y;
        // If the distance is too small, head is likely tilted forward
        if (headToShoulderDist < 50) { 
          bad = true;
          feedback.push('Forward Head');
        }
      }

      setIsBadPosture(bad);
      setPostureFeedback(feedback.length > 0 ? feedback.join(' & ') : null);
    }

    if (enabled) {
      init();
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      setIsBadPosture(false);
      setPostureFeedback(null);
    }

    return () => {
      active = false;
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [enabled]);

  return { videoRef, isBadPosture, postureFeedback };
}
