package com.licksvault.backend.service;

import com.licksvault.backend.domain.lick.*;
import com.licksvault.backend.exception.ResourceNotFoundException;
import com.licksvault.backend.domain.lick.Genre;
import com.licksvault.backend.domain.lick.Lick;
import com.licksvault.backend.domain.lick.Mode;
import com.licksvault.backend.domain.lick.MusicalKey;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.util.Collections;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LickServiceTest {

    @Mock
    private LickRepository lickRepository;

    @Mock
    private LickMapper lickMapper;

    @Mock
    private SseService sseService;

    @InjectMocks
    private LickService lickService;

    private Lick lick;
    private LickDto lickDto;

    @BeforeEach
    void setUp() {
        lick = Lick.builder()
                .id(1L)
                .name("Test Lick")
                .bpm(120)
                .rootNote(MusicalKey.C)
                .mode(Mode.IONIAN)
                .lengthBars(4)
                .genre(Genre.ROCK)
                .build();

        lickDto = LickDto.builder()
                .id(1L)
                .name("Test Lick")
                .bpm(120)
                .rootNote(MusicalKey.C)
                .mode(Mode.IONIAN)
                .lengthBars(4)
                .genre(Genre.ROCK)
                .build();
    }

    @Test
    void getAllLicks_ShouldReturnPageResponse() {
        Page<Lick> page = new PageImpl<>(Collections.singletonList(lick));
        when(lickRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);
        when(lickMapper.toDto(any(Lick.class))).thenReturn(lickDto);

        Page<LickDto> result = lickService.getAllLicks(null, null, null, null, null, null, null, null, 0, 20, "createdAt", "desc");

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getTotalElements()).isEqualTo(1);
        verify(lickRepository).findAll(any(Specification.class), any(Pageable.class));
    }

    @Test
    void getLickById_WhenFound_ShouldReturnDto() {
        when(lickRepository.findById(1L)).thenReturn(Optional.of(lick));
        when(lickMapper.toDto(lick)).thenReturn(lickDto);

        LickDto result = lickService.getLickById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Test Lick");
    }

    @Test
    void getLickById_WhenNotFound_ShouldThrowException() {
        when(lickRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> lickService.getLickById(1L));
    }

    @Test
    void createLick_ShouldReturnSavedDto() {
        when(lickMapper.toEntity(lickDto)).thenReturn(lick);
        when(lickRepository.save(lick)).thenReturn(lick);
        when(lickMapper.toDto(lick)).thenReturn(lickDto);

        LickDto result = lickService.createLick(lickDto);

        assertThat(result).isNotNull();
        verify(lickRepository).save(lick);
    }

    @Test
    void updateLick_WhenFound_ShouldReturnUpdatedDto() {
        when(lickRepository.findById(1L)).thenReturn(Optional.of(lick));
        when(lickRepository.save(lick)).thenReturn(lick);
        when(lickMapper.toDto(lick)).thenReturn(lickDto);

        LickDto result = lickService.updateLick(1L, lickDto);

        assertThat(result).isNotNull();
        verify(lickMapper).updateEntityFromDto(eq(lickDto), eq(lick));
        verify(lickRepository).save(lick);
        verify(sseService).broadcast(any(LickEvent.class));
    }

    @Test
    void deleteLick_WhenFound_ShouldDelete() {
        when(lickRepository.existsById(1L)).thenReturn(true);

        lickService.deleteLick(1L);

        verify(lickRepository).deleteById(1L);
    }

    @Test
    void deleteLick_WhenNotFound_ShouldThrowException() {
        when(lickRepository.existsById(1L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> lickService.deleteLick(1L));
    }

    @Test
    void uploadGpFile_WhenFound_ShouldReturnUpdatedDto() {
        byte[] gpFileContent = "test content".getBytes();
        when(lickRepository.findById(1L)).thenReturn(Optional.of(lick));
        when(lickRepository.save(lick)).thenReturn(lick);
        when(lickMapper.toDto(lick)).thenReturn(lickDto);

        LickDto result = lickService.uploadGpFile(1L, gpFileContent);

        assertThat(result).isNotNull();
        assertThat(lick.getGpFile()).isEqualTo(gpFileContent);
        verify(lickRepository).save(lick);
        verify(sseService).broadcast(any(LickEvent.class));
    }
}
