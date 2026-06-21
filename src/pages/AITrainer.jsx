import React, { useState, useEffect, useRef } from "react";
import { saveSession } from "../utils/db";

const EXERCISES = {
  bicep_curl: {
    name: "Bicep Curl",
    target: "Arms (Biceps)",
    diff: "Medium",
    view: "side",
    tip: "Keep your elbows pinned to your torso. Only move your forearms.",
    angles: ["Elbow Angle", "Shoulder Angle", "Hip Offset"],
    videoUrl: "/output_sample.mp4"
  },
  squat: {
    name: "Squats",
    target: "Legs (Quads & Glutes)",
    diff: "Medium",
    view: "side",
    tip: "Keep your chest up, feet shoulder-width, and lower your hips until thighs are parallel to the floor.",
    angles: ["Knee Angle", "Hip Angle", "Ankle Flexion"],
    videoUrl: "/output_sample.mp4"
  },
  pushups: {
    name: "Push-ups",
    target: "Chest & Arms",
    diff: "Medium",
    view: "side",
    tip: "Keep your head, hips, and heels aligned in a straight line. Lower chest to floor.",
    angles: ["Elbow Bend", "Hip Alignment", "Back Hold"],
    videoUrl: "/output_sample.mp4"
  },
  dumbbell_fly: {
    name: "Dumbbell Fly",
    target: "Chest (Pectorals)",
    diff: "Easy",
    view: "frontal",
    tip: "Lie flat or stand straight. Maintain a slight bend in your elbow throughout.",
    angles: ["Arm Extension", "Elbow Flexion", "Symmetry"],
    videoUrl: "/output_sample.mp4"
  },
  tricep_kickback: {
    name: "Tricep Kickback",
    target: "Arms (Triceps)",
    diff: "Easy",
    view: "side",
    tip: "Hinge at hips, keep upper arm horizontal and lock elbow. Extend arm backwards.",
    angles: ["Elbow Extension", "Shoulder Alignment", "Hip Hold"],
    videoUrl: "/output_sample.mp4"
  },
  lunge: {
    name: "Lunges",
    target: "Legs (Quads & Glutes)",
    diff: "Medium",
    view: "side",
    tip: "Step forward, lower your hips until your back knee is near the floor and front knee is at 90 degrees.",
    angles: ["Front Knee Angle", "Back Knee Angle", "Torso Angle"],
    videoUrl: "/output_sample.mp4"
  },
  shoulder_press: {
    name: "Shoulder Press",
    target: "Shoulders (Deltoids)",
    diff: "Medium",
    view: "frontal",
    tip: "Press dumbbells straight overhead. Keep your core engaged and don't arch your back.",
    angles: ["Elbow Extension", "Shoulder Extension", "Symmetry"],
    videoUrl: "/output_sample.mp4"
  },
  jumping_jacks: {
    name: "Jumping Jacks (Cardio)",
    target: "Cardio & Full Body",
    diff: "Easy",
    view: "frontal",
    tip: "Jump wide while clapping hands overhead, then return to a standing position.",
    angles: ["Left Arm Angle", "Right Arm Angle", "Leg Separation"],
    videoUrl: "/output_sample.mp4"
  },
  high_knees: {
    name: "High Knees (Cardio)",
    target: "Cardio & Legs",
    diff: "Hard",
    view: "side",
    tip: "Stand tall, drive one knee up towards your chest (above hip level), swap and repeat rapidly.",
    angles: ["Left Knee Lift", "Right Knee Lift", "Torso Angle"],
    videoUrl: "/output_sample.mp4"
  },
  burpees: {
    name: "Burpees (Cardio)",
    target: "Full Body & Cardio",
    diff: "Hard",
    view: "side",
    tip: "Drop into a squat, kick feet back to a push-up position, return to squat, and jump high with arms up.",
    angles: ["Height/Width Ratio", "Body Straightness", "Hands Reach"],
    videoUrl: "/output_sample.mp4"
  }
};

export default function AITrainer({ selectedExercise, setSelectedExercise }) {
  const [exerciseId, setExerciseId] = useState(selectedExercise || "bicep_curl");
  const config = EXERCISES[exerciseId];

  const [sourceType, setSourceType] = useState("demo"); // Default to demo video mode
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reps, setReps] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [postureScore, setPostureScore] = useState(0);
  const [feedback, setFeedback] = useState("Align to camera — ready when you are ⚡");
  const [feedbackClass, setFeedbackClass] = useState("banner-warning");
  const [angleReadings, setAngleReadings] = useState([0, 0, 0]);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [sessionSaved, setSessionSaved] = useState(false);
  const [sessionSummary, setSessionSummary] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraInstance = useRef(null);
  const poseInstance = useRef(null);
  const startTime = useRef(null);
  const activeRef = useRef(false);

  // Simulated Fullscreen State
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Mutable refs to resolve stale closures in MediaPipe onResults callback
  const exerciseIdRef = useRef(selectedExercise || "bicep_curl");
  const voiceEnabledRef = useRef(voiceEnabled);

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  useEffect(() => {
    if (isFullscreen) {
      document.body.classList.add("fullscreen-active");
    } else {
      document.body.classList.remove("fullscreen-active");
    }
    return () => {
      document.body.classList.remove("fullscreen-active");
    };
  }, [isFullscreen]);

  useEffect(() => {
    exerciseIdRef.current = exerciseId;
  }, [exerciseId]);

  useEffect(() => {
    voiceEnabledRef.current = voiceEnabled;
  }, [voiceEnabled]);

  // Inactivity and state trackers using Refs to prevent React stale closures
  const repsRef = useRef(0);
  const incorrectRef = useRef(0);
  const repState = useRef("s1");
  const stateSeq = useRef([]);
  const incorrectPosture = useRef(false);
  const prevFeedback = useRef("");
  const prevAngleRef = useRef(0);
  const lastActiveTimestampRef = useRef(Date.now());
  const animationFrameId = useRef(null);

  const formErrorsRef = useRef({});
  const consecutiveIncorrectRef = useRef(0);

  const recordError = (type) => {
    formErrorsRef.current[type] = (formErrorsRef.current[type] || 0) + 1;
  };

  useEffect(() => {
    if (selectedExercise) {
      setExerciseId(selectedExercise);
    }
  }, [selectedExercise]);

  const speak = (msg) => {
    if (!voiceEnabledRef.current || !window.speechSynthesis) return;
    if (msg === prevFeedback.current) return;
    prevFeedback.current = msg;
    
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(msg);
    u.rate = 1.15;
    window.speechSynthesis.speak(u);
  };

  const distance = (a, b) => Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

  const findAngle = (a, b, c) => {
    const ab = distance(a, b);
    const bc = distance(b, c);
    const ac = distance(a, c);
    const cosB = (ab * ab + bc * bc - ac * ac) / (2 * ab * bc);
    const rad = Math.acos(Math.max(-1, Math.min(1, cosB)));
    return Math.round(rad * (180 / Math.PI));
  };

  const drawSkeleton = (ctx, landmarks) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const connect = (idxA, idxB, color = "#6366F1", width = 3) => {
      const a = landmarks[idxA];
      const b = landmarks[idxB];
      if (a && b && a.visibility > 0.5 && b.visibility > 0.5) {
        ctx.beginPath();
        ctx.moveTo(a.x * ctx.canvas.width, a.y * ctx.canvas.height);
        ctx.lineTo(b.x * ctx.canvas.width, b.y * ctx.canvas.height);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.stroke();
      }
    };

    const drawPoint = (idx, color = "#06B6D4", radius = 6) => {
      const p = landmarks[idx];
      if (p && p.visibility > 0.5) {
        ctx.beginPath();
        ctx.arc(p.x * ctx.canvas.width, p.y * ctx.canvas.height, radius, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    };

    // Connections
    connect(11, 12, "rgba(99,102,241,0.5)"); // shoulders
    connect(11, 13); connect(13, 15); // left arm
    connect(12, 14); connect(14, 16); // right arm
    connect(11, 23); connect(12, 24); // shoulder-hip torso
    connect(23, 24, "rgba(99,102,241,0.5)"); // hips
    connect(23, 25); connect(25, 27); // left leg
    connect(24, 26); connect(26, 28); // right leg

    // Joint points
    [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28].forEach(idx => drawPoint(idx));
  };

  const drawProgressBar = (ctx, pct, label) => {
    // Draw outer boundary box
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fillRect(15, 80, 20, 160);
    
    // Draw fill bar
    const fillHeight = (pct / 100) * 160;
    ctx.fillStyle = "rgba(6, 182, 212, 0.85)"; // Neon cyan
    ctx.fillRect(15, 80 + (160 - fillHeight), 20, fillHeight);
    
    // Draw border
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(15, 80, 20, 160);
    
    // Text label
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 10px Inter, sans-serif";
    ctx.fillText(`${Math.round(pct)}%`, 13, 70);
    ctx.fillText(label, 10, 255);
  };

  const onPoseResults = (results) => {
    if (!results.poseLandmarks) return;

    const ctx = canvasRef.current.getContext("2d");
    drawSkeleton(ctx, results.poseLandmarks);

    const lm = results.poseLandmarks;
    const currentExerciseId = exerciseIdRef.current;
    const currentConfig = EXERCISES[currentExerciseId];
    
    // Choose active side
    const leftSh = lm[11], leftHip = lm[23], leftEl = lm[13], leftWr = lm[15];
    const rightSh = lm[12], rightHip = lm[24], rightEl = lm[14], rightWr = lm[16];
    const side = (leftSh.z < rightSh.z) ? "left" : "right";

    const sh = side === "left" ? lm[11] : lm[12];
    const el = side === "left" ? lm[13] : lm[14];
    const wr = side === "left" ? lm[15] : lm[16];
    const hp = side === "left" ? lm[23] : lm[24];
    const kn = side === "left" ? lm[25] : lm[26];
    const ak = side === "left" ? lm[27] : lm[28];

    if (sh.visibility < 0.5 || hp.visibility < 0.5) {
      setFeedback("Ensure your body is fully visible to the camera! 📷");
      setFeedbackClass("banner-danger");
      return;
    }

    let currentFeedback = "Perfect form! Keep going! ⚡";
    let currentFeedbackClass = "banner-success";
    let activeAngle = 0;
    let rangePct = 0;

    // --- Biomechanical Calculations ---
    if (currentExerciseId === "bicep_curl") {
      const elbowAngle = findAngle(sh, el, wr);
      const shoulderAngle = findAngle(hp, sh, el);
      setAngleReadings([elbowAngle, shoulderAngle, 0]);
      activeAngle = elbowAngle;
      
      // elbow range: 140 (0%) down to 85 (100%)
      rangePct = Math.max(0, Math.min(100, ((140 - elbowAngle) / (140 - 85)) * 100));

      let state = "s1";
      if (elbowAngle > 140) state = "s1";
      else if (elbowAngle > 85 && elbowAngle <= 140) state = "s2";
      else if (elbowAngle <= 85) state = "s3";

      if (state === "s2") {
        if (!stateSeq.current.includes("s2")) stateSeq.current.push("s2");
      } else if (state === "s3") {
        if (!stateSeq.current.includes("s3") && stateSeq.current.includes("s2")) stateSeq.current.push("s3");
      } else if (state === "s1") {
        if (stateSeq.current.includes("s2") && stateSeq.current.includes("s3")) {
          if (!incorrectPosture.current) {
            repsRef.current = repsRef.current + 1;
            setReps(repsRef.current);
            speak(`${repsRef.current}`);
          } else {
            incorrectRef.current = incorrectRef.current + 1;
            setIncorrect(incorrectRef.current);
            speak("Incorrect form");
          }
        } else if (stateSeq.current.includes("s2")) {
          incorrectRef.current = incorrectRef.current + 1;
          setIncorrect(incorrectRef.current);
          speak("Lift higher");
        }
        stateSeq.current = [];
        incorrectPosture.current = false;
      }

      if (shoulderAngle > 22) {
        incorrectPosture.current = true;
        currentFeedback = "Pin your elbows to your sides! ⚠️";
        currentFeedbackClass = "banner-warning";
        speak("Pin elbows");
        recordError("elbow_flare");
      }
    } 
    
    else if (currentExerciseId === "squat") {
      const kneeAngle = findAngle(hp, kn, ak);
      const hipAngle = findAngle(sh, hp, kn);
      setAngleReadings([kneeAngle, hipAngle, 0]);
      activeAngle = kneeAngle;
      
      // knee range: 150 (0%) down to 105 (100%)
      rangePct = Math.max(0, Math.min(100, ((150 - kneeAngle) / (150 - 105)) * 100));

      let state = "s1";
      if (kneeAngle > 150) state = "s1";
      else if (kneeAngle > 105 && kneeAngle <= 150) state = "s2";
      else if (kneeAngle <= 105) state = "s3";

      if (state === "s2") {
        if (!stateSeq.current.includes("s2")) stateSeq.current.push("s2");
      } else if (state === "s3") {
        if (!stateSeq.current.includes("s3") && stateSeq.current.includes("s2")) stateSeq.current.push("s3");
      } else if (state === "s1") {
        if (stateSeq.current.includes("s2") && stateSeq.current.includes("s3")) {
          if (!incorrectPosture.current) {
            repsRef.current = repsRef.current + 1;
            setReps(repsRef.current);
            speak(`${repsRef.current}`);
          } else {
            incorrectRef.current = incorrectRef.current + 1;
            setIncorrect(incorrectRef.current);
            speak("Check spine alignment");
          }
        } else if (stateSeq.current.includes("s2")) {
          incorrectRef.current = incorrectRef.current + 1;
          setIncorrect(incorrectRef.current);
          speak("Lower hips more");
        }
        stateSeq.current = [];
        incorrectPosture.current = false;
      }

      if (hipAngle < 80) {
        incorrectPosture.current = true;
        currentFeedback = "Keep your chest up and back straight! ⚠️";
        currentFeedbackClass = "banner-warning";
        speak("Keep chest up");
        recordError("forward_lean");
      }
    } 
    
    else if (currentExerciseId === "pushups") {
      const elbowAngle = findAngle(sh, el, wr);
      const bodyAngle = findAngle(sh, hp, ak);
      setAngleReadings([elbowAngle, bodyAngle, 0]);
      activeAngle = elbowAngle;
      
      // elbow range: 145 (0%) down to 95 (100%)
      rangePct = Math.max(0, Math.min(100, ((145 - elbowAngle) / (145 - 95)) * 100));

      let state = "s1";
      if (elbowAngle > 145) state = "s1";
      else if (elbowAngle > 95 && elbowAngle <= 145) state = "s2";
      else if (elbowAngle <= 95) state = "s3";

      if (state === "s2") {
        if (!stateSeq.current.includes("s2")) stateSeq.current.push("s2");
      } else if (state === "s3") {
        if (!stateSeq.current.includes("s3") && stateSeq.current.includes("s2")) stateSeq.current.push("s3");
      } else if (state === "s1") {
        if (stateSeq.current.includes("s2") && stateSeq.current.includes("s3")) {
          if (!incorrectPosture.current) {
            repsRef.current = repsRef.current + 1;
            setReps(repsRef.current);
            speak(`${repsRef.current}`);
          } else {
            incorrectRef.current = incorrectRef.current + 1;
            setIncorrect(incorrectRef.current);
            speak("Body sag");
          }
        } else if (stateSeq.current.includes("s2")) {
          incorrectRef.current = incorrectRef.current + 1;
          setIncorrect(incorrectRef.current);
          speak("Lower chest further");
        }
        stateSeq.current = [];
        incorrectPosture.current = false;
      }

      if (bodyAngle < 155 || bodyAngle > 200) {
        incorrectPosture.current = true;
        currentFeedback = "Keep your body in a straight line! ⚠️";
        currentFeedbackClass = "banner-warning";
        speak("Straighten hips");
        recordError("hip_sag");
      }
    } 
    
    else if (currentExerciseId === "tricep_kickback") {
      const elbowAngle = findAngle(sh, el, wr);
      const shAngle = findAngle(hp, sh, el);
      setAngleReadings([elbowAngle, shAngle, 0]);
      activeAngle = elbowAngle;
      
      // elbow range: 95 (0%) up to 140 (100%)
      rangePct = Math.max(0, Math.min(100, ((elbowAngle - 95) / (140 - 95)) * 100));

      let state = "s1";
      if (elbowAngle < 95) state = "s1";
      else if (elbowAngle >= 95 && elbowAngle <= 140) state = "s2";
      else if (elbowAngle > 140) state = "s3";

      if (state === "s2") {
        if (!stateSeq.current.includes("s2")) stateSeq.current.push("s2");
      } else if (state === "s3") {
        if (!stateSeq.current.includes("s3") && stateSeq.current.includes("s2")) stateSeq.current.push("s3");
      } else if (state === "s1") {
        if (stateSeq.current.includes("s2") && stateSeq.current.includes("s3")) {
          if (!incorrectPosture.current) {
            repsRef.current = repsRef.current + 1;
            setReps(repsRef.current);
            speak(`${repsRef.current}`);
          }
        }
        stateSeq.current = [];
        incorrectPosture.current = false;
      }

      if (shAngle < 75) {
        incorrectPosture.current = true;
        currentFeedback = "Keep your elbow high! Upper arm horizontal! ⚠️";
        currentFeedbackClass = "banner-warning";
        recordError("elbow_drop");
      }
    } 
    
    else if (currentExerciseId === "dumbbell_fly") {
      const elbowAngle = findAngle(sh, el, wr);
      const lateralAngle = findAngle(hp, sh, el);
      setAngleReadings([elbowAngle, lateralAngle, 0]);
      activeAngle = lateralAngle;
      
      // lateral range: 35 (0%) up to 80 (100%)
      rangePct = Math.max(0, Math.min(100, ((lateralAngle - 35) / (80 - 35)) * 100));

      let state = "s1";
      if (lateralAngle < 35) state = "s1";
      else if (lateralAngle >= 35 && lateralAngle <= 80) state = "s2";
      else if (lateralAngle > 80) state = "s3";

      if (state === "s2") {
        if (!stateSeq.current.includes("s2")) stateSeq.current.push("s2");
      } else if (state === "s3") {
        if (!stateSeq.current.includes("s3") && stateSeq.current.includes("s2")) stateSeq.current.push("s3");
      } else if (state === "s1") {
        if (stateSeq.current.includes("s2") && stateSeq.current.includes("s3")) {
          if (!incorrectPosture.current) {
            repsRef.current = repsRef.current + 1;
            setReps(repsRef.current);
            speak(`${repsRef.current}`);
          }
        }
        stateSeq.current = [];
        incorrectPosture.current = false;
      }

      if (elbowAngle > 170) {
        incorrectPosture.current = true;
        currentFeedback = "Keep a slight bend in your elbows! Do not lock! ⚠️";
        currentFeedbackClass = "banner-warning";
        recordError("locked_elbows");
      }
    }

    else if (currentExerciseId === "lunge") {
      const frontKneeAngle = findAngle(hp, kn, ak);
      const torsoAngle = findAngle(sh, hp, kn);
      setAngleReadings([frontKneeAngle, torsoAngle, 0]);
      activeAngle = frontKneeAngle;
      
      // front knee range: 150 (0%) down to 95 (100%)
      rangePct = Math.max(0, Math.min(100, ((150 - frontKneeAngle) / (150 - 95)) * 100));

      let state = "s1";
      if (frontKneeAngle > 150) state = "s1";
      else if (frontKneeAngle > 95 && frontKneeAngle <= 150) state = "s2";
      else if (frontKneeAngle <= 95) state = "s3";

      if (state === "s2") {
        if (!stateSeq.current.includes("s2")) stateSeq.current.push("s2");
      } else if (state === "s3") {
        if (!stateSeq.current.includes("s3") && stateSeq.current.includes("s2")) stateSeq.current.push("s3");
      } else if (state === "s1") {
        if (stateSeq.current.includes("s2") && stateSeq.current.includes("s3")) {
          if (!incorrectPosture.current) {
            repsRef.current = repsRef.current + 1;
            setReps(repsRef.current);
            speak(`${repsRef.current}`);
          }
        }
        stateSeq.current = [];
        incorrectPosture.current = false;
      }

      if (torsoAngle < 70) {
        incorrectPosture.current = true;
        currentFeedback = "Keep your torso upright! Don't lean forward! ⚠️";
        currentFeedbackClass = "banner-warning";
        speak("Keep torso upright");
        recordError("forward_lean");
      }
    }

    else if (currentExerciseId === "shoulder_press") {
      const elbowAngle = findAngle(sh, el, wr);
      const shoulderAngle = findAngle(hp, sh, el);
      setAngleReadings([elbowAngle, shoulderAngle, 0]);
      activeAngle = elbowAngle;
      
      // elbow range: 100 (0%) up to 150 (100%)
      rangePct = Math.max(0, Math.min(100, ((elbowAngle - 100) / (150 - 100)) * 100));

      let state = "s1";
      if (elbowAngle < 100) state = "s1";
      else if (elbowAngle >= 100 && elbowAngle <= 150) state = "s2";
      else if (elbowAngle > 150) state = "s3";

      if (state === "s2") {
        if (!stateSeq.current.includes("s2")) stateSeq.current.push("s2");
      } else if (state === "s3") {
        if (!stateSeq.current.includes("s3") && stateSeq.current.includes("s2")) stateSeq.current.push("s3");
      } else if (state === "s1") {
        if (stateSeq.current.includes("s2") && stateSeq.current.includes("s3")) {
          if (!incorrectPosture.current) {
            repsRef.current = repsRef.current + 1;
            setReps(repsRef.current);
            speak(`${repsRef.current}`);
          }
        }
        stateSeq.current = [];
        incorrectPosture.current = false;
      }

      if (shoulderAngle < 60) {
        incorrectPosture.current = true;
        currentFeedback = "Keep your elbows flared out at 90 degrees! ⚠️";
        currentFeedbackClass = "banner-warning";
        recordError("elbows_inward");
      }
    }

    else if (currentExerciseId === "jumping_jacks") {
      // Jumping Jacks: Arms go from side down (~15 deg) to overhead (>130 deg)
      const leftArmAngle = findAngle(leftHip, leftSh, leftEl);
      const rightArmAngle = findAngle(rightHip, rightSh, rightEl);
      
      // Leg separation distance normalized by shoulder width (completely distance independent)
      const legDist = distance(lm[27], lm[28]);
      const shWidth = distance(leftSh, rightSh) || 0.1;
      const legSeparationRatio = legDist / shWidth;
      
      // Leg Separation proxy angle (40 standing to 130 wide jump)
      const legSeparationAngle = Math.round(Math.min(140, Math.max(40, legSeparationRatio * 60)));
      setAngleReadings([leftArmAngle, rightArmAngle, legSeparationAngle]);
      activeAngle = leftArmAngle;

      // Arm range: 35 (0%) up to 125 (100%)
      rangePct = Math.max(0, Math.min(100, ((leftArmAngle - 35) / (125 - 35)) * 100));

      let state = "s1";
      if (leftArmAngle < 45 && legSeparationRatio < 0.95) {
        state = "s1";
      } else if (leftArmAngle >= 45 && leftArmAngle <= 110) {
        state = "s2";
      } else if (leftArmAngle > 110 && legSeparationRatio > 1.35) {
        state = "s3";
      }

      if (state === "s2") {
        if (!stateSeq.current.includes("s2")) stateSeq.current.push("s2");
      } else if (state === "s3") {
        if (!stateSeq.current.includes("s3") && stateSeq.current.includes("s2")) stateSeq.current.push("s3");
      } else if (state === "s1") {
        if (stateSeq.current.includes("s2") && stateSeq.current.includes("s3")) {
          if (!incorrectPosture.current) {
            repsRef.current = repsRef.current + 1;
            setReps(repsRef.current);
            speak(`${repsRef.current}`);
          } else {
            incorrectRef.current = incorrectRef.current + 1;
            setIncorrect(incorrectRef.current);
            speak("Incomplete jack");
          }
        }
        stateSeq.current = [];
        incorrectPosture.current = false;
      }

      if (Math.abs(leftArmAngle - rightArmAngle) > 30) {
        incorrectPosture.current = true;
        currentFeedback = "Raise both arms symmetrically overhead! ⚠️";
        currentFeedbackClass = "banner-warning";
        recordError("arm_asymmetry");
      }
    }

    else if (currentExerciseId === "high_knees") {
      const leftTorso = distance(leftSh, leftHip);
      const rightTorso = distance(rightSh, rightHip);
      const torsoHeight = (leftTorso + rightTorso) / 2 || 0.1;

      const leftLift = (leftHip.y - lm[25].y) / torsoHeight;
      const rightLift = (rightHip.y - lm[26].y) / torsoHeight;

      const leftLiftVal = Math.round(Math.max(0, (leftLift + 0.2) * 150));
      const rightLiftVal = Math.round(Math.max(0, (rightLift + 0.2) * 150));

      const torsoAngle = findAngle(sh, hp, { x: hp.x, y: hp.y + 0.5 });
      setAngleReadings([leftLiftVal, rightLiftVal, torsoAngle]);

      activeAngle = Math.max(leftLiftVal, rightLiftVal);
      rangePct = Math.max(0, Math.min(100, ((Math.max(leftLift, rightLift) - (-0.1)) / (0.2 - (-0.1))) * 100));

      let state = "s1";
      if (leftLift < -0.05 && rightLift < -0.05) {
        state = "s1";
      } else if (leftLift >= 0.15 || rightLift >= 0.15) {
        state = "s3";
      } else {
        state = "s2";
      }

      if (state === "s2") {
        if (!stateSeq.current.includes("s2")) stateSeq.current.push("s2");
      } else if (state === "s3") {
        if (!stateSeq.current.includes("s3") && stateSeq.current.includes("s2")) stateSeq.current.push("s3");
      } else if (state === "s1") {
        if (stateSeq.current.includes("s2") && stateSeq.current.includes("s3")) {
          if (!incorrectPosture.current) {
            repsRef.current = repsRef.current + 1;
            setReps(repsRef.current);
            speak(`${repsRef.current}`);
          } else {
            incorrectRef.current = incorrectRef.current + 1;
            setIncorrect(incorrectRef.current);
            speak("Lean forward");
          }
        }
        stateSeq.current = [];
        incorrectPosture.current = false;
      }

      if (torsoAngle < 165) {
        incorrectPosture.current = true;
        currentFeedback = "Keep your torso upright! Don't lean back! ⚠️";
        currentFeedbackClass = "banner-warning";
        speak("Don't lean back");
        recordError("leaning_back");
      }
    }

    else if (currentExerciseId === "burpees") {
      const heightToWidthRatio = Math.abs(sh.y - ak.y) / (Math.abs(sh.x - ak.x) || 0.1);
      const bodyAngle = findAngle(sh, hp, ak);
      const handsReach = Math.round(Math.max(0, (sh.y - Math.min(leftWr.y, rightWr.y)) * 100));

      setAngleReadings([
        Math.round(heightToWidthRatio * 100),
        bodyAngle,
        handsReach
      ]);

      activeAngle = bodyAngle;
      
      const hasPlanked = stateSeq.current.includes("plank");
      if (!hasPlanked) {
        rangePct = Math.max(0, Math.min(100, ((1.5 - heightToWidthRatio) / (1.5 - 0.6)) * 100));
      } else {
        rangePct = Math.max(0, Math.min(100, ((heightToWidthRatio - 0.6) / (1.2 - 0.6)) * 100));
      }

      if (heightToWidthRatio < 0.6) {
        if (!stateSeq.current.includes("plank")) {
          stateSeq.current.push("plank");
        }
      } else if (heightToWidthRatio > 1.1 && leftWr.y < leftSh.y && rightWr.y < rightSh.y) {
        if (stateSeq.current.includes("plank") && !stateSeq.current.includes("jump")) {
          stateSeq.current.push("jump");
        }
      } else if (heightToWidthRatio > 1.1 && leftWr.y >= leftSh.y && rightWr.y >= rightSh.y) {
        if (stateSeq.current.includes("plank") && stateSeq.current.includes("jump")) {
          if (!incorrectPosture.current) {
            repsRef.current = repsRef.current + 1;
            setReps(repsRef.current);
            speak(`${repsRef.current}`);
          } else {
            incorrectRef.current = incorrectRef.current + 1;
            setIncorrect(incorrectRef.current);
            speak("Straighten back");
          }
          stateSeq.current = [];
          incorrectPosture.current = false;
        }
      }

      if (heightToWidthRatio < 0.6 && (bodyAngle < 155 || bodyAngle > 200)) {
        incorrectPosture.current = true;
        currentFeedback = "Keep your body in a straight line during plank! ⚠️";
        currentFeedbackClass = "banner-warning";
        speak("Straighten hips");
        recordError("hip_sag");
      }
    }

    // --- Side-View Alignment Warning (README feature corrected inversion) ---
    const nose = lm[0];
    if (nose && leftSh && rightSh) {
      const offsetAngle = findAngle(leftSh, rightSh, nose);
      if (currentConfig.view === "side" && offsetAngle < 44) {
        currentFeedback = "Please rotate to maintain a side view! ⚠️";
        currentFeedbackClass = "banner-warning";
        speak("Align side view");
      } else if (currentConfig.view === "frontal" && offsetAngle > 44) {
        currentFeedback = "Please face the camera directly! Frontal view! ⚠️";
        currentFeedbackClass = "banner-warning";
        speak("Face the camera");
      }
    }

    // --- Inactivity Timer (README feature) ---
    if (Math.abs(activeAngle - prevAngleRef.current) > 2.0) {
      prevAngleRef.current = activeAngle;
      lastActiveTimestampRef.current = Date.now();
    } else {
      const elapsedInactive = Date.now() - lastActiveTimestampRef.current;
      if (elapsedInactive > 10000) { // 10 seconds of inactivity
        if (repsRef.current > 0 || incorrectRef.current > 0 || stateSeq.current.length > 0) {
          repsRef.current = 0;
          incorrectRef.current = 0;
          setReps(0);
          setIncorrect(0);
          stateSeq.current = [];
          incorrectPosture.current = false;
          speak("Resetting reps due to inactivity");
        }
        lastActiveTimestampRef.current = Date.now(); // Reset trigger
      }
    }

    // Draw rep progress bar directly on canvas
    drawProgressBar(ctx, rangePct, "REP RANGE");

    setFeedback(currentFeedback);
    setFeedbackClass(currentFeedbackClass);
  };

  // Video loop frame capture for Demo Mode
  const processVideoFrame = async () => {
    if (activeRef.current && sourceType === "demo" && videoRef.current && !videoRef.current.paused && !videoRef.current.ended) {
      if (poseInstance.current) {
        try {
          await poseInstance.current.send({ image: videoRef.current });
        } catch (e) {
          console.error(e);
        }
      }
      if (videoRef.current.requestVideoFrameCallback) {
        animationFrameId.current = videoRef.current.requestVideoFrameCallback(processVideoFrame);
      } else {
        animationFrameId.current = setTimeout(processVideoFrame, 33);
      }
    }
  };

  const startCamera = async () => {
    setLoading(true);
    setSessionSaved(false);
    setSessionSummary(null);
    repsRef.current = 0;
    incorrectRef.current = 0;
    setReps(0);
    setIncorrect(0);
    setPostureScore(0);
    stateSeq.current = [];
    incorrectPosture.current = false;
    startTime.current = Date.now();
    lastActiveTimestampRef.current = Date.now();
    activeRef.current = true;
    formErrorsRef.current = {};
    consecutiveIncorrectRef.current = 0;

    try {
      if (!poseInstance.current) {
        const p = new window.Pose({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
        });
        p.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.6
        });
        p.onResults(onPoseResults);
        poseInstance.current = p;
      }

      if (sourceType === "demo") {
        if (videoRef.current) {
          videoRef.current.src = config.videoUrl;
          videoRef.current.loop = true;
          videoRef.current.muted = true;
          videoRef.current.crossOrigin = "anonymous";
          await videoRef.current.play();
          setActive(true);
          if (videoRef.current.requestVideoFrameCallback) {
            animationFrameId.current = videoRef.current.requestVideoFrameCallback(processVideoFrame);
          } else {
            animationFrameId.current = setTimeout(processVideoFrame, 33);
          }
        }
      } else {
        if (videoRef.current) {
          const c = new window.Camera(videoRef.current, {
            onFrame: async () => {
              if (activeRef.current && poseInstance.current) {
                await poseInstance.current.send({ image: videoRef.current });
              }
            },
            width: 640,
            height: 480
          });
          await c.start();
          cameraInstance.current = c;
          setActive(true);
        }
      }
    } catch (e) {
      console.error(e);
      setFeedback("Failed to launch media source! 📷");
      setFeedbackClass("banner-danger");
      activeRef.current = false;
    }
    setLoading(false);
  };

  const stopCamera = () => {
    activeRef.current = false;
    if (animationFrameId.current) {
      if (typeof animationFrameId.current === "number") {
        clearTimeout(animationFrameId.current);
      } else if (videoRef.current && videoRef.current.cancelVideoFrameCallback) {
        videoRef.current.cancelVideoFrameCallback(animationFrameId.current);
      }
      animationFrameId.current = null;
    }

    if (sourceType === "demo") {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = "";
      }
    } else {
      if (cameraInstance.current) {
        cameraInstance.current.stop();
        cameraInstance.current = null;
      }
    }

    // Clear leftover posture detection points on canvas immediately
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    setActive(false);
    setFeedback("Trainer stopped. Align to camera to start again. ⚡");
    setFeedbackClass("banner-warning");
  };

  useEffect(() => {
    const total = reps + incorrect;
    if (total > 0) {
      setPostureScore(Math.round((reps / total) * 100));
    } else {
      setPostureScore(0);
    }
  }, [reps, incorrect]);

  useEffect(() => {
    if (reps > 0) {
      consecutiveIncorrectRef.current = 0;
    }
  }, [reps]);

  useEffect(() => {
    if (incorrect > 0) {
      consecutiveIncorrectRef.current += 1;
      if (consecutiveIncorrectRef.current === 3) {
        speak("Fatigue detected. Take a short rest or focus on form.");
        setFeedback("AI Alert: Fatigue detected! Consider taking a short rest. 🧘");
        setFeedbackClass("banner-warning");
      }
    }
  }, [incorrect]);

  const handleEndSession = () => {
    if (!startTime.current) return;
    
    stopCamera();
    const duration = Math.round((Date.now() - startTime.current) / 1000);
    
    // Determine primary error from breakdown
    const errors = formErrorsRef.current;
    let primaryError = "";
    let maxCount = 0;
    Object.keys(errors).forEach(key => {
      if (errors[key] > maxCount) {
        maxCount = errors[key];
        primaryError = key;
      }
    });

    const adviceMap = {
      elbow_flare: "Focus on keeping your elbows pinned close to your sides.",
      forward_lean: "Keep your chest lifted and avoid leaning your torso too far forward.",
      hip_sag: "Keep your core engaged to prevent your hips from sagging or arching.",
      locked_elbows: "Avoid locking your joints at the end of the range. Keep a slight bend.",
      elbow_drop: "Keep your upper arms horizontal and elbows high.",
      elbows_inward: "Keep your elbows flared out at 90 degrees.",
      arm_asymmetry: "Focus on raising both arms symmetrically overhead.",
      leaning_back: "Keep your torso upright and avoid leaning backwards."
    };

    const coachingTip = adviceMap[primaryError] || "Exceptional posture! Flawless movement execution.";

    const summary = saveSession(exerciseId, reps, incorrect, postureScore, duration, errors);
    
    const stars = Math.min(5, Math.max(1, Math.round(postureScore / 20)));
    setSessionSummary({
      ...summary,
      duration,
      stars,
      coachingTip
    });
    setSessionSaved(true);
    speak("Session saved successfully");
  };

  useEffect(() => {
    return () => {
      activeRef.current = false;
      if (cameraInstance.current) {
        cameraInstance.current.stop();
      }
    };
  }, []);

  return (
    <div>
      <style>{`
        .simulated-fullscreen {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          z-index: 99999 !important;
          border-radius: 0 !important;
          margin: 0 !important;
          background-color: #000000 !important;
        }
        body.fullscreen-active aside {
          display: none !important;
        }
        body.fullscreen-active .trainer-header {
          display: none !important;
        }
        body.fullscreen-active .live-panel {
          display: none !important;
        }
        body.fullscreen-active .camera-card {
          border: none !important;
          background: none !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          box-shadow: none !important;
          padding: 0 !important;
          margin: 0 !important;
          transform: none !important;
          transition: none !important;
          position: static !important;
          z-index: auto !important;
        }
        body.fullscreen-active .grid-2 {
          display: block !important;
          gap: 0 !important;
        }
        body.fullscreen-active .main-content {
          padding: 0 !important;
          margin: 0 !important;
          max-width: 100vw !important;
          max-height: 100vh !important;
          overflow: hidden !important;
          width: 100vw !important;
          height: 100vh !important;
        }
      `}</style>
      <div className="trainer-header" style={{ marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: "1.75rem" }}>⚡ AI Posture Trainer</h2>
        <p style={{ color: "var(--muted)", marginTop: "2px", fontSize: "13px" }}>
          Real-time biomechanics analysis. Select "Demo Video" to test the AI on our sample workout.
        </p>
      </div>

      <div className="grid-2" style={{ gap: "1rem" }}>
        {/* Camera Feed Card */}
        <div className="camera-card card" style={{ display: "flex", flexDirection: "column", padding: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "6px" }}>
            <h3 style={{ fontSize: "14px" }}>⚡ Activity Frame</h3>
            <div style={{ display: "flex", gap: "6px" }}>
              <select
                className="select"
                style={{ width: "auto", margin: 0, padding: "4px 8px", fontSize: "12px", height: "30px" }}
                value={sourceType}
                disabled={active}
                onChange={(e) => setSourceType(e.target.value)}
              >
                <option value="demo">🎬 Demo Video</option>
                <option value="webcam">📹 Live Webcam</option>
              </select>

              <select
                className="select"
                style={{ width: "auto", margin: 0, padding: "4px 8px", fontSize: "12px", height: "30px" }}
                value={exerciseId}
                disabled={active}
                onChange={(e) => {
                  setExerciseId(e.target.value);
                  setSelectedExercise(e.target.value);
                }}
              >
                {Object.keys(EXERCISES).map((key) => (
                  <option key={key} value={key}>
                    {EXERCISES[key].name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div
            ref={containerRef}
            className={isFullscreen ? "simulated-fullscreen" : ""}
            style={{
              position: "relative",
              width: "100%",
              backgroundColor: "#000000",
              borderRadius: isFullscreen ? "0px" : "10px",
              overflow: "hidden",
              height: isFullscreen ? "100vh" : "240px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <video
              ref={videoRef}
              style={{ width: "100%", height: "100%", objectFit: "contain", transform: sourceType === "webcam" ? "scaleX(-1)" : "none", display: active ? "block" : "none" }}
              playsInline
              muted
            />
            <canvas
              ref={canvasRef}
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "contain", transform: sourceType === "webcam" ? "scaleX(-1)" : "none" }}
              width={640}
              height={480}
            />

            {/* Fullscreen Heads-Up Display (HUD) */}
            {isFullscreen && (
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "24px",
                pointerEvents: "none",
                zIndex: 9
              }}>
                {/* HUD Header */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  width: "100%",
                  pointerEvents: "none"
                }}>
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    background: "rgba(10, 15, 25, 0.8)",
                    backdropFilter: "blur(12px)",
                    padding: "10px 16px",
                    borderRadius: "14px",
                    border: "1.5px solid rgba(255, 255, 255, 0.1)",
                    pointerEvents: "auto"
                  }}>
                    <span style={{ fontSize: "15px", fontWeight: "bold", color: "#FFFFFF" }}>{config.name}</span>
                    <div style={{ display: "flex", gap: "6px", marginTop: "2px" }}>
                      <span style={{ fontSize: "10px", color: "var(--accent-light)", background: "rgba(45, 212, 191, 0.15)", padding: "2px 6px", borderRadius: "6px", fontWeight: "bold" }}>{config.target}</span>
                      <span style={{ fontSize: "10px", color: "var(--accent)", background: "rgba(99, 102, 241, 0.15)", padding: "2px 6px", borderRadius: "6px", fontWeight: "bold" }}>{config.view} View</span>
                    </div>
                  </div>
                  
                  {/* Floating Feedback Banner */}
                  <div className={`banner ${feedbackClass}`} style={{
                    margin: "0 auto",
                    padding: "12px 24px",
                    fontSize: "16px",
                    borderRadius: "14px",
                    boxShadow: "0 12px 30px rgba(0, 0, 0, 0.65)",
                    pointerEvents: "auto",
                    textAlign: "center",
                    maxWidth: "400px",
                    backdropFilter: "blur(8px)"
                  }}>
                    {feedback}
                  </div>

                  {/* Spacer to push minimize button */}
                  <div style={{ width: "90px" }} />
                </div>

                {/* HUD Footer (Stats HUD) */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                  pointerEvents: "auto",
                  background: "rgba(10, 15, 25, 0.82)",
                  backdropFilter: "blur(16px)",
                  padding: "14px 28px",
                  borderRadius: "20px",
                  border: "1.5px solid rgba(255, 255, 255, 0.12)",
                  maxWidth: "360px",
                  margin: "0",
                  alignSelf: "flex-start",
                  boxShadow: "0 20px 45px rgba(0,0,0,0.6)"
                }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "90px" }}>
                    <span style={{ fontSize: "10px", color: "var(--muted)", fontWeight: "bold", letterSpacing: "1px" }}>REPS</span>
                    <span style={{ fontSize: "36px", fontWeight: "bold", color: "var(--accent)", marginTop: "2px" }}>{reps}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "90px" }}>
                    <span style={{ fontSize: "10px", color: "var(--muted)", fontWeight: "bold", letterSpacing: "1px" }}>POSTURE</span>
                    <span style={{ fontSize: "36px", fontWeight: "bold", color: "var(--accent-light)", marginTop: "2px" }}>{postureScore}%</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "90px" }}>
                    <span style={{ fontSize: "10px", color: "var(--muted)", fontWeight: "bold", letterSpacing: "1px" }}>IMPROPER</span>
                    <span style={{ fontSize: "36px", fontWeight: "bold", color: "var(--danger)", marginTop: "2px" }}>{incorrect}</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Fullscreen Button Overlay */}
            {active && (
              <button
                type="button"
                onClick={toggleFullscreen}
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  background: "rgba(10, 15, 25, 0.7)",
                  backdropFilter: "blur(4px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "#FFFFFF",
                  padding: "5px 10px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 10,
                  transition: "all 0.2s ease"
                }}
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? "🗙 Minimize" : "⛶ Fullscreen"}
              </button>
            )}

            {!active && (
              <div style={{ position: "absolute", textAlign: "center", padding: "1rem" }}>
                <span style={{ fontSize: "2rem" }}>📹</span>
                <p style={{ color: "#9CA3AF", marginTop: "4px", fontSize: "12px" }}>Trainer offline</p>
              </div>
            )}
            {loading && (
              <div style={{ position: "absolute", backgroundColor: "rgba(0,0,0,0.7)", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ color: "#FFFFFF", fontSize: "12px" }}>Initializing MediaPipe Pose...</div>
              </div>
            )}
          </div>

          <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
            {!active ? (
              <button className="btn btn-primary" onClick={startCamera} style={{ flex: 1, padding: "8px 16px", fontSize: "13px" }}>
                ▶ Start Trainer
              </button>
            ) : (
              <button className="btn btn-danger" onClick={stopCamera} style={{ flex: 1, padding: "8px 16px", fontSize: "13px" }}>
                🛑 Stop Trainer
              </button>
            )}
            <button
              className="btn btn-secondary"
              disabled={reps === 0 && incorrect === 0}
              onClick={handleEndSession}
              style={{ padding: "8px 16px", fontSize: "13px" }}
            >
              📥 Save Session
            </button>
          </div>
        </div>

        {/* Live Performance Panel */}
        <div className="live-panel" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {/* Target Muscle / Exercise Info */}
          <div className="card" style={{ padding: "1rem" }}>
            <h3 style={{ fontSize: "15px", color: "var(--accent)" }}>{config.name}</h3>
            <div style={{ display: "flex", gap: "6px", margin: "4px 0 8px", flexWrap: "wrap" }}>
              <span className="badge-muscle">{config.target}</span>
              <span className={`badge badge-${config.diff.toLowerCase()}`}>{config.diff}</span>
              <span className="badge-muscle">{config.view} View</span>
            </div>
            <p style={{ fontSize: "12px", color: "var(--muted)", lineHeight: 1.4 }}>
              <b>Setup:</b> {config.tip}
            </p>
          </div>

          {/* Feedback Banner */}
          <div className={`banner ${feedbackClass}`} style={{ margin: 0, padding: "8px 16px", fontSize: "13px" }}>{feedback}</div>

          {/* Real-time stats */}
          <div className="grid-3" style={{ gap: "8px" }}>
            <div className="metric-box" style={{ background: "var(--card)", padding: "8px", borderRadius: "10px", border: "1px solid var(--border)", textAlign: "center" }}>
              <div style={{ fontSize: "9px", color: "var(--muted)", fontWeight: 700, letterSpacing: "0.5px" }}>REPS</div>
              <div style={{ fontSize: "28px", fontWeight: 700, color: "var(--text)", marginTop: "2px" }}>{reps}</div>
            </div>
            <div className="metric-box" style={{ background: "var(--card)", padding: "8px", borderRadius: "10px", border: "1px solid var(--border)", textAlign: "center" }}>
              <div style={{ fontSize: "9px", color: "var(--muted)", fontWeight: 700, letterSpacing: "0.5px" }}>POSTURE</div>
              <div style={{ fontSize: "28px", fontWeight: 700, color: "var(--accent-light)", marginTop: "2px" }}>{postureScore}%</div>
            </div>
            <div className="metric-box" style={{ background: "var(--card)", padding: "8px", borderRadius: "10px", border: "1px solid var(--border)", textAlign: "center" }}>
              <div style={{ fontSize: "9px", color: "var(--muted)", fontWeight: 700, letterSpacing: "0.5px" }}>IMPROPER</div>
              <div style={{ fontSize: "28px", fontWeight: 700, color: "var(--danger)", marginTop: "2px" }}>{incorrect}</div>
            </div>
          </div>

          {/* Biomechanical angles readings */}
          <div className="card" style={{ flex: 1, padding: "1rem" }}>
            <h3 style={{ fontSize: "13px", marginBottom: "8px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "4px" }}>
              Angles & Coaching
            </h3>
            {config.angles.map((label, idx) => {
              const val = angleReadings[idx] || 0;
              const pct = Math.min(100, Math.round((val / 180) * 100));
              return (
                <div key={idx} style={{ marginBottom: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--muted)" }}>
                    <span>{label}</span>
                    <span style={{ color: "var(--accent-light)", fontWeight: 600 }}>{val}°</span>
                  </div>
                  <div style={{ height: "4px", backgroundColor: "#111625", borderRadius: "2px", marginTop: "2px", overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg, var(--accent), var(--accent-light))", borderRadius: "2px" }} />
                  </div>
                </div>
              );
            })}

            <div style={{ marginTop: "10px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={voiceEnabled}
                  onChange={(e) => setVoiceEnabled(e.target.checked)}
                  style={{ width: "14px", height: "14px", accentColor: "var(--accent)" }}
                />
                <span style={{ fontSize: "12px", color: "var(--text)", fontWeight: 550 }}>🔊 TTS Audio Coaching</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Session summary details card */}
      {sessionSaved && sessionSummary && (
        <div className="card" style={{ marginTop: "1rem", padding: "1rem", border: "1.5px solid var(--accent)", background: "linear-gradient(135deg, rgba(99,102,241,0.06), transparent)", marginBottom: 0 }}>
          <h3 style={{ fontSize: "14px", color: "var(--accent)", marginBottom: "4px" }}>📈 Session Summary</h3>
          <p style={{ fontSize: "12px", color: "var(--muted)", lineHeight: 1.4 }}>
            Completed: <b style={{ color: "var(--text)" }}>{sessionSummary.exercise.replace('_', ' ').toUpperCase()}</b> ·
            Reps: <b style={{ color: "var(--text)" }}>{sessionSummary.reps_correct}</b> ·
            Duration: <b style={{ color: "var(--text)" }}>{Math.floor(sessionSummary.duration_sec / 60)}m {sessionSummary.duration_sec % 60}s</b> ·
            Accuracy: <b style={{ color: "var(--text)" }}>{sessionSummary.posture_score}%</b>
          </p>
          <div style={{ marginTop: "4px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ fontSize: "14px" }}>
              {"⭐".repeat(sessionSummary.stars)}
            </div>
            {sessionSummary.coachingTip && (
              <div style={{ fontSize: "11px", color: "var(--accent-light)", fontStyle: "italic", fontWeight: "555" }}>
                💡 AI Coaching Tip: {sessionSummary.coachingTip}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
