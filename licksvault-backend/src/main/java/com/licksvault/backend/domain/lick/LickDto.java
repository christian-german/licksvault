package com.licksvault.backend.domain.lick;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LickDto {

    private Long id;

    @NotBlank(message = "Name is required")
    @Size(max = 255, message = "Name must be less than 255 characters")
    private String name;

    @NotNull(message = "BPM is required")
    @Min(value = 20, message = "BPM must be at least 20")
    @Max(value = 300, message = "BPM must be at most 300")
    private Integer bpm;

    @NotNull(message = "Root note is required")
    private MusicalKey rootNote;

    @NotNull(message = "Mode is required")
    private Mode mode;

    @NotNull(message = "Length in bars is required")
    @Min(value = 1, message = "Length must be at least 1 bar")
    @Max(value = 64, message = "Length must be at most 64 bars")
    private Integer lengthBars;

    @NotNull(message = "Genre is required")
    private Genre genre;

    @Size(max = 2000, message = "Description must be less than 2000 characters")
    private String description;

    private byte[] gpFile;

    private String videoUrl;
    private String videoFilename;
    private String videoThumbnailFilename;
    private String videoContentType;
    private Long videoSize;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
