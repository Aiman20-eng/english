import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Trash2, Play, Pause, Send } from 'lucide-react';

interface AudioRecorderProps {
  onSave: (base64Audio: string) => void;
  existingAudio?: string | null;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onSave, existingAudio }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (existingAudio) {
      setAudioBase64(existingAudio);
      // Create a blob URL for playback
      fetch(existingAudio)
        .then(res => res.blob())
        .then(blob => {
          setAudioURL(URL.createObjectURL(blob));
        });
    }
  }, [existingAudio]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        
        // Convert to base64
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64 = reader.result as string;
          setAudioBase64(base64);
          onSave(base64);
        };
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setTimer(0);
      timerIntervalRef.current = window.setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("لا يمكن الوصول إلى الميكروفون. يرجى السماح بالوصول.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  };

  const deleteRecording = () => {
    setAudioURL(null);
    setAudioBase64(null);
    onSave(''); // Clear in parent
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mt-4">
      <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <Mic className="w-5 h-5 text-indigo-500" />
        تسجيل صوتي (تسميع / قراءة)
      </h3>

      {!audioURL ? (
        <div className="flex flex-col items-center justify-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          {isRecording ? (
            <div className="text-center">
              <div className="mb-4 text-3xl font-mono text-red-500 font-bold animate-pulse">
                {formatTime(timer)}
              </div>
              <button
                onClick={stopRecording}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full flex items-center gap-2 transition-all transform hover:scale-105"
              >
                <Square className="w-5 h-5 fill-current" />
                إنهاء التسجيل
              </button>
              <p className="mt-2 text-sm text-gray-500">جاري التسجيل...</p>
            </div>
          ) : (
            <button
              onClick={startRecording}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg"
            >
              <Mic className="w-5 h-5" />
              بدء التسجيل
            </button>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between bg-indigo-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
             <audio src={audioURL} controls className="h-10 w-48 sm:w-64" />
          </div>
          <button
            onClick={deleteRecording}
            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-100 rounded-full transition-colors"
            title="حذف التسجيل"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;