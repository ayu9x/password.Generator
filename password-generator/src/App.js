import React, { useState, useEffect } from 'react';
import zxcvbn from 'zxcvbn';
import './App.css';

const ADJECTIVES = ['happy', 'brave', 'clever', 'mighty', 'silent', 'wild', 'gentle', 'bold'];
const NOUNS = ['tiger', 'mountain', 'river', 'sunset', 'forest', 'ocean', 'eagle', 'castle'];
const VERBS = ['jump', 'run', 'swim', 'climb', 'dance', 'sing', 'fly', 'dream'];
const SYMBOLS = ['!', '@', '#', '$', '%', '&', '*', '?'];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateAdjNounNumber() {
  const adj = getRandomElement(ADJECTIVES);
  const noun = getRandomElement(NOUNS);
  const num = Math.floor(Math.random() * 1000);
  return `${adj.charAt(0).toUpperCase() + adj.slice(1)}${noun.charAt(0).toUpperCase() + noun.slice(1)}${num}`;
}

function generateVerbAdjNounSymbol() {
  const verb = getRandomElement(VERBS);
  const adj = getRandomElement(ADJECTIVES);
  const noun = getRandomElement(NOUNS);
  const symbol = getRandomElement(SYMBOLS);
  return `${verb.charAt(0).toUpperCase() + verb.slice(1)}${adj}${noun}${symbol}`;
}

function generateMemorablePhrase() {
  const adj1 = getRandomElement(ADJECTIVES);
  const adj2 = getRandomElement(ADJECTIVES);
  const noun = getRandomElement(NOUNS);
  const num = Math.floor(Math.random() * 100);
  return `${adj1.charAt(0).toUpperCase() + adj1.slice(1)}-${adj2}-${noun}-${num}`;
}

const PASSWORD_SUGGESTIONS = [
  { template: "Adj-Noun-Number", generate: () => generateAdjNounNumber() },
  { template: "Verb-Adj-Noun-Symbol", generate: () => generateVerbAdjNounSymbol() },
  { template: "Memorable Phrase", generate: () => generateMemorablePhrase() }
];

function App() {

  const [password, setPassword] = useState('');
  const [length, setLength] = useState(14);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [copied, setCopied] = useState(false);
  const [strength, setStrength] = useState(null);
  const [passwordHistory, setPasswordHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [darkMode, setDarkMode] = useState(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [passwordSuggestions, setPasswordSuggestions] = useState([]);

  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const numberChars = '0123456789';
  const symbolChars = '!@#$%^&*()_+[]{}|;:,.<>?';

  useEffect(() => {
    const savedHistory = localStorage.getItem('passwordHistory');
    if (savedHistory) {
      setPasswordHistory(JSON.parse(savedHistory));
    }
    
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme !== null) {
      setDarkMode(JSON.parse(savedTheme));
    }
  }, []);

  useEffect(() => {
    document.body.className = darkMode ? 'dark-theme' : 'light-theme';
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const generatePassword = () => {
    if (!includeUppercase && !includeLowercase && !includeNumbers && !includeSymbols) {
      alert('Please select at least one character type');
      return;
    }

    let charPool = '';
    if (includeUppercase) charPool += uppercaseChars;
    if (includeLowercase) charPool += lowercaseChars;
    if (includeNumbers) charPool += numberChars;
    if (includeSymbols) charPool += symbolChars;

    let newPassword = '';
    const charPoolLength = charPool.length;
    
    if (includeUppercase) {
      newPassword += uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length));
    }
    
    if (includeLowercase) {
      newPassword += lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length));
    }
    
    if (includeNumbers) {
      newPassword += numberChars.charAt(Math.floor(Math.random() * numberChars.length));
    }
    
    if (includeSymbols) {
      newPassword += symbolChars.charAt(Math.floor(Math.random() * symbolChars.length));
    }
    
    for (let i = newPassword.length; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charPoolLength);
      newPassword += charPool.charAt(randomIndex);
    }
    
    newPassword = shuffleString(newPassword);
    
    saveToHistory(newPassword);
    
    setPassword(newPassword);
    setCopied(false);
    
    const strengthResult = zxcvbn(newPassword);
    setStrength(strengthResult);
  };

  const saveToHistory = (newPassword) => {
    const timestamp = new Date().toLocaleString();
    const historyItem = { password: newPassword, timestamp, length };
    const updatedHistory = [historyItem, ...passwordHistory].slice(0, 10);
    setPasswordHistory(updatedHistory);
  
    localStorage.setItem('passwordHistory', JSON.stringify(updatedHistory));
  };

  const clearHistory = () => {
    setPasswordHistory([]);
    localStorage.removeItem('passwordHistory');
  };

  // Shuffle string function
  const shuffleString = (str) => {
    const array = str.split('');
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array.join('');
  };

  // Copy to clipboard function
  const copyToClipboard = () => {
    if (!password) return;
    
    navigator.clipboard.writeText(password)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  // Generate password suggestions
  const generateSuggestions = () => {
    const suggestions = PASSWORD_SUGGESTIONS.map(template => {
      return {
        type: template.template,
        password: template.generate()
      };
    });
    setPasswordSuggestions(suggestions);
    setShowSuggestions(true);
  };

  // Select suggestion
  const selectSuggestion = (suggestedPassword) => {
    setPassword(suggestedPassword);
    saveToHistory(suggestedPassword);
    const strengthResult = zxcvbn(suggestedPassword);
    setStrength(strengthResult);
    setShowSuggestions(false);
  };

  // Get color based on zxcvbn score
  const getStrengthColor = () => {
    if (!strength) return '';
    
    const scoreColors = ['#ff4d4d', '#ff6b4d', '#ffcc00', '#9ec766', '#32cd32'];
    return scoreColors[strength.score];
  };

  // Get text description based on zxcvbn score
  const getStrengthText = () => {
    if (!strength) return '';
    
    const scoreTexts = ['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'];
    return scoreTexts[strength.score];
  };

  return (
    <div className={`password-generator ${darkMode ? 'dark-mode' : ''}`}>
      <div className="header">
        <h1>Password Generator</h1>
        <button 
          className="theme-toggle"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>
      
      <div className="password-display">
        <input 
          type="text" 
          value={password} 
          placeholder="Your password will appear here" 
          readOnly 
        />
        <button 
          className="copy-btn" 
          onClick={copyToClipboard} 
          disabled={!password}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      
      {strength && (
        <div className="strength-indicator">
          <div className="strength-text">
            Strength: <span style={{ color: getStrengthColor() }}>{getStrengthText()}</span>
          </div>
          <div className="strength-meter">
            <div 
              className="strength-meter-bar" 
              style={{ 
                backgroundColor: getStrengthColor(),
                width: `${(strength.score + 1) * 20}%` 
              }}
            ></div>
          </div>
          <div className="strength-feedback">
            {strength.feedback.warning && (
              <p className="warning">{strength.feedback.warning}</p>
            )}
            {strength.feedback.suggestions.length > 0 && (
              <ul className="suggestions">
                {strength.feedback.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      
      <div className="options">
        <div className="option">
          <label>Password Length: {length}</label>
          <div className="range-container">
            <input 
              type="range" 
              min="6" 
              max="30" 
              value={length} 
              onChange={(e) => setLength(parseInt(e.target.value))} 
            />
          </div>
        </div>
        
        <div className="option">
          <label>
            <input 
              type="checkbox" 
              checked={includeUppercase} 
              onChange={() => setIncludeUppercase(!includeUppercase)} 
            />
            Include Uppercase Letters
          </label>
        </div>
        
        <div className="option">
          <label>
            <input 
              type="checkbox" 
              checked={includeLowercase} 
              onChange={() => setIncludeLowercase(!includeLowercase)} 
            />
            Include Lowercase Letters
          </label>
        </div>
        
        <div className="option">
          <label>
            <input 
              type="checkbox" 
              checked={includeNumbers} 
              onChange={() => setIncludeNumbers(!includeNumbers)} 
            />
            Include Numbers
          </label>
        </div>
        
        <div className="option">
          <label>
            <input 
              type="checkbox" 
              checked={includeSymbols} 
              onChange={() => setIncludeSymbols(!includeSymbols)} 
            />
            Include Symbols
          </label>
        </div>
      </div>
      
      <div className="button-group">
        <button 
          className="generate-btn" 
          onClick={generatePassword}
        >
          Generate Password
        </button>
        
        <button 
          className="suggestion-btn" 
          onClick={generateSuggestions}
        >
          Get Suggestions
        </button>
      </div>
      
      {/* Replaced AnimatePresence with conditional rendering */}
      {showSuggestions && (
        <div className="suggestions-container">
          <h3>Password Suggestions</h3>
          <div className="suggestion-list">
            {passwordSuggestions.map((suggestion, index) => (
              <div 
                key={index} 
                className="suggestion-item"
                onClick={() => selectSuggestion(suggestion.password)}
              >
                <div className="suggestion-type">{suggestion.type}</div>
                <div className="suggestion-password">{suggestion.password}</div>
              </div>
            ))}
          </div>
          <button className="close-btn" onClick={() => setShowSuggestions(false)}>Close</button>
        </div>
      )}
      
      <div className="history-section">
        <div className="history-header">
          <button 
            className="history-toggle" 
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? 'Hide History' : 'Show History'}
          </button>
          
          {passwordHistory.length > 0 && (
            <button 
              className="clear-history" 
              onClick={clearHistory}
            >
              Clear History
            </button>
          )}
        </div>
        
        {/* Replaced AnimatePresence with conditional rendering */}
        {showHistory && passwordHistory.length > 0 && (
          <div className="history-list">
            {passwordHistory.map((item, index) => (
              <div 
                key={index} 
                className="history-item"
                onClick={() => {
                  setPassword(item.password);
                  const strengthResult = zxcvbn(item.password);
                  setStrength(strengthResult);
                }}
              >
                <div className="history-password">{item.password}</div>
                <div className="history-details">
                  <span>Length: {item.length}</span>
                  <span>Created: {item.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {showHistory && passwordHistory.length === 0 && (
          <p className="no-history">No password history found.</p>
        )}
      </div>
      
      <div className="footer">
        <p>Your passwords are never stored on our servers</p>
        <p>Password strength calculated using zxcvbn</p>
      </div>
    </div>
  );
}

export default App;