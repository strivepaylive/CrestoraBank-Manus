import { useEffect, useState } from 'react';

// Simple translation dictionary
const translations: Record<string, Record<string, string>> = {
  es: {
    'Banking Reimagined for Modern Life': 'Banca Reimaginada para la Vida Moderna',
    'Experience seamless, secure, and intelligent banking': 'Experimente banca sin interrupciones, segura e inteligente',
    'Open Account': 'Abrir Cuenta',
    'Login': 'Iniciar Sesión',
    'Get Started': 'Empezar',
    'Why Choose Crestora Bank?': '¿Por qué elegir Crestora Bank?',
    'Bank-Level Security': 'Seguridad de Nivel Bancario',
    'Instant Transfers': 'Transferencias Instantáneas',
    'Smart Analytics': 'Análisis Inteligente',
    'Competitive Rates': 'Tasas Competitivas',
    'Mobile First': 'Primero Móvil',
    'Global Reach': 'Alcance Global',
  },
  fr: {
    'Banking Reimagined for Modern Life': 'Banque Réinventée pour la Vie Moderne',
    'Experience seamless, secure, and intelligent banking': 'Découvrez une banque transparente, sécurisée et intelligente',
    'Open Account': 'Ouvrir un Compte',
    'Login': 'Connexion',
    'Get Started': 'Commencer',
    'Why Choose Crestora Bank?': 'Pourquoi Choisir Crestora Bank?',
    'Bank-Level Security': 'Sécurité de Niveau Bancaire',
    'Instant Transfers': 'Transferts Instantanés',
    'Smart Analytics': 'Analyse Intelligente',
    'Competitive Rates': 'Taux Compétitifs',
    'Mobile First': 'Mobile en Premier',
    'Global Reach': 'Portée Mondiale',
  },
  de: {
    'Banking Reimagined for Modern Life': 'Banking neu erfunden für das moderne Leben',
    'Experience seamless, secure, and intelligent banking': 'Erleben Sie nahtloses, sicheres und intelligentes Banking',
    'Open Account': 'Konto Eröffnen',
    'Login': 'Anmelden',
    'Get Started': 'Loslegen',
    'Why Choose Crestora Bank?': 'Warum Crestora Bank wählen?',
    'Bank-Level Security': 'Bankensicherheit',
    'Instant Transfers': 'Sofortige Überweisungen',
    'Smart Analytics': 'Intelligente Analytik',
    'Competitive Rates': 'Wettbewerbsfähige Zinssätze',
    'Mobile First': 'Mobile First',
    'Global Reach': 'Globale Reichweite',
  },
  pt: {
    'Banking Reimagined for Modern Life': 'Banco Reimaginado para a Vida Moderna',
    'Experience seamless, secure, and intelligent banking': 'Experimente banca contínua, segura e inteligente',
    'Open Account': 'Abrir Conta',
    'Login': 'Entrar',
    'Get Started': 'Começar',
    'Why Choose Crestora Bank?': 'Por que escolher Crestora Bank?',
    'Bank-Level Security': 'Segurança de Nível Bancário',
    'Instant Transfers': 'Transferências Instantâneas',
    'Smart Analytics': 'Análise Inteligente',
    'Competitive Rates': 'Taxas Competitivas',
    'Mobile First': 'Mobile First',
    'Global Reach': 'Alcance Global',
  },
  ja: {
    'Banking Reimagined for Modern Life': '現代生活のために再想像されたバンキング',
    'Experience seamless, secure, and intelligent banking': 'シームレス、安全、インテリジェントなバンキングを体験してください',
    'Open Account': 'アカウントを開く',
    'Login': 'ログイン',
    'Get Started': '開始する',
    'Why Choose Crestora Bank?': 'Crestora Bankを選ぶ理由は何ですか？',
    'Bank-Level Security': 'バンクレベルのセキュリティ',
    'Instant Transfers': '即座の転送',
    'Smart Analytics': 'スマート分析',
    'Competitive Rates': '競争力のある料金',
    'Mobile First': 'モバイルファースト',
    'Global Reach': 'グローバルリーチ',
  },
};

export function useTranslator() {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    // Detect device language
    const deviceLanguage = navigator.language.split('-')[0].toLowerCase();
    const supportedLanguages = Object.keys(translations);
    
    if (supportedLanguages.includes(deviceLanguage)) {
      setLanguage(deviceLanguage);
      localStorage.setItem('preferred_language', deviceLanguage);
    } else {
      const savedLanguage = localStorage.getItem('preferred_language');
      if (savedLanguage && supportedLanguages.includes(savedLanguage)) {
        setLanguage(savedLanguage);
      }
    }
  }, []);

  const translate = (text: string): string => {
    if (language === 'en') return text;
    return translations[language]?.[text] || text;
  };

  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('preferred_language', lang);
  };

  return { language, translate, changeLanguage };
}
