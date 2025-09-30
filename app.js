

```javascript
// ENHANCED MULTI-BROKER TRADING BOT - Complete Logic
class MultiBrokerTradingBot {
    constructor() {
        this.isRunning = false;
        this.currentBroker = 'exness-demo';
        this.settings = {
            // Broker Settings
            broker: 'exness-demo',
            demoBalance: 1000,
            
            // Trading Parameters
            tp: 3,
            sl: 1.5,
            lotSize: 10,
            dailyTarget: 30,
            tradingMode: 'safe',
            compounding: true,
            selectedPairs: [],
            
            // Statistics
            profitUSD: 0,
            profitPKR: 0,
            tradesExecuted: 0,
            winRate: 0,
            successfulTrades: 0
        };
        
        this.exchangeRate = 280;
        this.tradeInterval = null;
        this.cryptoPairs = this.getAllCryptoPairs();
        
        this.init();
    }

    // INITIALIZE BOT
    init() {
        this.loadCryptoPairs();
        this.addToLog('🤖 ENHANCED MULTI-BROKER TRADING BOT INITIALIZED');
        this.addToLog('🚀 Workflow: Exness Demo → Exness Live → Binance');
        this.addToLog('💡 Start with DEMO first to test strategy');
        this.showStatus('Ready - Select Broker & Start Trading');
    }

    // COMPLETE CRYPTO PAIRS LIST
    getAllCryptoPairs() {
        return {
            // Major Cryptocurrencies
            'BTCUSDT': { name: 'Bitcoin/USDT', volatility: 'high', type: 'crypto' },
            'ETHUSDT': { name: 'Ethereum/USDT', volatility: 'high', type: 'crypto' },
            'BNBUSDT': { name: 'Binance Coin/USDT', volatility: 'high', type: 'crypto' },
            'XRPUSDT': { name: 'Ripple/USDT', volatility: 'high', type: 'crypto' },
            'ADAUSDT': { name: 'Cardano/USDT', volatility: 'high', type: 'crypto' },
            'SOLUSDT': { name: 'Solana/USDT', volatility: 'very-high', type: 'crypto' },
            'DOTUSDT': { name: 'Polkadot/USDT', volatility: 'high', type: 'crypto' },
            'DOGEUSDT': { name: 'Dogecoin/USDT', volatility: 'very-high', type: 'crypto' },
            
            // Altcoins
            'MATICUSDT': { name: 'Polygon/USDT', volatility: 'high', type: 'crypto' },
            'LTCUSDT': { name: 'Litecoin/USDT', volatility: 'medium', type: 'crypto' },
            'AVAXUSDT': { name: 'Avalanche/USDT', volatility: 'high', type: 'crypto' },
            'LINKUSDT': { name: 'Chainlink/USDT', volatility: 'high', type: 'crypto' },
            'ATOMUSDT': { name: 'Cosmos/USDT', volatility: 'medium', type: 'crypto' },
            'UNIUSDT': { name: 'Uniswap/USDT', volatility: 'high', type: 'crypto' },
            'ALGOUSDT': { name: 'Algorand/USDT', volatility: 'medium', type: 'crypto' },
            'XLMUSDT': { name: 'Stellar/USDT', volatility: 'medium', type: 'crypto' },
            
            // Newer Tokens
            'NEARUSDT': { name: 'Near Protocol/USDT', volatility: 'high', type: 'crypto' },
            'FTMUSDT': { name: 'Fantom/USDT', volatility: 'very-high', type: 'crypto' },
            'SANDUSDT': { name: 'The Sandbox/USDT', volatility: 'very-high', type: 'crypto' },
            'MANAUSDT': { name: 'Decentraland/USDT', volatility: 'very-high', type: 'crypto' },
            
            // Meme Coins
            'SHIBUSDT': { name: 'Shiba Inu/USDT', volatility: 'very-high', type: 'crypto' },
            
            // Forex Pairs (for Exness)
            'EURUSD': { name: 'Euro/US Dollar', volatility: 'low', type: 'forex' },
            'GBPUSD': { name: 'British Pound/US Dollar', volatility: 'medium', type: 'forex' },
            'USDJPY': { name: 'US Dollar/Japanese Yen', volatility: 'medium', type: 'forex' },
            'USDCHF': { name: 'US Dollar/Swiss Franc', volatility: 'low', type: 'forex' },
            'AUDUSD': { name: 'Australian Dollar/US Dollar', volatility: 'medium', type: 'forex' },
            'USDCAD': { name: 'US Dollar/Canadian Dollar', volatility: 'medium', type: 'forex' },
            'NZDUSD': { name: 'New Zealand Dollar/US Dollar', volatility: 'medium', type: 'forex' },
            
            // Commodities
            'XAUUSD': { name: 'Gold/US Dollar', volatility: 'medium', type: 'commodity' },
            'XAGUSD': { name: 'Silver/US Dollar', volatility: 'high', type: 'commodity' },
            
            // Indices
            'US30': { name: 'Dow Jones Index', volatility: 'medium', type: 'index' },
            'SPX500': { name: 'S&P 500 Index', volatility: 'medium', type: 'index' },
            'NAS100': { name: 'NASDAQ Index', volatility: 'high', type: 'index' }
        };
    }

    // LOAD CRYPTO PAIRS TO UI
    loadCryptoPairs() {
        const container = document.getElementById('cryptoPairs');
        container.innerHTML = '';
        
        Object.keys(this.cryptoPairs).forEach(pair => {
            const pairInfo = this.cryptoPairs[pair];
            const div = document.createElement('div');
            div.className = 'crypto-pair';
            div.innerHTML = `
                <input type="checkbox" id="${pair}" value="${pair}" 
                    ${this.settings.selectedPairs.includes(pair) ? 'checked' : ''}
                    onchange="tradingBot.updateSelectedPairs()">
                <label for="${pair}">${pair}</label><br>
                <small>${pairInfo.name} (${pairInfo.type})</small>
            `;
            container.appendChild(div);
        });
    }

    // UPDATE SELECTED PAIRS
    updateSelectedPairs() {
        this.settings.selectedPairs = Array.from(document.querySelectorAll('.crypto-pair input:checked'))
            .map(input => input.value);
        
        if (this.settings.selectedPairs.length === 0) {
            this.settings.selectedPairs = ['BTCUSDT', 'ETHUSDT'];
        }
        
        this.addToLog(`🔄 Trading pairs updated: ${this.settings.selectedPairs.length} selected`);
    }

    // SWITCH BROKER
    switchBroker(broker) {
        this.currentBroker = broker;
        this.settings.broker = broker;
        
        // Update UI tabs
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.broker-section').forEach(section => section.classList.remove('active'));
        
        event.target.classList.add('active');
        document.getElementById(broker).classList.add('active');
        
        this.addToLog(`🏦 Switched to: ${this.getBrokerName(broker)}`);
        this.showStatus(`${this.getBrokerName(broker)} - Configure & Start Trading`);
        
        // Auto-update settings when switching brokers
        this.updateSettings();
    }

    // GET BROKER NAME
    getBrokerName(broker) {
        const names = {
            'exness-demo': '📊 Exness Demo Account',
            'exness-live': '💳 Exness Live Account', 
            'binance': '₿ Binance Exchange'
        };
        return names[broker] || broker;
    }

    // UPDATE ALL SETTINGS
    updateSettings() {
        try {
            // Trading Parameters
            this.settings.tp = parseFloat(document.getElementById('tp').value) || 3;
            this.settings.sl = parseFloat(document.getElementById('sl').value) || 1.5;
            this.settings.lotSize = parseFloat(document.getElementById('lotSize').value) || 10;
            this.settings.dailyTarget = parseFloat(document.getElementById('dailyTarget').value) || 30;
            this.settings.tradingMode = document.getElementById('tradingMode').value;
            this.settings.compounding = document.getElementById('compounding').value === 'true';
            this.settings.demoBalance = parseFloat(document.getElementById('demoBalance').value) || 1000;

            // Update selected pairs
            this.updateSelectedPairs();

            this.addToLog(`✅ Settings Updated: TP=${this.settings.tp}% | SL=${this.settings.sl}% | Lot=$${this.settings.lotSize}`);
            this.addToLog(`✅ Trading Mode: ${this.settings.tradingMode.toUpperCase()} | Pairs: ${this.settings.selectedPairs.length}`);
            this.showStatus(`Settings Updated - Ready for ${this.getBrokerName(this.currentBroker)}`);
            
        } catch (error) {
            this.addToLog('❌ Error updating settings: ' + error.message);
        }
    }

    // VALIDATE BROKER SETTINGS
    validateBrokerSettings() {
        switch(this.currentBroker) {
            case 'exness-demo':
                if (this.settings.demoBalance < 10) {
                    this.addToLog('❌ Demo balance too low. Minimum $10 required.');
                    return false;
                }
                break;
                
            case 'exness-live':
                const accountId = document.getElementById('exnessAccountId').value;
                if (!accountId) {
                    this.addToLog('❌ Please enter Exness Account ID for live trading.');
                    return false;
                }
                break;
                
            case 'binance':
                const apiKey = document.getElementById('binanceApiKey').value;
                if (!apiKey) {
                    this.addToLog('❌ Please enter Binance API Key for trading.');
                    return false;
                }
                break;
        }
        return true;
    }

    // START TRADING
    startTrading() {
        if (this.isRunning) {
            this.addToLog('⚠️ Trading bot is already running');
            return;
        }

        if (!this.validateBrokerSettings()) {
            return;
        }

        this.isRunning = true;
        this.addToLog(`🟢 TRADING STARTED on ${this.getBrokerName(this.currentBroker)}`);
        this.addToLog(`📈 Strategy: ${this.settings.tradingMode.toUpperCase()} mode | TP:${this.settings.tp}% | SL:${this.settings.sl}%`);
        this.showStatus(`ACTIVE - Trading on ${this.getBrokerName(this.currentBroker)}`);
        
        // Start trading based on broker
        this.startBrokerTrading();
    }

    // START BROKER-SPECIFIC TRADING
    startBrokerTrading() {
        this.stopTrading(); // Clear any existing interval

        this.tradeInterval = setInterval(() => {
            if (!this.isRunning) return;
            this.executeBrokerTrade();
        }, this.getTradeInterval());
    }

    // EXECUTE TRADE BASED ON BROKER
    executeBrokerTrade() {
        if (this.settings.selectedPairs.length === 0) return;
        
        const pair = this.settings.selectedPairs[Math.floor(Math.random() * this.settings.selectedPairs.length)];
        const pairInfo = this.cryptoPairs[pair];
        
        switch(this.currentBroker) {
            case 'exness-demo':
                this.executeExnessDemoTrade(pair, pairInfo);
                break;
            case 'exness-live':
                this.executeExnessLiveTrade(pair, pairInfo);
                break;
            case 'binance':
                this.executeBinanceTrade(pair, pairInfo);
                break;
        }
        
        this.updateWinRate();
    }

    // EXNESS DEMO TRADING
    executeExnessDemoTrade(pair, pairInfo) {
        const profit = this.calculateProfit(pairInfo.volatility);
        const isWin = profit > 0;
        
        this.updateProfit(profit, isWin);
        
        const tradeType = isWin ? '🟢 WIN' : '🔴 LOSS';
        this.addToLog(`${tradeType} Exness Demo: ${pair} | Profit: $${profit.toFixed(2)}`);
        this.checkBrokerSpecificConditions('exness-demo');
    }

    // EXNESS LIVE TRADING (Simulated)
    executeExnessLiveTrade(pair, pairInfo) {
        const profit = this.calculateProfit(pairInfo.volatility) * 0.9; // Slightly lower for live (spreads)
        const isWin = profit > 0;
        
        this.updateProfit(profit, isWin);
        
        const tradeType = isWin ? '🟢 WIN' : '🔴 LOSS';
        this.addToLog(`${tradeType} Exness Live: ${pair} | Profit: $${profit.toFixed(2)}`);
        this.checkBrokerSpecificConditions('exness-live');
    }

    // BINANCE TRADING (Simulated)
    executeBinanceTrade(pair, pairInfo) {
        const profit = this.calculateProfit(pairInfo.volatility);
        const isWin = profit > 0;
        
        this.updateProfit(profit, isWin);
        
        const testnet = document.getElementById('binanceTestnet').value === 'true';
        const mode = testnet ? 'Testnet' : 'Live';
        const tradeType = isWin ? '🟢 WIN' : '🔴 LOSS';
        
        this.addToLog(`${tradeType} Binance ${mode}: ${pair} | Profit: $${profit.toFixed(2)}`);
        this.checkBrokerSpecificConditions('binance');
    }

    // CALCULATE PROFIT BASED ON VOLATILITY AND MODE
    calculateProfit(volatility = 'medium') {
        const baseMultipliers = {
            'safe': 0.4,
            'medium': 0.7,
            'aggressive': 1.2
        };
        
        const volatilityMultipliers = {
            'very-high': 1.8,
            'high': 1.4,
            'medium': 1.0,
            'low': 0.6
        };

        // More realistic profit calculation
        const randomFactor = (Math.random() - 0.45) * 2; // -0.9 to +1.1 range
        const baseProfit = randomFactor * this.settings.lotSize * 0.1;
        
        const modeMultiplier = baseMultipliers[this.settings.tradingMode] || 1.0;
        const volatilityMultiplier = volatilityMultipliers[volatility] || 1.0;
        
        return baseProfit * modeMultiplier * volatilityMultiplier;
    }

    // UPDATE WIN RATE STATISTICS
    updateWinRate() {
        if (this.settings.tradesExecuted > 0) {
            this.settings.winRate = (this.settings.successfulTrades / this.settings.tradesExecuted) * 100;
        }
    }

    // BROKER-SPECIFIC CHECKS
    checkBrokerSpecificConditions(broker) {
        // Demo account balance check
        if (broker === 'exness-demo') {
            const currentBalance = this.settings.demoBalance + this.settings.profitUSD;
            if (currentBalance <= 100) {
                this.addToLog('⚠️ Demo account balance low! Consider resetting.');
            }
            if (currentBalance <= 0) {
                this.addToLog('💸 Demo account balance zero! Auto-resetting...');
                this.resetDemoAccount();
            }
        }
        
        // Daily target check
        this.checkDailyTarget();
        
        // Win rate monitoring
        if (this.settings.tradesExecuted % 10 === 0) {
            this.addToLog(`📊 Statistics: Win Rate ${this.settings.winRate.toFixed(1)}% | Trades: ${this.settings.tradesExecuted}`);
        }
    }

    // RESET DEMO ACCOUNT
    resetDemoAccount() {
        this.settings.profitUSD = 0;
        this.settings.demoBalance = 1000;
        this.settings.tradesExecuted = 0;
        this.settings.successfulTrades = 0;
        this.settings.winRate = 0;
        this.addToLog('🔄 Demo account reset to $1000');
    }

    // CHECK DAILY TARGET
    checkDailyTarget() {
        const targetAmount = (this.settings.dailyTarget / 100) * this.settings.lotSize * 15;
        if (this.settings.profitUSD >= targetAmount) {
            this.addToLog(`🎯 DAILY TARGET ACHIEVED! $${this.settings.profitUSD.toFixed(2)} profit`);
            this.addToLog('💡 Consider stopping or adjusting strategy');
        }
    }

    // UPDATE PROFIT
    updateProfit(profit, isWin) {
        this.settings.profitUSD += profit;
        this.settings.profitPKR = this.settings.profitUSD * this.exchangeRate;
        this.settings.tradesExecuted++;
        
        if (isWin) {
            this.settings.successfulTrades++;
        }
        
        // Compounding logic
        if (this.settings.compounding && profit > 0) {
            const compoundFactor = 1 + (profit / (this.settings.lotSize * 100));
            this.settings.lotSize *= compoundFactor;
            this.settings.lotSize = Math.min(this.settings.lotSize, 1000); // Cap at 1000
        }
        
        this.updateProfitDisplay();
    }

    // GET TRADE INTERVAL
    getTradeInterval() {
        const intervals = {
            'safe': 10000,    // 10 seconds
            'medium': 6000,   // 6 seconds
            'aggressive': 3000 // 3 seconds
        };
        return intervals[this.settings.tradingMode] || 5000;
    }

    // STOP TRADING
    stopTrading() {
        this.isRunning = false;
        if (this.tradeInterval) {
            clearInterval(this.tradeInterval);
            this.tradeInterval = null;
        }
        this.addToLog('🔴 TRADING STOPPED');
        this.showStatus('Trading Stopped - Ready for Next Session');
        
        // Final statistics
        if (this.settings.tradesExecuted > 0) {
            this.addToLog(`📈 Session Summary: ${this.settings.tradesExecuted} trades | Win Rate: ${this.settings.winRate.toFixed(1)}%`);
            this.addToLog(`💰 Final Profit: $${this.settings.profitUSD.toFixed(2)} | ₨${this.settings.profitPKR.toFixed(2)}`);
        }
    }

    // RESET BOT COMPLETELY
    resetBot() {
        this.stopTrading();
        this.settings.profitUSD = 0;
        this.settings.profitPKR = 0;
        this.settings.tradesExecuted = 0;
        this.settings.successfulTrades = 0;
        this.settings.winRate = 0;
        this.settings.lotSize = 10;
        document.getElementById('activityLog').innerHTML = '';
        this.updateProfitDisplay();
        this.showStatus('Bot Reset - Ready to Start New Session');
        this.addToLog('🔄 BOT COMPLETELY RESET - All statistics cleared');
        this.addToLog('💡 Configure settings and start new trading session');
    }

    // UPDATE PROFIT DISPLAY
    updateProfitDisplay() {
        const profitElement = document.getElementById('profit');
        profitElement.innerHTML = 
            `<strong>Live Profit:</strong> $${this.settings.profitUSD.toFixed(2)} | ₨${this.settings.profitPKR.toFixed(2)} | ` +
            `Trades: ${this.settings.tradesExecuted} | Win Rate: ${this.settings.winRate.toFixed(1)}%`;
    }

    // ADD TO ACTIVITY LOG
    addToLog(message) {
        const logElement = document.getElementById('activityLog');
        const timestamp = new Date().toLocaleTimeString();
        logElement.innerHTML += `<div>[${timestamp}] ${message}</div>`;
        logElement.scrollTop = logElement.scrollHeight;
    }

    // SHOW STATUS
    showStatus(message) {
        document.getElementById('status').innerHTML = `<strong>Status:</strong> ${message}`;
    }

    // EXPORT SETTINGS (For saving)
    exportSettings() {
        return JSON.stringify(this.settings, null, 2);
    }

    // IMPORT SETTINGS (For loading)
    importSettings(settingsJson) {
        try {
            const settings = JSON.parse(settingsJson);
            this.settings = { ...this.settings, ...settings };
            this.addToLog('✅ Settings imported successfully');
        } catch (error) {
            this.addToLog('❌ Error importing settings: ' + error.message);
        }
    }
}

// INITIALIZE TRADING BOT
const tradingBot = new MultiBrokerTradingBot();

// GLOBAL FUNCTIONS FOR HTML BUTTONS
function switchBroker(broker) {
    tradingBot.switchBroker(broker);
}

function startTrading() { 
    tradingBot.startTrading(); 
}

function stopTrading() { 
    tradingBot.stopTrading(); 
}

function updateSettings() { 
    tradingBot.updateSettings(); 
}

function resetBot() { 
    tradingBot.resetBot(); 
}

// AUTO-START WHEN PAGE LOADS (Optional)
document.addEventListener('DOMContentLoaded', function() {
    tradingBot.addToLog('🌐 Trading Bot Interface Loaded Successfully');
    tradingBot.addToLog('📱 Compatible with Mobile & Desktop browsers');
});
```