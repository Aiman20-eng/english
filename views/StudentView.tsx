import React, { useState, useEffect } from 'react';
import { Task, WeeklySubmission, Week } from '../types';
import { getTasks, saveSubmission, getSubmissions, getWeeks } from '../services/storage';
import AudioRecorder from '../components/AudioRecorder';
import { Trophy, Star, Send, Check, Calendar, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';

const StudentView: React.FC = () => {
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0); // 0 is the newest week
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [audioData, setAudioData] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Load weeks on mount
  useEffect(() => {
    const loadedWeeks = getWeeks();
    setWeeks(loadedWeeks);
  }, []);

  // When week index changes, load that week's data
  useEffect(() => {
    if (weeks.length === 0) return;

    const activeWeek = weeks[currentWeekIndex];
    
    // Load tasks for this week
    const allTasks = getTasks();
    const activeWeekTasks = allTasks.filter(t => t.weekId === activeWeek.id);
    setTasks(activeWeekTasks);

    // Load submission for this week
    const submissions = getSubmissions();
    const mySubmission = submissions.find(s => s.weekId === activeWeek.id);
    
    if (mySubmission) {
      setCompletedIds(mySubmission.completedTaskIds);
      setAudioData(mySubmission.audioBase64);
      setHasSubmitted(true);
    } else {
      setCompletedIds([]);
      setAudioData(null);
      setHasSubmitted(false);
    }
  }, [weeks, currentWeekIndex]);

  const toggleTask = (id: string) => {
    setCompletedIds(prev => {
      const isCompleted = prev.includes(id);
      if (!isCompleted) {
        // Trigger simple confetti for motivation
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#3b82f6', '#10b981', '#fbbf24']
        });
        return [...prev, id];
      } else {
        return prev.filter(tid => tid !== id);
      }
    });
    setHasSubmitted(false); // Enable saving again
  };

  const handleSaveAudio = (base64: string) => {
    setAudioData(base64 || null);
    setHasSubmitted(false);
  };

  const handleSubmit = () => {
    if (weeks.length === 0) return;
    const activeWeek = weeks[currentWeekIndex];

    const submission: WeeklySubmission = {
      id: Date.now().toString(),
      weekId: activeWeek.id,
      studentName: 'أخي الصغير',
      completedTaskIds: completedIds,
      audioBase64: audioData,
      timestamp: Date.now()
    };

    saveSubmission(submission);
    setHasSubmitted(true);
    
    // Grand celebration
    const end = Date.now() + 1000;
    const colors = ['#bb0000', '#ffffff', '#0000ff']; // Red White Blue (English theme colors)
    (function frame() {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  const activeWeek = weeks[currentWeekIndex];
  const progress = tasks.length > 0 ? Math.round((completedIds.length / tasks.length) * 100) : 0;

  if (weeks.length === 0) {
     return (
       <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-500">
         <Trophy className="w-16 h-16 mb-4 text-gray-300" />
         <p>لا توجد أسابيع مضافة بعد.</p>
       </div>
     );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in pb-24">
      
      {/* Week Navigator */}
      <div className="flex items-center justify-between mb-6 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
         <button 
           onClick={() => setCurrentWeekIndex(Math.min(weeks.length - 1, currentWeekIndex + 1))}
           disabled={currentWeekIndex >= weeks.length - 1}
           className="p-2 rounded-xl hover:bg-gray-100 disabled:opacity-30 transition-colors"
         >
           <ChevronRight className="w-6 h-6 text-gray-600" />
         </button>

         <div className="text-center">
            <h2 className="font-bold text-gray-800 flex items-center justify-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              {activeWeek?.title}
            </h2>
            <span className="text-xs text-gray-400">
               {currentWeekIndex === 0 ? 'Current Week' : 'Previous Week'}
            </span>
         </div>

         <button 
           onClick={() => setCurrentWeekIndex(Math.max(0, currentWeekIndex - 1))}
           disabled={currentWeekIndex <= 0}
           className="p-2 rounded-xl hover:bg-gray-100 disabled:opacity-30 transition-colors"
         >
           <ChevronLeft className="w-6 h-6 text-gray-600" />
         </button>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 shadow-lg mb-8 text-center relative overflow-hidden text-white">
        <div className="absolute top-0 left-0 p-4 opacity-10 transform -rotate-12">
          <BookOpen className="w-40 h-40" />
        </div>
        
        <h1 className="text-3xl font-bold mb-2 relative z-10 font-en">
           {progress === 100 ? 'Excellent Job! 🎉' : 'Hello, Hero! 👋'}
        </h1>
        <p className="opacity-90 relative z-10">
          {progress === 100 
            ? 'You completed all English tasks!' 
            : 'Let\'s practice English today!'}
        </p>
        
        {/* Progress Bar */}
        <div className="mt-6 relative z-10 max-w-md mx-auto">
          <div className="flex justify-between text-sm font-bold opacity-90 mb-1 font-en">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-black/20 rounded-full h-4 overflow-hidden backdrop-blur-sm">
            <div 
              className="bg-yellow-400 h-4 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(250,204,21,0.5)]" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4 mb-8">
        <h2 className="text-xl font-bold text-gray-800 px-2 flex items-center gap-2">
           <Star className="w-5 h-5 text-yellow-500 fill-current" />
           English Tasks:
        </h2>
        {tasks.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center text-gray-400 border border-gray-100 border-dashed">
             No tasks assigned for this week. Enjoy your break!
          </div>
        ) : (
          tasks.map(task => {
            const isCompleted = completedIds.includes(task.id);
            return (
              <div 
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`
                  relative p-5 rounded-2xl cursor-pointer transition-all duration-300 transform border-2 group
                  ${isCompleted 
                    ? 'bg-green-50 border-green-400 scale-[1.01] shadow-md' 
                    : 'bg-white border-transparent hover:border-gray-200 shadow-sm hover:scale-[1.01]'
                  }
                `}
              >
                <div className="flex items-center gap-4">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                    ${isCompleted ? 'bg-green-500 text-white scale-110' : 'bg-gray-100 text-gray-300 group-hover:bg-gray-200'}
                  `}>
                    <Check className="w-5 h-5" strokeWidth={3} />
                  </div>
                  {/* Force LTR for English tasks */}
                  <span className={`text-lg font-medium transition-colors font-en text-left dir-ltr flex-1 ${isCompleted ? 'text-green-800 line-through opacity-70' : 'text-gray-800'}`}>
                    {task.text}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Audio Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 px-2 mb-2">Reading & Speaking:</h2>
        <AudioRecorder onSave={handleSaveAudio} existingAudio={audioData} />
      </div>

      {/* Submit Button */}
      <div className="fixed bottom-6 left-0 right-0 px-4 flex justify-center z-50">
        <button
          onClick={handleSubmit}
          disabled={hasSubmitted || tasks.length === 0}
          className={`
            flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg shadow-2xl transition-all transform
            ${hasSubmitted 
              ? 'bg-gray-800 text-green-400 cursor-default ring-2 ring-green-500' 
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:scale-105 hover:shadow-blue-500/40 active:scale-95'
            }
            disabled:opacity-80 disabled:cursor-not-allowed
          `}
        >
          {hasSubmitted ? (
            <>
              <Check className="w-6 h-6" />
              Saved
            </>
          ) : (
            <>
              <Send className="w-6 h-6" />
              Submit to Teacher
            </>
          )}
        </button>
      </div>

    </div>
  );
};

export default StudentView;