/**
 * Browser fingerprinting for bot detection
 * Collects browser signals that help identify headless browsers and bots
 */

import { useEffect, useState } from 'react';

export interface BrowserSignals {
  // Screen properties
  screenWidth: number;
  screenHeight: number;
  colorDepth: number;
  pixelRatio: number;
  
  // Browser features
  cookiesEnabled: boolean;
  languages: string;
  platform: string;
  hardwareConcurrency: number;
  deviceMemory: number | null;
  
  // Timezone
  timezone: string;
  timezoneOffset: number;
  
  // WebGL fingerprint
  webglVendor: string | null;
  webglRenderer: string | null;
  
  // Canvas fingerprint (hash)
  canvasHash: string;
  
  // Headless browser detection
  hasWebdriver: boolean;
  hasAutomation: boolean;
  hasPhantom: boolean;
  hasSelenium: boolean;
  hasNightmare: boolean;
  hasCasperJS: boolean;
  
  // Touch support
  touchPoints: number;
  
  // Audio fingerprint (simplified hash)
  audioHash: string;
  
  // Font detection (number of installed fonts from test list)
  fontsDetected: number;
  
  // Plugin count (low for headless browsers)
  pluginCount: number;
  
  // Additional signals
  hasNotificationAPI: boolean;
  hasBatteryAPI: boolean;
  doNotTrack: string | null;
}

/**
 * Hook to collect browser fingerprint signals
 */
export function useBrowserFingerprint() {
  const [signals, setSignals] = useState<BrowserSignals | null>(null);
  const [isCollecting, setIsCollecting] = useState(true);

  useEffect(() => {
    const collectSignals = async () => {
      try {
        const collected: BrowserSignals = {
          // Screen properties
          screenWidth: window.screen.width || 0,
          screenHeight: window.screen.height || 0,
          colorDepth: window.screen.colorDepth || 0,
          pixelRatio: window.devicePixelRatio || 1,
          
          // Browser features
          cookiesEnabled: navigator.cookieEnabled,
          languages: navigator.languages?.join(',') || navigator.language || '',
          platform: navigator.platform || '',
          hardwareConcurrency: navigator.hardwareConcurrency || 0,
          deviceMemory: (navigator as any).deviceMemory || null,
          
          // Timezone
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
          timezoneOffset: new Date().getTimezoneOffset(),
          
          // WebGL fingerprint
          ...getWebGLInfo(),
          
          // Canvas fingerprint
          canvasHash: getCanvasFingerprint(),
          
          // Headless browser detection
          hasWebdriver: !!(navigator as any).webdriver,
          hasAutomation: !!(window as any).chrome?.runtime?.id === undefined && !!(window as any).chrome,
          hasPhantom: !!(window as any)._phantom || !!(window as any).callPhantom,
          hasSelenium: !!document.querySelector('[selenium]') || !!(window as any).__selenium_unwrapped,
          hasNightmare: !!(window as any).__nightmare,
          hasCasperJS: !!(window as any)._casper_,
          
          // Touch support
          touchPoints: navigator.maxTouchPoints || 0,
          
          // Audio fingerprint
          audioHash: await getAudioFingerprint(),
          
          // Font detection
          fontsDetected: await detectFonts(),
          
          // Plugin count
          pluginCount: navigator.plugins?.length || 0,
          
          // Additional signals
          hasNotificationAPI: 'Notification' in window,
          hasBatteryAPI: 'getBattery' in navigator,
          doNotTrack: navigator.doNotTrack || (window as any).doNotTrack || null,
        };

        setSignals(collected);
        setIsCollecting(false);
      } catch (error) {
        console.error('Error collecting browser signals:', error);
        setIsCollecting(false);
      }
    };

    collectSignals();
  }, []);

  return { signals, isCollecting };
}

/**
 * Get WebGL vendor and renderer info
 */
function getWebGLInfo(): { webglVendor: string | null; webglRenderer: string | null } {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      return { webglVendor: null, webglRenderer: null };
    }

    const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
    
    if (!debugInfo) {
      return { webglVendor: 'unknown', webglRenderer: 'unknown' };
    }

    return {
      webglVendor: (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || null,
      webglRenderer: (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || null,
    };
  } catch {
    return { webglVendor: null, webglRenderer: null };
  }
}

/**
 * Generate canvas fingerprint
 * Different browsers/systems render text slightly differently
 */
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      return 'no-canvas';
    }

    // Draw various elements that will render differently on different systems
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('ShaderHouse', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('BotCheck', 4, 17);
    
    // Add some geometric shapes
    ctx.beginPath();
    ctx.arc(50, 25, 20, 0, Math.PI * 2);
    ctx.stroke();
    
    // Get data URL and hash it (simplified)
    const dataUrl = canvas.toDataURL();
    return simpleHash(dataUrl);
  } catch {
    return 'error';
  }
}

/**
 * Get audio fingerprint using AudioContext
 * Different systems process audio slightly differently
 */
async function getAudioFingerprint(): Promise<string> {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) {
      return 'no-audio';
    }

    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const analyser = ctx.createAnalyser();
    const gain = ctx.createGain();
    const processor = ctx.createScriptProcessor(4096, 1, 1);

    gain.gain.value = 0; // Mute
    oscillator.type = 'triangle';
    oscillator.connect(analyser);
    analyser.connect(processor);
    processor.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(0);

    // Get frequency data
    const bins = new Float32Array(analyser.frequencyBinCount);
    analyser.getFloatFrequencyData(bins);

    oscillator.stop();
    await ctx.close();

    // Create hash from first few bins
    const sample = bins.slice(0, 30).join(',');
    return simpleHash(sample);
  } catch {
    return 'error';
  }
}

/**
 * Detect available fonts
 * Headless browsers often have fewer fonts installed
 */
async function detectFonts(): Promise<number> {
  const testFonts = [
    'Arial',
    'Arial Black',
    'Comic Sans MS',
    'Courier New',
    'Georgia',
    'Impact',
    'Times New Roman',
    'Trebuchet MS',
    'Verdana',
    'Webdings',
    'Wingdings',
    'Lucida Console',
    'Palatino Linotype',
    'Tahoma',
    'Century Gothic',
    'Franklin Gothic Medium',
    'Lucida Sans Unicode',
    'MS Sans Serif',
    'Garamond',
    'Bookman Old Style',
  ];

  const baseFonts = ['monospace', 'sans-serif', 'serif'];
  const testString = 'mmmmmmmmmmlli';
  const testSize = '72px';

  let fontsFound = 0;

  // Create test element
  const span = document.createElement('span');
  span.style.position = 'absolute';
  span.style.left = '-9999px';
  span.style.fontSize = testSize;
  span.textContent = testString;
  document.body.appendChild(span);

  // Get base widths
  const baseWidths: Record<string, number> = {};
  for (const baseFont of baseFonts) {
    span.style.fontFamily = baseFont;
    baseWidths[baseFont] = span.offsetWidth;
  }

  // Test each font
  for (const font of testFonts) {
    let detected = false;
    for (const baseFont of baseFonts) {
      span.style.fontFamily = `'${font}', ${baseFont}`;
      if (span.offsetWidth !== baseWidths[baseFont]) {
        detected = true;
        break;
      }
    }
    if (detected) {
      fontsFound++;
    }
  }

  document.body.removeChild(span);
  return fontsFound;
}

/**
 * Simple string hash function
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).substring(0, 16);
}

/**
 * Calculate bot score from browser signals
 * Higher score = more likely to be a bot
 */
export function calculateBrowserBotScore(signals: BrowserSignals): {
  score: number;
  reasons: string[];
} {
  let score = 0;
  const reasons: string[] = [];

  // Headless browser indicators (high confidence)
  if (signals.hasWebdriver) {
    score += 50;
    reasons.push('WebDriver detected');
  }
  if (signals.hasPhantom) {
    score += 50;
    reasons.push('PhantomJS detected');
  }
  if (signals.hasSelenium) {
    score += 50;
    reasons.push('Selenium detected');
  }
  if (signals.hasNightmare) {
    score += 50;
    reasons.push('Nightmare detected');
  }
  if (signals.hasCasperJS) {
    score += 50;
    reasons.push('CasperJS detected');
  }

  // Missing browser features
  if (!signals.webglVendor || !signals.webglRenderer) {
    score += 20;
    reasons.push('No WebGL support');
  }
  if (signals.canvasHash === 'no-canvas' || signals.canvasHash === 'error') {
    score += 15;
    reasons.push('Canvas failed');
  }
  if (signals.audioHash === 'no-audio' || signals.audioHash === 'error') {
    score += 10;
    reasons.push('Audio context failed');
  }

  // Suspicious screen properties
  if (signals.screenWidth === 0 || signals.screenHeight === 0) {
    score += 30;
    reasons.push('Invalid screen size');
  }
  // Common headless browser resolution
  if (signals.screenWidth === 800 && signals.screenHeight === 600) {
    score += 15;
    reasons.push('Headless browser resolution');
  }

  // Missing cookies
  if (!signals.cookiesEnabled) {
    score += 15;
    reasons.push('Cookies disabled');
  }

  // No plugins (common in headless)
  if (signals.pluginCount === 0) {
    score += 10;
    reasons.push('No plugins');
  }

  // Very few fonts (headless browsers have minimal fonts)
  if (signals.fontsDetected < 5) {
    score += 15;
    reasons.push('Few fonts detected');
  }

  // No hardware concurrency
  if (signals.hardwareConcurrency === 0) {
    score += 10;
    reasons.push('No hardware concurrency');
  }

  // No languages defined
  if (!signals.languages) {
    score += 10;
    reasons.push('No languages');
  }

  return { score: Math.min(100, score), reasons };
}



