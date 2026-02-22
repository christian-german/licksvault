package com.licksvault.backend.domain.lick;

public enum Genre {
    BLUES, JAZZ, ROCK, METAL, FUNK, COUNTRY, FUSION, CLASSICAL, POP, OTHER;

    public String getDisplayName() {
        String name = name().toLowerCase();
        return name.substring(0, 1).toUpperCase() + name.substring(1);
    }
}
