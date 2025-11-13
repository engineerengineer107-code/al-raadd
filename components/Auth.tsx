import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Card from './common/Card';
import { CryptoIcon, GoldIcon, OilIcon, RealEstateIcon } from './common/icons';


const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, register, contactInfo } = useApp();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    let success = false;
    if (isLogin) {
      success = login(email, password);
      if (!success) setError('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
    } else {
      success = register(email, password);
      if (!success) setError('هذا البريد الإلكتروني مسجل بالفعل.');
    }
  };
  
  const TestimonialCard: React.FC<{ quote: string; author: string; avatarUrl: string }> = ({ quote, author, avatarUrl }) => (
    <div className="bg-slate-800/50 p-4 rounded-lg border border-white/10 flex items-center gap-4">
       <img src={avatarUrl} alt={author} className="w-12 h-12 rounded-full object-cover border-2 border-amber-500/50"/>
       <div>
        <p className="text-gray-300 italic">"{quote}"</p>
        <p className="text-right font-semibold text-amber-400 mt-2">- {author}</p>
       </div>
    </div>
  );

  const AssetCard: React.FC<{ icon: React.ReactNode; name: string; }> = ({ icon, name }) => (
    <div className="bg-slate-800/50 p-4 rounded-lg text-center border border-white/10 hover:bg-slate-700/70 hover:border-amber-500 transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex justify-center items-center h-16 w-16 mx-auto mb-3 bg-slate-700/60 rounded-full">
        {icon}
      </div>
      <h3 className="font-semibold text-white">{name}</h3>
    </div>
  );

  return (
    <div 
      className="min-h-screen text-gray-100 flex items-center justify-center p-4 overflow-y-auto"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1640280233152-39040f38b1d9?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
        {/* Left Side - Promotional Content */}
        <div className="lg:col-span-3 p-8 space-y-8 bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/10">
          <h1 className="text-4xl md:text-5xl font-bold text-amber-400 leading-tight">
            تداول بذكاء. استثمر بأمان مع <br /> 
            <span className="text-white">"الرائد للتداول الآمن"</span>
          </h1>
          <p className="text-gray-200 text-lg">
            نوفر لك الأدوات والبيانات الفورية لاتخاذ قرارات استثمارية مستنيرة. انضم إلينا اليوم وابدأ رحلتك نحو النجاح المالي في عالم العملات الرقمية والأسواق العالمية.
          </p>
          
          <div className="bg-slate-800/50 p-4 rounded-lg border border-white/10 grid grid-cols-1 md:grid-cols-3 items-center gap-6">
            <div className="md:col-span-1">
                <img 
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                    alt="Data Analytics"
                    className="rounded-lg object-cover w-full h-full"
                />
            </div>
             <div className="md:col-span-2">
                <h3 className="text-xl font-bold text-white">تحليلات ذكية وفورية</h3>
                <p className="text-gray-300 mt-1">استخدم أدواتنا التحليلية المتقدمة ورؤى الخبراء لزيادة فرص نجاحك في السوق.</p>
             </div>
          </div>
          
           <div className="pt-6 border-t border-white/10">
            <h2 className="text-3xl font-bold text-white mb-4">استثمر في أسواق متعددة</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <AssetCard icon={<CryptoIcon className="h-8 w-8 text-blue-400"/>} name="العملات الرقمية" />
                <AssetCard icon={<GoldIcon className="h-8 w-8 text-yellow-400"/>} name="الذهب" />
                <AssetCard icon={<OilIcon className="h-8 w-8 text-gray-300"/>} name="النفط الخام" />
                <AssetCard icon={<RealEstateIcon className="h-8 w-8 text-green-400"/>} name="العقارات" />
            </div>
          </div>

          <div className="pt-6 border-t border-white/10">
            <h2 className="text-3xl font-bold text-white mb-4">آراء عملائنا</h2>
            <div className="space-y-4">
                <TestimonialCard quote="منصة سهلة الاستخدام وبيانات دقيقة. لقد ساعدتني كثيراً في تحقيق أهدافي الاستثمارية." author="أحمد م." avatarUrl="https://i.pravatar.cc/150?u=ahmed" />
                <TestimonialCard quote="أفضل ما في المنصة هو الأمان وسرعة تنفيذ الأوامر. أوصي بها بشدة!" author="فاطمة ع." avatarUrl="https://i.pravatar.cc/150?u=fatima" />
            </div>
          </div>
          
          <div className="pt-6 border-t border-white/10">
             <h2 className="text-3xl font-bold text-white mb-4">تواصل معنا</h2>
             <div className="bg-slate-800/50 p-4 rounded-lg border border-white/10 text-center">
                <p className="text-gray-300">للاستفسارات والدعم الفني</p>
                <p className="font-semibold text-white mt-2">Email: {contactInfo.email}</p>
                <p className="font-semibold text-white">Phone: {contactInfo.phone}</p>
             </div>
          </div>

        </div>
        
        {/* Right Side - Auth Form */}
        <div className="lg:col-span-2">
            <Card className="w-full max-w-md mx-auto !bg-slate-900/60 !backdrop-blur-xl !rounded-2xl !border !border-white/10">
                <h2 className="text-3xl font-bold text-center text-amber-400 mb-6">
                {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="email">
                    البريد الإلكتروني
                    </label>
                    <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-800/50 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="password">
                    كلمة المرور
                    </label>
                    <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-800/50 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
                    />
                </div>
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                <button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-2 px-4 rounded-md transition duration-300"
                >
                    {isLogin ? 'دخول' : 'تسجيل'}
                </button>
                </form>
                <div className="mt-6 text-center">
                <button onClick={() => setIsLogin(!isLogin)} className="text-amber-400 hover:text-amber-300 text-sm">
                    {isLogin ? 'ليس لديك حساب؟ إنشاء حساب جديد' : 'لديك حساب بالفعل؟ تسجيل الدخول'}
                </button>
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;