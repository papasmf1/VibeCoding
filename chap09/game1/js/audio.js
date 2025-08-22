class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterVolume = 0.5;
        this.sfxVolume = 0.7;
        this.musicVolume = 0.3;
        
        this.sounds = new Map();
        this.musicTracks = new Map();
        this.currentMusic = null;
        
        this.oscillators = new Map();
        
        this.isEnabled = true;
        
        this.initializeAudio();
        this.createSounds();
    }
    
    async initializeAudio() {
        try {
            // Create audio context (modern browsers)
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Handle audio context state
            if (this.audioContext.state === 'suspended') {
                await this.resumeAudioContext();
            }
            
            // Create master gain node
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.setValueAtTime(this.masterVolume, this.audioContext.currentTime);
            this.masterGain.connect(this.audioContext.destination);
            
            // Create separate gain nodes for SFX and music
            this.sfxGain = this.audioContext.createGain();
            this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.audioContext.currentTime);
            this.sfxGain.connect(this.masterGain);
            
            this.musicGain = this.audioContext.createGain();
            this.musicGain.gain.setValueAtTime(this.musicVolume, this.audioContext.currentTime);
            this.musicGain.connect(this.masterGain);
            
        } catch (error) {
            console.warn('Web Audio API not supported, audio will be disabled:', error);
            this.isEnabled = false;
        }
    }
    
    async resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }
    
    createSounds() {
        if (!this.isEnabled) return;
        
        // Create synthesized sound effects
        this.createSound('laser', this.createLaserSound());
        this.createSound('bomb', this.createBombSound());
        this.createSound('explosion', this.createExplosionSound());
        this.createSound('enemyDeath', this.createEnemyDeathSound());
        this.createSound('playerDeath', this.createPlayerDeathSound());
        this.createSound('powerup', this.createPowerupSound());
        this.createSound('hit', this.createHitSound());
        this.createSound('bulletDestroy', this.createBulletDestroySound());
        this.createSound('extraLife', this.createExtraLifeSound());
        this.createSound('gameOver', this.createGameOverSound());
        
        // Create music tracks
        this.createMusic('menu', this.createMenuMusic());
        this.createMusic('game', this.createGameMusic());
    }
    
    createSound(name, soundFunction) {
        this.sounds.set(name, soundFunction);
    }
    
    createMusic(name, musicFunction) {
        this.musicTracks.set(name, musicFunction);
    }
    
    playSound(soundName) {
        if (!this.isEnabled || !this.audioContext) return;
        
        const soundFunction = this.sounds.get(soundName);
        if (soundFunction) {
            try {
                soundFunction();
            } catch (error) {
                console.warn(`Error playing sound ${soundName}:`, error);
            }
        }
    }
    
    playMusic(trackName) {
        if (!this.isEnabled || !this.audioContext) return;
        
        // Stop current music
        this.stopMusic();
        
        const musicFunction = this.musicTracks.get(trackName);
        if (musicFunction) {
            try {
                this.currentMusic = musicFunction();
            } catch (error) {
                console.warn(`Error playing music ${trackName}:`, error);
            }
        }
    }
    
    stopMusic() {
        if (this.currentMusic) {
            this.currentMusic.stop();
            this.currentMusic = null;
        }
    }
    
    setMasterVolume(volume) {
        this.masterVolume = clamp(volume, 0, 1);
        if (this.masterGain) {
            this.masterGain.gain.setValueAtTime(this.masterVolume, this.audioContext.currentTime);
        }
    }
    
    setSFXVolume(volume) {
        this.sfxVolume = clamp(volume, 0, 1);
        if (this.sfxGain) {
            this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.audioContext.currentTime);
        }
    }
    
    setMusicVolume(volume) {
        this.musicVolume = clamp(volume, 0, 1);
        if (this.musicGain) {
            this.musicGain.gain.setValueAtTime(this.musicVolume, this.audioContext.currentTime);
        }
    }
    
    // Sound creation functions
    createLaserSound() {
        return () => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.sfxGain);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.1);
        };
    }
    
    createBombSound() {
        return () => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
            oscillator.frequency.linearRampToValueAtTime(50, this.audioContext.currentTime + 0.3);
            
            gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.sfxGain);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.3);
        };
    }
    
    createExplosionSound() {
        return () => {
            // White noise explosion
            const bufferSize = this.audioContext.sampleRate * 0.5; // 0.5 seconds
            const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const data = buffer.getChannelData(0);
            
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow((bufferSize - i) / bufferSize, 2);
            }
            
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            const filterNode = this.audioContext.createBiquadFilter();
            
            source.buffer = buffer;
            
            filterNode.type = 'lowpass';
            filterNode.frequency.setValueAtTime(2000, this.audioContext.currentTime);
            filterNode.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.5);
            
            gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);
            
            source.connect(filterNode);
            filterNode.connect(gainNode);
            gainNode.connect(this.sfxGain);
            
            source.start();
            source.stop(this.audioContext.currentTime + 0.5);
        };
    }
    
    createEnemyDeathSound() {
        return () => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.sfxGain);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.2);
        };
    }
    
    createPlayerDeathSound() {
        return () => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 1.0);
            
            gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1.0);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.sfxGain);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 1.0);
        };
    }
    
    createPowerupSound() {
        return () => {
            // Ascending arpeggio
            const notes = [440, 554, 659, 880]; // A, C#, E, A octave
            
            notes.forEach((freq, index) => {
                setTimeout(() => {
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                    
                    gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(this.sfxGain);
                    
                    oscillator.start();
                    oscillator.stop(this.audioContext.currentTime + 0.2);
                }, index * 80);
            });
        };
    }
    
    createHitSound() {
        return () => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
            
            gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.05);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.sfxGain);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.05);
        };
    }
    
    createBulletDestroySound() {
        return () => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(2000, this.audioContext.currentTime + 0.05);
            
            gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.05);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.sfxGain);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.05);
        };
    }
    
    createExtraLifeSound() {
        return () => {
            // Triumphant fanfare
            const melody = [440, 554, 659, 880, 659, 880, 1047]; // A, C#, E, A, E, A, C
            
            melody.forEach((freq, index) => {
                setTimeout(() => {
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    
                    oscillator.type = 'square';
                    oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                    
                    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(this.sfxGain);
                    
                    oscillator.start();
                    oscillator.stop(this.audioContext.currentTime + 0.3);
                }, index * 150);
            });
        };
    }
    
    createGameOverSound() {
        return () => {
            // Descending doom sound
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(220, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(110, this.audioContext.currentTime + 2.0);
            
            gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 1.0);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 2.0);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.sfxGain);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 2.0);
        };
    }
    
    createMenuMusic() {
        return () => {
            // Simple menu theme - not implemented for brevity
            // In a full implementation, this would create a looping musical sequence
            return { stop: () => {} };
        };
    }
    
    createGameMusic() {
        return () => {
            // Game music - not implemented for brevity
            // In a full implementation, this would create background music
            return { stop: () => {} };
        };
    }
    
    // Utility method to enable audio on user interaction
    async enableAudio() {
        if (!this.isEnabled) return;
        
        try {
            await this.resumeAudioContext();
            // Play a silent sound to fully enable audio
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.001);
            
        } catch (error) {
            console.warn('Could not enable audio:', error);
        }
    }
}