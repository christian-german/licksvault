package com.licksvault.backend.domain.lick;

public enum MusicalKey {
    C, C_SHARP, D, D_SHARP, E, F, F_SHARP, G, G_SHARP, A, A_SHARP, B;

    public String getDisplayName() {
        return switch (this) {
            case C -> "C";
            case C_SHARP -> "C#";
            case D -> "D";
            case D_SHARP -> "D#";
            case E -> "E";
            case F -> "F";
            case F_SHARP -> "F#";
            case G -> "G";
            case G_SHARP -> "G#";
            case A -> "A";
            case A_SHARP -> "A#";
            case B -> "B";
        };
    }
}
