// ========== РАСШИРЕННАЯ ЗВУКОВАЯ СИСТЕМА ==========
const SoundManager = {
    enabled: true,
    volume: 0.5,
    ambienceVolume: 0.3,
    ambienceAudio: null,
    
    init: function() {
        try {
            const saved = localStorage.getItem('sound_enabled');
            if (saved !== null) this.enabled = saved === 'true';
            
            const savedVolume = localStorage.getItem('sound_volume');
            if (savedVolume !== null) this.volume = parseFloat(savedVolume);
            
            // Создаем фоновую музыку
            this.ambienceAudio = new Audio('sounds/ambience.mp3');
            this.ambienceAudio.loop = true;
            this.ambienceAudio.volume = this.ambienceVolume;
            
            console.log('SoundManager готов, звук:', this.enabled ? 'ВКЛ' : 'ВЫКЛ');
        } catch(e) {
            console.log('SoundManager init error:', e);
        }
    },
    
    play: function(soundName, volume) {
        if (!this.enabled) return;
        try {
            const audio = new Audio();
            audio.src = `sounds/${soundName}.mp3`;
            audio.volume = volume !== undefined ? volume : this.volume;
            audio.play().catch(() => {});
        } catch(e) {}
    },
    
    // Запуск фоновой музыки
    startAmbience: function() {
        if (!this.enabled) return;
        if (this.ambienceAudio && this.ambienceAudio.paused) {
            this.ambienceAudio.play().catch(e => console.log('Ambience play error:', e));
        }
    },
    
    // Остановка фоновой музыки
    stopAmbience: function() {
        if (this.ambienceAudio && !this.ambienceAudio.paused) {
            this.ambienceAudio.pause();
            this.ambienceAudio.currentTime = 0;
        }
    },
    
    // Установка громкости фона
    setAmbienceVolume: function(value) {
        this.ambienceVolume = Math.max(0, Math.min(1, value));
        if (this.ambienceAudio) this.ambienceAudio.volume = this.ambienceVolume;
        localStorage.setItem('ambience_volume', this.ambienceVolume);
    },
    
    // Включение/выключение звука
    toggleSound: function() {
        this.enabled = !this.enabled;
        localStorage.setItem('sound_enabled', this.enabled);
        
        if (!this.enabled) {
            this.stopAmbience();
        } else {
            this.startAmbience();
        }
        
        return this.enabled;
    },
    
    // Установка громкости
    setVolume: function(value) {
        this.volume = Math.max(0, Math.min(1, value));
        localStorage.setItem('sound_volume', this.volume);
    }
};

// Автозапуск фоновой музыки после взаимодействия с пользователем
function enableAmbience() {
    SoundManager.startAmbience();
    document.removeEventListener('click', enableAmbience);
    document.removeEventListener('keydown', enableAmbience);
}

// Ждем первого взаимодействия пользователя (браузеры требуют этого для авто-воспроизведения)
document.addEventListener('click', enableAmbience);
document.addEventListener('keydown', enableAmbience);

SoundManager.init();