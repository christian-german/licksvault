package com.licksvault.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.licksvault.backend.domain.lick.LickController;
import com.licksvault.backend.domain.lick.LickDto;
import com.licksvault.backend.domain.lick.Genre;
import com.licksvault.backend.domain.lick.Mode;
import com.licksvault.backend.domain.lick.MusicalKey;
import com.licksvault.backend.domain.lick.LickService;
import com.licksvault.backend.service.SseService;
import jakarta.validation.Validator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(LickController.class)
class LickControllerTest {

    @MockitoBean
    private LickService lickService;

    @MockitoBean
    private SseService sseService;

    @MockitoBean
    private Validator validator;

    @MockitoBean
    private ObjectMapper objectMapper;

    @Autowired
    private MockMvc mockMvc;

    private LickDto lickDto;

    @BeforeEach
    void setUp() throws com.fasterxml.jackson.core.JsonProcessingException {
        when(objectMapper.writeValueAsString(any())).thenReturn("{}");
        when(objectMapper.readValue(anyString(), eq(LickDto.class))).thenReturn(LickDto.builder().name("Test Lick").build());
        when(validator.forExecutables()).thenReturn(mock(jakarta.validation.executable.ExecutableValidator.class));
        when(validator.validate(any())).thenReturn(Collections.emptySet());

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
    void getAllLicks_ShouldReturnOk() throws Exception {

        Page<LickDto> response = new PageImpl<>(Collections.singletonList(lickDto));

        when(lickService.getAllLicks(any(), any(), any(), any(), any(), any(), any(), any(), anyInt(), anyInt(), anyString(), anyString()))
                .thenReturn(response);

        mockMvc.perform(get("/api/licks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("Test Lick"));
    }

    @Test
    void getLickById_ShouldReturnOk() throws Exception {
        when(lickService.getLickById(1L)).thenReturn(lickDto);

        mockMvc.perform(get("/api/licks/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Lick"));
    }

    @Test
    void createLick_ShouldReturnCreated() throws Exception {
        when(lickService.createLick(any(LickDto.class))).thenReturn(lickDto);

        mockMvc.perform(multipart("/api/licks")
                .file(new org.springframework.mock.web.MockMultipartFile("lick", "", MediaType.APPLICATION_JSON_VALUE, objectMapper.writeValueAsString(lickDto).getBytes())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Test Lick"));
    }

    @Test
    void updateLick_ShouldReturnOk() throws Exception {
        when(lickService.updateLick(eq(1L), any(LickDto.class))).thenReturn(lickDto);

        mockMvc.perform(multipart(org.springframework.http.HttpMethod.PUT, "/api/licks/1")
                .file(new org.springframework.mock.web.MockMultipartFile("lick", "", MediaType.APPLICATION_JSON_VALUE, objectMapper.writeValueAsString(lickDto).getBytes())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Lick"));
    }

    @Test
    void deleteLick_ShouldReturnNoContent() throws Exception {
        mockMvc.perform(delete("/api/licks/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void createLick_WithInvalidData_ShouldReturnBadRequest() throws Exception {
        LickDto invalidDto = new LickDto(); // Missing required fields
        jakarta.validation.ConstraintViolation<LickDto> violation = mock(jakarta.validation.ConstraintViolation.class);
        jakarta.validation.Path path = mock(jakarta.validation.Path.class);
        when(violation.getPropertyPath()).thenReturn(path);
        when(path.toString()).thenReturn("name");
        when(violation.getMessage()).thenReturn("must not be null");
        when(validator.validate(any())).thenReturn(new java.util.HashSet(Collections.singleton(violation)));

        mockMvc.perform(multipart("/api/licks")
                .file(new org.springframework.mock.web.MockMultipartFile("lick", "", MediaType.APPLICATION_JSON_VALUE, "{}".getBytes())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"));
    }

    @Test
    void handleEvents_ShouldReturnEmitter() throws Exception {
        when(sseService.createEmitter()).thenReturn(new org.springframework.web.servlet.mvc.method.annotation.SseEmitter());

        mockMvc.perform(get("/api/licks/events"))
                .andExpect(status().isOk());
    }

    @Test
    void handleEvents_WithError_ShouldReturnJsonError() throws Exception {
        when(sseService.createEmitter()).thenThrow(new RuntimeException("Something went wrong"));

        mockMvc.perform(get("/api/licks/events").accept(MediaType.TEXT_EVENT_STREAM))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.message").value("An unexpected error occurred: Something went wrong"));
    }

    @Test
    void uploadGpFile_ShouldReturnOk() throws Exception {
        when(lickService.uploadGpFile(eq(1L), any(byte[].class))).thenReturn(lickDto);

        mockMvc.perform(multipart(org.springframework.http.HttpMethod.PATCH, "/api/licks/1/gp-file")
                .file(new org.springframework.mock.web.MockMultipartFile("gpFile", "test.gp", MediaType.APPLICATION_OCTET_STREAM_VALUE, "test content".getBytes())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Lick"));
    }
}
