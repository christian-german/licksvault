package com.licksvault.backend.service;

import org.junit.jupiter.api.Test;

import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;

class GuitarProParserTest {

    private final GuitarProParser parser = new GuitarProParser();

    @Test
    void parseMetadata_GP4_ShouldReturnCorrectMetadata() {
        // Prepare a mock GP4 file content
        ByteBuffer buffer = ByteBuffer.allocate(1000);
        buffer.order(ByteOrder.LITTLE_ENDIAN);

        // Version (30 bytes)
        byte[] version = "FICHIER GUITAR PRO v4.06      ".getBytes(StandardCharsets.US_ASCII);
        buffer.put(version);

        // Header strings (9 strings: Title, Subtitle, Artist, Album, Author, Words, Music, Copyright, Notes)
        for (int i = 0; i < 9; i++) {
            buffer.putInt(4); // Length
            buffer.put("test".getBytes());
        }

        // Triplet feel (1 byte)
        buffer.put((byte) 0);

        // BPM (4 bytes)
        buffer.putInt(140);

        // Key signature (4 bytes for GP4)
        buffer.putInt(0);

        // Channels (64 * 8 bytes for GP4)
        for (int i = 0; i < 64; i++) {
            buffer.putInt(25); // Instrument
            buffer.put((byte) 100); // Volume
            buffer.put((byte) 64);  // Balance
            buffer.put((byte) 0);   // Chorus
            buffer.put((byte) 0);   // Reverb
            buffer.put((byte) 0);   // Phaser
            buffer.put((byte) 0);   // Tremolo
            buffer.put((byte) 0);   // Blank
        }

        // Length in bars (4 bytes)
        buffer.putInt(16);

        byte[] data = new byte[buffer.position()];
        System.arraycopy(buffer.array(), 0, data, 0, buffer.position());

        GuitarProParser.GpMetadata metadata = parser.parseMetadata(data);

        assertThat(metadata).isNotNull();
        assertThat(metadata.getBpm()).isEqualTo(140);
        assertThat(metadata.getLengthBars()).isEqualTo(16);
        assertThat(metadata.getVersion()).isEqualTo("FICHIER GUITAR PRO v4.06");
    }

    @Test
    void parseMetadata_GP5_ShouldReturnCorrectMetadata() {
        // Prepare a mock GP5 file content
        ByteBuffer buffer = ByteBuffer.allocate(3000);
        buffer.order(ByteOrder.LITTLE_ENDIAN);

        // Version (30 bytes)
        byte[] version = new byte[30];
        byte[] vText = "FICHIER GUITAR PRO v5.10".getBytes(StandardCharsets.US_ASCII);
        System.arraycopy(vText, 0, version, 0, vText.length);
        buffer.put(version);

        // Header strings (9 strings)
        for (int i = 0; i < 9; i++) {
            buffer.putInt(4); // length
            buffer.put((byte) 4); // max length
            buffer.put("test".getBytes());
        }

        // Triplet feel (1 byte)
        buffer.put((byte) 0);
        
        // V5 extra: Lyrics
        buffer.putInt(0); // length
        buffer.put((byte) 0); // max length
        for(int i=0; i<5; i++) buffer.putInt(0); // 5 ints

        // BPM (4 bytes)
        buffer.putInt(130);

        // V5 extra fields
        buffer.put((byte) 0); // Key signature
        buffer.putInt(0);    // Octave

        // Channels (64 * 8 bytes)
        for (int i = 0; i < 64; i++) {
            buffer.putInt(25);
            buffer.put((byte) 100);
            buffer.put((byte) 64);
            buffer.put((byte) 0);
            buffer.put((byte) 0);
            buffer.put((byte) 0);
            buffer.put((byte) 0);
            buffer.put((byte) 0);
        }
        
        // Length in bars (4 bytes)
        buffer.putInt(32);

        byte[] data = new byte[buffer.position()];
        System.arraycopy(buffer.array(), 0, data, 0, buffer.position());

        GuitarProParser.GpMetadata metadata = parser.parseMetadata(data);

        assertThat(metadata).isNotNull();
        assertThat(metadata.getBpm()).isEqualTo(130);
        assertThat(metadata.getLengthBars()).isEqualTo(32);
    }
}
