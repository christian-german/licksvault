package com.licksvault.backend.domain.lick;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "licks")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Lick {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Integer bpm;

    @Enumerated(EnumType.STRING)
    @Column(name = "root_note", nullable = false)
    private MusicalKey rootNote;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Mode mode;

    @Column(name = "length_bars", nullable = false)
    private Integer lengthBars;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Genre genre;

    @Column(length = 2000)
    private String description;

    @Column(name = "gp_file")
    private byte[] gpFile;

    @Column(name = "video_url")
    private String videoUrl;

    @Column(name = "video_filename")
    private String videoFilename;

    @Column(name = "video_thumbnail_filename")
    private String videoThumbnailFilename;

    @Column(name = "video_content_type")
    private String videoContentType;

    @Column(name = "video_size")
    private Long videoSize;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
