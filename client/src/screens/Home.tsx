import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import BottomNavBar from '../components/BottomNavBar';
import GenderFilter from '../components/GenderFilter';
import VoiceOnlyToggle from '../components/VoiceOnlyToggle';
import PremiumPaywall from '../components/PremiumPaywall';
import TreasureChest from '../components/TreasureChest';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { 
  Video, 
  Users, 
  Crown, 
  Coins, 
  Heart, 
  Sparkles, 
  Star,
  Zap,
  Shield,
  Camera,
  Mic,
  MessageCircle
} from 'lucide-react';
import { usePremium } from '../context/PremiumProvider';
import { useCoin } from '../context/CoinProvider';
import { useLanguage } from '../context/LanguageProvider';
import { playSound } from '../lib/audio';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isPremium, setPremium } = usePremium();
  const { coins } = useCoin();
  const { t } = useLanguage();
  
  const [selectedGender, setSelectedGender] = useState<string>('any');
  const [isVoiceOnly, setIsVoiceOnly] = useState<boolean>(false);
  const [showPaywall, setShowPaywall] = useState<boolean>(false);
  const [showTreasureChest, setShowTreasureChest] = useState<boolean>(false);
  const [onlineUsers, setOnlineUsers] = useState<number>(2847);

  // Simulate online users count
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineUsers(prev => prev + Math.floor(Math.random() * 10) - 5);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStartChat = () => {
    playSound('join');
    navigate('/video-chat', { 
      state: { 
        genderFilter: selectedGender,
        voiceOnly: isVoiceOnly,
        isSearching: true
      } 
    });
  };

  const handleGenderSelect = (gender: string) => {
    setSelectedGender(gender);
  };

  const handleVoiceToggle = (voiceOnly: boolean) => {
    setIsVoiceOnly(voiceOnly);
  };

  const handleUpgrade = () => {
    setShowPaywall(true);
  };

  const handlePremiumPurchase = (plan: string) => {
    const now = new Date();
    const expiry = new Date(now);
    if (plan === "weekly") {
      expiry.setDate(now.getDate() + 7);
    } else {
      expiry.setMonth(now.getMonth() + 1);
    }
    
    setPremium(true, expiry);
    setShowPaywall(false);
    alert(`🎉 Welcome to Premium! Your ${plan} subscription is now active!`);
  };

  const features = [
    {
      icon: Video,
      title: t('home.features.hd'),
      description: 'Crystal clear video quality',
      color: 'text-primary-600'
    },
    {
      icon: Shield,
      title: t('home.features.secure'),
      description: 'End-to-end encrypted',
      color: 'text-secondary-600'
    },
    {
      icon: Zap,
      title: t('home.features.instant'),
      description: 'Connect in seconds',
      color: 'text-premium-600'
    }
  ];

  return (
    <>
      <Helmet>
        <title>{t('app.name')}</title>
        <meta name="description" content={t('app.tagline')} />
      </Helmet>
      
      <main className="flex flex-col items-center min-h-screen w-full max-w-md mx-auto bg-gradient-to-br from-primary-50 via-accent-25 to-secondary-50 px-4 py-6 relative pb-20">
        {/* Header */}
        <div className="w-full text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 via-accent-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-2xl">
                <Camera className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gold-500 rounded-full flex items-center justify-center animate-pulse">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 via-accent-600 to-secondary-600 bg-clip-text text-transparent mb-2">
            {t('app.name')}
          </h1>
          <p className="text-neutral-600 font-medium text-lg">
            {t('app.tagline')}
          </p>
          
          {/* Online Users Counter */}
          <div className="mt-4 inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 border border-primary-200 shadow-lg">
            <div className="w-2 h-2 bg-secondary-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-neutral-700">
              {onlineUsers.toLocaleString()} online now
            </span>
          </div>
        </div>

        {/* Premium Status */}
        {isPremium ? (
          <Card className="w-full mb-6 bg-gradient-to-r from-gold-100 to-premium-100 border-2 border-gold-300 shadow-xl">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Crown className="h-6 w-6 text-gold-600" />
                <span className="font-bold text-gold-800 text-lg">Premium Active</span>
              </div>
              <p className="text-gold-700 text-sm">
                {t('profile.premium.enjoying')}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card 
            className="w-full mb-6 bg-gradient-to-r from-premium-100 to-primary-100 border-2 border-premium-300 shadow-xl cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            onClick={handleUpgrade}
          >
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Crown className="h-6 w-6 text-premium-600 animate-bounce" />
                <span className="font-bold text-premium-800 text-lg">Upgrade to Premium</span>
              </div>
              <div className="flex justify-center gap-3 text-premium-700 text-xs font-medium mb-2">
                <span>✓ Gender Filter</span>
                <span>✓ Voice Mode</span>
                <span>✓ Unlimited Time</span>
              </div>
              <p className="text-premium-600 text-sm font-bold">
                ✨ Tap to unlock premium features! ✨
              </p>
            </CardContent>
          </Card>
        )}

        {/* Coins Display */}
        <div className="w-full mb-6">
          <Card 
            className="bg-gradient-to-r from-gold-50 to-secondary-50 border-2 border-gold-200 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300"
            onClick={() => setShowTreasureChest(true)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-gold-500 to-secondary-500 rounded-full flex items-center justify-center shadow-lg">
                    <Coins className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-gold-800 text-xl">{coins}</div>
                    <div className="text-gold-600 text-sm">Coins Available</div>
                  </div>
                </div>
                <Button 
                  size="sm"
                  className="bg-gradient-to-r from-gold-500 to-secondary-500 text-white font-semibold"
                >
                  Get More
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gender Filter */}
        <div className="w-full mb-6">
          <GenderFilter
            isPremium={isPremium}
            onGenderSelect={handleGenderSelect}
            onUpgrade={handleUpgrade}
          />
        </div>

        {/* Voice Only Toggle */}
        <div className="w-full mb-6">
          <VoiceOnlyToggle
            isPremium={isPremium}
            isVoiceOnly={isVoiceOnly}
            onToggle={handleVoiceToggle}
            onUpgrade={handleUpgrade}
          />
        </div>

        {/* Features Grid */}
        <div className="w-full mb-8">
          <h3 className="text-lg font-bold text-neutral-800 mb-4 text-center">Why Choose AjnabiCam?</h3>
          <div className="grid grid-cols-3 gap-3">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white/80 backdrop-blur-sm border border-primary-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-4 text-center">
                  <feature.icon className={`h-8 w-8 mx-auto mb-2 ${feature.color}`} />
                  <div className="font-semibold text-neutral-800 text-sm mb-1">{feature.title}</div>
                  <div className="text-neutral-600 text-xs">{feature.description}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Main CTA Button */}
        <div className="w-full mb-8">
          <Button
            onClick={handleStartChat}
            className="w-full py-6 text-xl font-bold rounded-2xl bg-gradient-to-r from-primary-500 via-accent-500 to-secondary-500 hover:from-primary-600 hover:via-accent-600 hover:to-secondary-600 text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 border-2 border-white/20"
          >
            <div className="flex items-center justify-center gap-3">
              <Heart className="h-6 w-6 animate-pulse" />
              <span>{t('home.start')}</span>
              <Star className="h-6 w-6 animate-pulse" />
            </div>
          </Button>
          
          <p className="text-center text-neutral-500 text-sm mt-3 font-medium">
            🎯 Find your perfect match in seconds!
          </p>
        </div>

        {/* Quick Actions */}
        <div className="w-full grid grid-cols-2 gap-3 mb-6">
          <Button
            onClick={() => navigate('/chat')}
            variant="outline"
            className="py-4 border-2 border-primary-300 text-primary-700 hover:bg-primary-50 font-semibold"
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            View Chats
          </Button>
          
          <Button
            onClick={() => navigate('/friends')}
            variant="outline"
            className="py-4 border-2 border-accent-300 text-accent-700 hover:bg-accent-50 font-semibold"
          >
            <Users className="h-5 w-5 mr-2" />
            Friends
          </Button>
        </div>

        {/* Safety Notice */}
        <div className="w-full bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-neutral-200 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-secondary-600" />
            <span className="font-semibold text-neutral-800 text-sm">Safe & Secure</span>
          </div>
          <p className="text-neutral-600 text-xs leading-relaxed">
            Your privacy is our priority. All conversations are encrypted and we never store your video calls.
          </p>
        </div>

        <BottomNavBar />
      </main>

      {/* Modals */}
      <PremiumPaywall
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        onPurchase={handlePremiumPurchase}
      />

      <TreasureChest
        isOpen={showTreasureChest}
        onClose={() => setShowTreasureChest(false)}
      />
    </>
  );
};

export default Home;