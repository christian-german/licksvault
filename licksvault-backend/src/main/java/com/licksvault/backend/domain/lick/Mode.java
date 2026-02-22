package com.licksvault.backend.domain.lick;

public enum Mode {
    IONIAN, DORIAN, PHRYGIAN, LYDIAN, MIXOLYDIAN, AEOLIAN, LOCRIAN, HARMONIC_MINOR, MELODIC_MINOR;

    public String getDisplayName() {
        return name().toLowerCase().replace('_', ' ');
    }
}
