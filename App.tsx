
import React, { useState, useEffect } from 'react';
import { UserRole } from './types';
import AdminView from './views/AdminView';
import StudentView from './views/StudentView';
import { GraduationCap, ShieldCheck, Lock, X, Languages, ArrowRight } from 'lucide-react';
import { initSettings, verifyPassword } from './services/settings';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole | null>(null); // Start with no role selected
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginTarget, setLoginTarget] = useState<UserRole | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    initSettings(); // Ensure default passwords exist
  }, []);

  const handleRoleClick = (targetRole: UserRole) => {
    // If already logged in as that role, just switch view (optional, currently we force login on refresh/start)
    // But for better UX, let's require login if switching from null, 
    // or if switching roles (to prevent student from jumping to admin if logic was loose)
    
    setLoginTarget(targetRole);
    setPasswordInput('');
    setErrorMsg('');
    setShowLoginModal(true);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginTarget) return;

    const isValid = verifyPassword(loginTarget, passwordInput);

    if (isValid) {
      setRole(loginTarget);
      setShowLoginModal(false);
    } else {
      setErrorMsg('كلمة المرور غير صحيحة');
    }
  };

  const handleLogout = () => {
    setRole(null);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans">
      {/* Navigation / Header */}
      <nav className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-md">
               <Languages className="w-6 h-6" />
            </div>
            <span className="font-bold text-xl text-gray-800 font-en">English Tracker</span>
          </div>

          {role && (
             <button 
               onClick={handleLogout}
               className="text-sm text-gray-500 hover:text-red-500 font-medium transition-colors"
             >
               تسجيل خروج
             </button>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {!role ? (
          // Landing / Role Selection Screen
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
             <div className="text-center mb-10">
               <h1 className="text-4xl font-bold text-gray-800 mb-4 font-en">Welcome Back!</h1>
               <p className="text-gray-500 text-lg">يرجى اختيار الحساب للمتابعة</p>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
                {/* Student Card */}
                <button 
                  onClick={() => handleRoleClick(UserRole.STUDENT)}
                  className="bg-white p-8 rounded-2xl shadow-sm border-2 border-transparent hover:border-blue-400 hover:shadow-lg transition-all group text-center"
                >
                   <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                      <GraduationCap className="w-10 h-10 text-blue-600" />
                   </div>
                   <h2 className="text-2xl font-bold text-gray-800 mb-2">الطالب</h2>
                   <p className="text-gray-400 text-sm">الدخول لمتابعة المهام الأسبوعية</p>
                   <div className="mt-6 inline-flex items-center text-blue-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      دخول <ArrowRight className="w-4 h-4 mr-1" />
                   </div>
                </button>

                {/* Admin Card */}
                <button 
                  onClick={() => handleRoleClick(UserRole.ADMIN)}
                  className="bg-white p-8 rounded-2xl shadow-sm border-2 border-transparent hover:border-indigo-400 hover:shadow-lg transition-all group text-center"
                >
                   <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                      <ShieldCheck className="w-10 h-10 text-indigo-600" />
                   </div>
                   <h2 className="text-2xl font-bold text-gray-800 mb-2">المالك / المعلم</h2>
                   <p className="text-gray-400 text-sm">لوحة التحكم وإدارة المهام</p>
                   <div className="mt-6 inline-flex items-center text-indigo-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      دخول <ArrowRight className="w-4 h-4 mr-1" />
                   </div>
                </button>
             </div>
          </div>
        ) : (
          // Active View
          role === UserRole.ADMIN ? <AdminView /> : <StudentView />
        )}
      </main>

      {/* Login Modal */}
      {showLoginModal && loginTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
            <div className="bg-gray-50 px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <Lock className={`w-5 h-5 ${loginTarget === UserRole.ADMIN ? 'text-indigo-600' : 'text-blue-600'}`} />
                {loginTarget === UserRole.ADMIN ? 'دخول المالك' : 'دخول الطالب'}
              </h3>
              <button 
                onClick={() => setShowLoginModal(false)}
                className="text-gray-400 hover:text-red-500 transition-colors bg-white rounded-full p-1 hover:bg-red-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleLogin} className="p-8">
              <div className="text-center mb-6">
                <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-3 ${loginTarget === UserRole.ADMIN ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-100 text-blue-600'}`}>
                   {loginTarget === UserRole.ADMIN ? <ShieldCheck className="w-8 h-8" /> : <GraduationCap className="w-8 h-8" />}
                </div>
                <p className="text-gray-600 text-sm">أدخل كلمة المرور للمتابعة</p>
              </div>
              
              <div className="mb-6">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Password"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 text-center text-lg tracking-widest font-en transition-all focus:ring-indigo-500"
                  autoFocus
                />
                {errorMsg && (
                  <div className="flex items-center justify-center gap-2 mt-3 text-red-500 text-sm font-medium bg-red-50 p-2 rounded-lg">
                    <X className="w-4 h-4" /> {errorMsg}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className={`w-full text-white font-bold py-3.5 rounded-xl transition-all transform active:scale-95 shadow-lg hover:shadow-xl ${
                  loginTarget === UserRole.ADMIN 
                    ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' 
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                }`}
              >
                تسجيل الدخول
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
