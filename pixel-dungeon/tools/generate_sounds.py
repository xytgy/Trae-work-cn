#!/usr/bin/env python3
"""Generate 8-bit style WAV sound effects for pixel dungeon game."""

import struct
import math
import os
import random

SAMPLE_RATE = 22050
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'assets', 'audio', 'sfx')

def write_wav(filename, samples, sample_rate=SAMPLE_RATE):
    """Write samples to a WAV file (16-bit PCM mono)."""
    num_samples = len(samples)
    data_size = num_samples * 2  # 16-bit = 2 bytes per sample
    
    with open(filename, 'wb') as f:
        # RIFF header
        f.write(b'RIFF')
        f.write(struct.pack('<I', 36 + data_size))
        f.write(b'WAVE')
        # fmt chunk
        f.write(b'fmt ')
        f.write(struct.pack('<I', 16))  # chunk size
        f.write(struct.pack('<H', 1))   # PCM
        f.write(struct.pack('<H', 1))   # mono
        f.write(struct.pack('<I', sample_rate))
        f.write(struct.pack('<I', sample_rate * 2))  # byte rate
        f.write(struct.pack('<H', 2))   # block align
        f.write(struct.pack('<H', 16))  # bits per sample
        # data chunk
        f.write(b'data')
        f.write(struct.pack('<I', data_size))
        for s in samples:
            clamped = max(-1.0, min(1.0, s))
            f.write(struct.pack('<h', int(clamped * 32767)))

def gen_square(freq, duration, volume=0.3, decay=True):
    """Generate square wave."""
    n = int(SAMPLE_RATE * duration)
    samples = []
    for i in range(n):
        t = i / SAMPLE_RATE
        val = volume * (1 if math.sin(2 * math.pi * freq * t) >= 0 else -1)
        if decay:
            val *= max(0, 1 - i / n)
        samples.append(val)
    return samples

def gen_sawtooth(freq, duration, volume=0.3, decay=True):
    """Generate sawtooth wave."""
    n = int(SAMPLE_RATE * duration)
    samples = []
    for i in range(n):
        t = i / SAMPLE_RATE
        phase = (freq * t) % 1.0
        val = volume * (2 * phase - 1)
        if decay:
            val *= max(0, 1 - i / n)
        samples.append(val)
    return samples

def gen_sine(freq, duration, volume=0.3, decay=True):
    """Generate sine wave."""
    n = int(SAMPLE_RATE * duration)
    samples = []
    for i in range(n):
        t = i / SAMPLE_RATE
        val = volume * math.sin(2 * math.pi * freq * t)
        if decay:
            val *= max(0, 1 - i / n)
        samples.append(val)
    return samples

def gen_noise(duration, volume=0.3, decay=True):
    """Generate white noise."""
    n = int(SAMPLE_RATE * duration)
    samples = []
    for i in range(n):
        val = volume * (random.random() * 2 - 1)
        if decay:
            val *= max(0, 1 - i / n)
        samples.append(val)
    return samples

def gen_sweep(freq_start, freq_end, duration, wave='sine', volume=0.3, decay=True):
    """Generate frequency sweep."""
    n = int(SAMPLE_RATE * duration)
    samples = []
    for i in range(n):
        t = i / SAMPLE_RATE
        progress = i / n
        freq = freq_start + (freq_end - freq_start) * progress
        phase = 2 * math.pi * freq * t
        if wave == 'sine':
            val = volume * math.sin(phase)
        elif wave == 'square':
            val = volume * (1 if math.sin(phase) >= 0 else -1)
        elif wave == 'sawtooth':
            val = volume * ((phase / (2 * math.pi)) % 1.0 * 2 - 1)
        else:
            val = volume * math.sin(phase)
        if decay:
            val *= max(0, 1 - i / n)
        samples.append(val)
    return samples

def gen_chord(freqs, duration, wave='sine', volume=0.2, decay=True):
    """Generate a chord (multiple frequencies)."""
    n = int(SAMPLE_RATE * duration)
    samples = [0.0] * n
    for freq in freqs:
        for i in range(n):
            t = i / SAMPLE_RATE
            val = (volume / len(freqs)) * math.sin(2 * math.pi * freq * t)
            if decay:
                val *= max(0, 1 - i / n)
            samples[i] += val
    return samples

def gen_ascending(notes, note_duration, wave='sine', volume=0.25):
    """Generate ascending note sequence."""
    samples = []
    for freq in notes:
        s = gen_sine(freq, note_duration, volume, decay=True) if wave == 'sine' else gen_square(freq, note_duration, volume, decay=True)
        samples.extend(s)
    return samples

def gen_descending(notes, note_duration, wave='sawtooth', volume=0.25):
    """Generate descending note sequence."""
    samples = []
    for freq in notes:
        s = gen_sawtooth(freq, note_duration, volume, decay=True)
        samples.extend(s)
    return samples

def add_noise(samples, noise_volume=0.1):
    """Add noise to samples."""
    return [s + noise_volume * (random.random() * 2 - 1) for s in samples]

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    sounds = {
        # Shoot sounds
        'pistol': gen_sweep(800, 200, 0.1, 'square', 0.3),
        'shotgun': add_noise(gen_sweep(200, 50, 0.2, 'sawtooth', 0.4), 0.15),
        'lightning': gen_sweep(2000, 1500, 0.15, 'sawtooth', 0.25),
        'grenade': add_noise(gen_sweep(150, 50, 0.3, 'sawtooth', 0.4), 0.2),
        'flame': gen_noise(0.08, 0.2),
        'freeze': gen_sweep(1200, 400, 0.15, 'sine', 0.25),
        'homing': gen_sweep(600, 1000, 0.2, 'sawtooth', 0.2),
        
        # Impact sounds
        'hit': gen_sweep(300, 100, 0.08, 'square', 0.25),
        'hurt': gen_sweep(400, 100, 0.25, 'sawtooth', 0.3),
        'kill': gen_sweep(400, 100, 0.2, 'sine', 0.3),
        
        # Pickup sounds
        'pickup': gen_chord([523.25, 659.25, 783.99], 0.2, 'sine', 0.25),
        'portal': gen_sweep(200, 800, 0.5, 'sine', 0.2),
        'chest': gen_sweep(600, 1200, 0.35, 'sine', 0.25),
        
        # Boss sounds
        'boss_appear': gen_sawtooth(80, 0.8, 0.4),
        'boss_attack': gen_sweep(200, 80, 0.4, 'square', 0.35),
        
        # Game state sounds
        'victory': gen_ascending([523.25, 659.25, 783.99, 1046.50], 0.15, 'sine', 0.3),
        'defeat': gen_descending([440, 392, 349.23, 261.63], 0.2, 'sawtooth', 0.25),
        
        # UI sounds
        'click': gen_sweep(600, 800, 0.08, 'square', 0.15),
        'switch': gen_sweep(400, 600, 0.1, 'sine', 0.2),
        'levelup': gen_ascending([523.25, 659.25, 783.99, 1046.50, 1318.51], 0.1, 'square', 0.15),
        'heal': gen_ascending([440, 554.37, 659.25, 880], 0.08, 'sine', 0.2),
        'shield': gen_sweep(300, 1200, 0.3, 'sine', 0.25),
    }
    
    for name, samples in sounds.items():
        filepath = os.path.join(OUTPUT_DIR, f'{name}.wav')
        write_wav(filepath, samples)
        print(f'Generated: {name}.wav ({len(samples)} samples, {len(samples)/SAMPLE_RATE:.2f}s)')
    
    print(f'\nDone! Generated {len(sounds)} sound effects in {OUTPUT_DIR}')

if __name__ == '__main__':
    main()
