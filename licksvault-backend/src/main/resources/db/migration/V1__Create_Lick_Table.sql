CREATE TABLE licks (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    bpm INTEGER NOT NULL,
    root_note VARCHAR(20) NOT NULL,
    mode VARCHAR(20) NOT NULL,
    length_bars INTEGER NOT NULL,
    genre VARCHAR(20) NOT NULL,
    description VARCHAR(2000),
    gp_file BYTEA,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO licks (name, bpm, root_note, mode, length_bars, genre, description) VALUES
('Minor Blues Turnaround', 90, 'A', 'AEOLIAN', 2, 'BLUES', 'A classic minor blues turnaround in A.'),
('Jazz Fusion Run', 120, 'G', 'DORIAN', 4, 'FUSION', 'Fast fusion run using Dorian scale.'),
('Rock Power Riff', 140, 'E', 'IONIAN', 2, 'ROCK', 'Heavy rock riff with power chords.'),
('Funk Scratching', 110, 'C', 'MIXOLYDIAN', 2, 'FUNK', 'Funky scratching pattern.'),
('Metal Shred', 180, 'D', 'PHRYGIAN', 4, 'METAL', 'Fast Phrygian shredding lick.');
