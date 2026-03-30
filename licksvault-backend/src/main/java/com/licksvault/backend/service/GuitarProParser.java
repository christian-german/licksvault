package com.licksvault.backend.service;

import lombok.Builder;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.charset.StandardCharsets;

@Service
@Slf4j
public class GuitarProParser {

    @Data
    @Builder
    public static class GpMetadata {
        private Integer bpm;
        private Integer lengthBars;
        private String version;
    }

    public GpMetadata parseMetadata(byte[] data) {
        if (data == null || data.length < 30) {
            return null;
        }

        try {
            ByteBuffer buffer = ByteBuffer.wrap(data);
            buffer.order(ByteOrder.LITTLE_ENDIAN);

            // Read version string (30 bytes)
            byte[] versionBytes = new byte[30];
            buffer.get(versionBytes);
            String versionStr = new String(versionBytes, StandardCharsets.US_ASCII).trim();
            log.info("Detected Guitar Pro version: {}", versionStr);

            if (versionStr.startsWith("FICHIER GUITAR PRO v3") ||
                versionStr.startsWith("FICHIER GUITAR PRO v4") ||
                versionStr.startsWith("FICHIER GUITAR PRO v5")) {
                return parseGp345(buffer, versionStr);
            } else {
                log.warn("Unsupported Guitar Pro version: {}", versionStr);
                return null;
            }
        } catch (Exception e) {
            log.error("Error parsing Guitar Pro file", e);
            return null;
        }
    }

    private GpMetadata parseGp345(ByteBuffer buffer, String version) {
        // Skip some header info (title, subtitle, artist, album, author, words, music, copyright, etc.)
        // Each of these is a Pascal-style string (Int length followed by chars)
        // Except for version 5.00+ which are Int length + 1 followed by chars
        
        boolean isV5 = version.contains("v5");
        
        // Skip Title, Subtitle, Artist, Album, Author, Words, Music, Copyright, Notes (9 strings)
        for (int i = 0; i < 9; i++) {
            skipPascalString(buffer, isV5);
        }

        // Triplet feel (1 byte)
        buffer.get();

        // For V5.00, there are more fields here
        if (version.contains("v5.00")) {
            // Lyrics (Pascal string + 5 ints)
            skipPascalString(buffer, true);
            for(int i=0; i<5; i++) buffer.getInt();
        }

        // BPM is an Int (4 bytes)
        int bpm = buffer.getInt();
        
        // For V5, there are more fields before measures
        if (isV5) {
            buffer.get(); // Key signature
            buffer.getInt(); // Octave
        } else {
            buffer.getInt(); // Key signature
        }

        // Channels (24 * 8 bytes for GP3/4, more for GP5 but we only care about position)
        // This is getting complex because the number of measures is AFTER the channels
        // In GP3/4/5, the number of measures is an Integer.
        
        // Let's try to find a more reliable way to find the number of measures
        // In GP4/5, it's after the channels.
        // GP3: 24 channels
        // GP4: 64 channels
        // GP5: 64 channels
        
        int channelsCount = version.contains("v3") ? 24 : 64;
        for (int i = 0; i < channelsCount; i++) {
            buffer.getInt(); // Instrument
            buffer.get();    // Volume
            buffer.get();    // Balance
            buffer.get();    // Chorus
            buffer.get();    // Reverb
            buffer.get();    // Phaser
            buffer.get();    // Tremolo
            buffer.get();    // Blank
        }
        
        // After channels, for GP5.00 there are 2 more bytes
        if (version.contains("v5.00")) {
            buffer.getShort();
        }

        int lengthBars = buffer.getInt();

        return GpMetadata.builder()
                .bpm(bpm)
                .lengthBars(lengthBars)
                .version(version)
                .build();
    }

    private void skipPascalString(ByteBuffer buffer, boolean isV5Plus) {
        int length;
        if (isV5Plus) {
            length = buffer.getInt();
            buffer.get(); // Skip max length byte
            log.debug("Skipping V5 Pascal string of length: {}", length);
            if (length > 0) {
                buffer.position(buffer.position() + length);
            }
        } else {
            length = buffer.getInt();
            log.debug("Skipping V3/4 Pascal string of length: {}", length);
            if (length > 0) {
                buffer.position(buffer.position() + length);
            }
        }
    }
}
