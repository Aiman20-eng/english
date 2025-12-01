
import React, { useState, useEffect } from 'react';
import { Task, WeeklySubmission, Week } from '../types';
import { saveTaskForWeek, getTasks, getSubmissions, getWeeks, createWeek } from '../services/storage';
import { getSettings, updateSettings } from '../services/settings';
import { Plus, Trash, CheckCircle, Clock, Sparkles, BookOpen, Mic, Calendar, ChevronDown, XCircle, FileText, Settings, Save, Lock, X } from 'lucide-react';
import { generateTaskSuggestions } from '../services/gemini';

const AdminView: React.FC = () => {
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [selectedWeekId, setSelectedWeekId] = useState<string>('');
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [submissions, setSubmissions] = useState<WeeklySubmission[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showNewWeekInput, setShowNewWeekInput] = useState(false);
  const [newWeekTitle, setNewWeekTitle] = useState('');

  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({ adminPass: '', studentPass: '' });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success'>('idle');

  // Initial Load
  useEffect(() => {
    const loadedWeeks = getWeeks();
    setWeeks(loadedWeeks);
    if (loadedWeeks.length > 0) {
      setSelectedWeekId(loadedWeeks[0].id);
    }
    setSubmissions(getSubmissions());

    // Load current settings into form
    const currentSettings = getSettings();
    setSettingsForm({
        adminPass: currentSettings.adminPass,
        studentPass: currentSettings.studentPass
    });
  }, []);

  // Reload tasks when selected week changes
  useEffect(() => {
    if (selectedWeekId) {
      const allTasks = getTasks();
      const weekTasks = allTasks.filter(t => t.weekId === selectedWeekId);
      setTasks(weekTasks);
    }
  }, [selectedWeekId]);

  const handleCreateWeek = () => {
    if (!newWeekTitle.trim()) return;
    const newWeek = createWeek(newWeekTitle);
    setWeeks([newWeek, ...weeks]);
    setSelectedWeekId(newWeek.id);
    setNewWeekTitle('');
    setShowNewWeekInput(false);
  };

  const handleAddTask = () => {
    if (!newTaskText.trim() || !selectedWeekId) return;
    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText,
      completed: false,
      weekId: selectedWeekId,
      createdAt: Date.now(),
    };
    
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    saveTaskForWeek(selectedWeekId, updatedTasks);
    setNewTaskText('');
  };

  const handleDeleteTask = (id: string) => {
    const updatedTasks = tasks.filter(t => t.id !== id);
    setTasks(updatedTasks);
    saveTaskForWeek(selectedWeekId, updatedTasks);
  };

  const handleGenerateAI = async () => {
    if (!selectedWeekId) return;
    setIsGenerating(true);
    const suggestions = await generateTaskSuggestions('English Basics (Vocab & Grammar)', '8-12');
    
    const newTasks: Task[] = suggestions.map(text => ({
      id: Date.now().toString() + Math.random().toString(),
      text: text,
      completed: false,
      weekId: selectedWeekId,
      createdAt: Date.now(),
    }));

    const updatedTasks = [...tasks, ...newTasks];
    setTasks(updatedTasks);
    saveTaskForWeek(selectedWeekId, updatedTasks);
    setIsGenerating(false);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (settingsForm.adminPass.length < 3 || settingsForm.studentPass.length < 3) {
      alert("كلمات المرور يجب أن تكون 3 أحرف على الأقل");
      return;
    }
    updateSettings(settingsForm);
    setSaveStatus('success');
    setTimeout(() => {
        setSaveStatus('idle');
        setShowSettings(false);
    }, 1500);
  };

  const currentWeekSubmission = submissions.find(s => s.weekId === selectedWeekId);
  const selectedWeekTitle = weeks.find(w => w.id === selectedWeekId)?.title || 'اختر أسبوعاً';

  // --- Report Logic ---
  const completedTaskIds = currentWeekSubmission?.completedTaskIds || [];
  const completedTasksList = tasks.filter(t => completedTaskIds.includes(t.id));
  const pendingTasksList = tasks.filter(t => !completedTaskIds.includes(t.id));
  const progressPercentage = tasks.length > 0 ? Math.round((completedTaskIds.length / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in relative">
      
      {/* Header & Controls */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
             <h2 className="text-2xl font-bold text-gray-800">لوحة التحكم (Admin)</h2>
             <p className="text-gray-500 text-sm">إدارة المهام وإعدادات التطبيق</p>
          </div>

          <div className="flex items-center gap-2">
             {/* Week Selector */}
             <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
                <div className="relative group">
                   <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm text-gray-700 font-medium hover:bg-gray-50 transition-all min-w-[160px] justify-between">
                     <span className="flex items-center gap-2">
                       <Calendar className="w-4 h-4 text-indigo-500" />
                       {selectedWeekTitle}
                     </span>
                     <ChevronDown className="w-4 h-4 text-gray-400" />
                   </button>
                   
                   <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden hidden group-hover:block z-20">
                      <div className="max-h-60 overflow-y-auto">
                        {weeks.map(week => (
                          <button
                            key={week.id}
                            onClick={() => setSelectedWeekId(week.id)}
                            className={`w-full text-right px-4 py-2 text-sm hover:bg-indigo-50 transition-colors ${selectedWeekId === week.id ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-gray-600'}`}
                          >
                            {week.title}
                          </button>
                        ))}
                      </div>
                   </div>
                </div>

                <div className="w-px h-6 bg-gray-300 mx-1"></div>

                <button 
                   onClick={() => setShowNewWeekInput(!showNewWeekInput)}
                   className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                   title="أضف أسبوع جديد"
                >
                   <Plus className="w-5 h-5" />
                </button>
             </div>

             {/* Settings Button */}
             <button
                onClick={() => setShowSettings(true)}
                className="ml-2 p-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors border border-gray-200"
                title="الإعدادات"
             >
                <Settings className="w-5 h-5" />
             </button>
          </div>
        </div>

        {/* Add New Week Form */}
        {showNewWeekInput && (
           <div className="mt-4 p-4 bg-indigo-50 rounded-xl flex gap-2 animate-fade-in">
              <input 
                type="text" 
                value={newWeekTitle}
                onChange={(e) => setNewWeekTitle(e.target.value)}
                placeholder="عنوان الأسبوع الجديد (مثال: Week 1 - Vocabulary)"
                className="flex-1 px-4 py-2 rounded-lg border-none focus:ring-2 focus:ring-indigo-400 font-en"
                dir="auto"
              />
              <button 
                onClick={handleCreateWeek}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700"
              >
                Add
              </button>
           </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Task Management */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-500" />
              English Tasks
              <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                {selectedWeekTitle}
              </span>
            </h3>
            <button
              onClick={handleGenerateAI}
              disabled={isGenerating}
              className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1.5 rounded-full flex items-center gap-1 hover:shadow-md transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3 h-3" />
              {isGenerating ? 'Generating...' : 'AI Suggest'}
            </button>
          </div>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="Example: Memorize 5 animals..."
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 font-en text-left"
              dir="ltr"
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
            />
            <button
              onClick={handleAddTask}
              className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition-colors"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {tasks.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-xl">
                 <p className="text-gray-400">No tasks added for {selectedWeekTitle}</p>
              </div>
            ) : (
              tasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-blue-50 transition-colors">
                  <span className="text-gray-700 font-medium font-en text-left dir-ltr flex-1">{task.text}</span>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 ml-2"
                  >
                    <Trash className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Weekly Report & Progress */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <div className="flex items-center justify-between mb-6">
             <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FileText className="w-6 h-6 text-green-500" />
                التقرير الأسبوعي
             </h3>
             {currentWeekSubmission && (
               <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                 {new Date(currentWeekSubmission.timestamp).toLocaleDateString('en-US')}
               </span>
             )}
           </div>

            {!currentWeekSubmission ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">لم يتم إنجاز مهام {selectedWeekTitle} بعد.</p>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                
                {/* Score Card */}
                <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-100">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-gray-600 font-bold">نسبة النجاح</span>
                    <span className={`text-2xl font-bold ${progressPercentage === 100 ? 'text-green-600' : 'text-blue-600'}`}>
                      {progressPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${progressPercentage === 100 ? 'bg-green-500' : 'bg-blue-500'}`} 
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Filtered Lists */}
                <div className="grid grid-cols-1 gap-4">
                  {/* Completed Tasks */}
                  <div className="border border-green-100 bg-green-50/50 rounded-xl p-4">
                    <h4 className="flex items-center gap-2 font-bold text-green-800 mb-3 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      المهام المنجزة ({completedTasksList.length})
                    </h4>
                    {completedTasksList.length > 0 ? (
                      <ul className="space-y-2">
                        {completedTasksList.map(t => (
                          <li key={t.id} className="flex items-start gap-2 text-sm text-green-900 font-en">
                            <CheckCircle className="w-4 h-4 mt-0.5 text-green-500 opacity-50" />
                            <span className="line-through opacity-75">{t.text}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-green-600 italic">لا يوجد مهام منجزة</p>
                    )}
                  </div>

                  {/* Pending Tasks */}
                  {pendingTasksList.length > 0 && (
                    <div className="border border-red-100 bg-red-50/50 rounded-xl p-4">
                      <h4 className="flex items-center gap-2 font-bold text-red-800 mb-3 text-sm">
                        <XCircle className="w-4 h-4" />
                        مهام تحتاج للمراجعة ({pendingTasksList.length})
                      </h4>
                      <ul className="space-y-2">
                        {pendingTasksList.map(t => (
                          <li key={t.id} className="flex items-start gap-2 text-sm text-red-900 font-en">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5"></span>
                            <span>{t.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Audio Report */}
                {currentWeekSubmission.audioBase64 && (
                  <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mt-4">
                    <h4 className="text-indigo-900 font-semibold mb-3 flex items-center gap-2 text-sm">
                      <Mic className="w-4 h-4" />
                      اختبار النطق / القراءة
                    </h4>
                    <audio controls src={currentWeekSubmission.audioBase64} className="w-full h-8" />
                  </div>
                )}
              </div>
            )}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
             <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
               <h3 className="font-bold text-gray-800 flex items-center gap-2">
                 <Settings className="w-5 h-5 text-gray-600" />
                 إعدادات الأمان
               </h3>
               <button 
                 onClick={() => setShowSettings(false)}
                 className="text-gray-400 hover:text-red-500 transition-colors"
               >
                 <X className="w-5 h-5" />
               </button>
             </div>

             <form onSubmit={handleSaveSettings} className="p-6 space-y-4">
               
               {/* Admin Password */}
               <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">كلمة مرور المالك (Admin)</label>
                  <div className="relative">
                     <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                     <input 
                       type="text" 
                       value={settingsForm.adminPass}
                       onChange={(e) => setSettingsForm({...settingsForm, adminPass: e.target.value})}
                       className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-en"
                     />
                  </div>
               </div>

               {/* Student Password */}
               <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">كلمة مرور الطالب (Student)</label>
                  <div className="relative">
                     <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                     <input 
                       type="text" 
                       value={settingsForm.studentPass}
                       onChange={(e) => setSettingsForm({...settingsForm, studentPass: e.target.value})}
                       className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none font-en"
                     />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">شارك كلمة المرور هذه مع الطالب للدخول.</p>
               </div>

               <div className="pt-4">
                 <button 
                   type="submit"
                   className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                     saveStatus === 'success' 
                       ? 'bg-green-500 text-white' 
                       : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                   }`}
                 >
                   {saveStatus === 'success' ? (
                      <>
                        <CheckCircle className="w-5 h-5" /> تم الحفظ بنجاح
                      </>
                   ) : (
                      <>
                        <Save className="w-5 h-5" /> حفظ التغييرات
                      </>
                   )}
                 </button>
               </div>
             </form>
           </div>
         </div>
      )}
    </div>
  );
};

export default AdminView;
