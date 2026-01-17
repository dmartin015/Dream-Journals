
import React, { useState, useRef, useEffect } from 'react';

interface RecordButtonProps {
  onRecordingComplete: (base64Audio: string) => void;
  isProcessing: boolean;
}

const RecordButton: React.FC<RecordButtonProps> = ({ onRecordingComplete, isProcessing }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setSeconds(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1];
          onRecordingComplete(base64String);
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access is required to record dreams.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {isRecording && (
        <div className="flex items-center gap-2 text-rose-400 font-bold animate-pulse">
          <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
          <span>Recording {formatTime(seconds)}</span>
        </div>
      )}
      <button
        disabled={isProcessing}
        onClick={isRecording ? stopRecording : startRecording}
        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-95 shadow-xl ${
          isRecording 
            ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-900/40 ring-4 ring-rose-500/20' 
            : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/40 ring-4 ring-indigo-500/10'
        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isProcessing ? (
          <i className="fa-solid fa-spinner fa-spin text-2xl"></i>
        ) : isRecording ? (
          <i className="fa-solid fa-stop text-2xl"></i>
        ) : (
          <i className="fa-solid fa-microphone text-2xl"></i>
        )}
      </button>
      <p className="text-sm text-slate-400">
        {isProcessing ? "Transcending to your subconscious..." : isRecording ? "Recording your dream..." : "Tap to record your dream"}
      </p>
    </div>
  );
};

export default RecordButton;
