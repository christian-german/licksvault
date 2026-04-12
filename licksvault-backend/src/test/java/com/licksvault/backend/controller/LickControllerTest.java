package com.licksvault.backend.controller;

import com.c4_soft.springaddons.security.oauth2.test.annotations.WithMockAuthentication;
import com.licksvault.backend.domain.lick.*;
import com.licksvault.backend.service.SseService;
import com.licksvault.backend.service.VideoService;
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
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.testSecurityContext;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest()
class LickControllerTest {

    @MockitoBean
    private LickService lickService;

    @MockitoBean
    private VideoService videoService;

    @MockitoBean
    private SseService sseService;

    @MockitoBean
    private Validator validator;

    @Autowired
    private MockMvc mockMvc;

    private LickDto lickDto;

    @BeforeEach
    void setUp() {
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
    @WithMockAuthentication({ "user" })
    void getAllLicks_ShouldReturnOk() throws Exception {

        Page<LickDto> response = new PageImpl<>(Collections.singletonList(lickDto));

        when(lickService.getAllLicks(any(), any(), any(), any(), any(), any(), any(), any(), anyInt(), anyInt(), anyString(), anyString()))
                .thenReturn(response);

        mockMvc.perform(get("/licks").with(testSecurityContext()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("Test Lick"));
    }

    @Test
    @WithMockAuthentication({ "user" })
    void getLickById_ShouldReturnOk() throws Exception {
        when(lickService.getLickById(1L)).thenReturn(lickDto);

        mockMvc.perform(get("/licks/1").with(testSecurityContext()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Lick"));
    }

    @Test
    @WithMockAuthentication({ "user" })
    void createLick_ShouldReturnCreated() throws Exception {
        when(lickService.createLick(any(LickDto.class))).thenReturn(lickDto);

        mockMvc.perform(multipart("/licks")
                .with(csrf())
                .with(testSecurityContext())
                .file(new org.springframework.mock.web.MockMultipartFile("lick", "", MediaType.APPLICATION_JSON_VALUE, """
                        {"name":"Test Lick","bpm":120,"rootNote":"C","mode":"IONIAN","lengthBars":4,"genre":"ROCK"}
                        """.getBytes())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Test Lick"));
    }

    @Test
    @WithMockAuthentication({ "user" })
    void updateLick_ShouldReturnOk() throws Exception {
        when(lickService.updateLick(eq(1L), any(LickDto.class))).thenReturn(lickDto);

        mockMvc.perform(multipart(org.springframework.http.HttpMethod.PUT, "/licks/1")
                .with(csrf())
                .with(testSecurityContext())
                .file(new org.springframework.mock.web.MockMultipartFile("lick", "", MediaType.APPLICATION_JSON_VALUE, """
                        {"name":"Test Lick","bpm":120,"rootNote":"C","mode":"IONIAN","lengthBars":4,"genre":"ROCK"}
                        """.getBytes())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Lick"));
    }

    @Test
    @WithMockAuthentication({ "user" })
    void deleteLick_ShouldReturnNoContent() throws Exception {
        mockMvc.perform(delete("/licks/1").with(csrf()).with(testSecurityContext()))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockAuthentication({ "user" })
    void createLick_WithInvalidData_ShouldReturnBadRequest() throws Exception {
        LickDto invalidDto = new LickDto(); // Missing required fields
        jakarta.validation.ConstraintViolation<LickDto> violation = mock(jakarta.validation.ConstraintViolation.class);
        jakarta.validation.Path path = mock(jakarta.validation.Path.class);
        when(violation.getPropertyPath()).thenReturn(path);
        when(path.toString()).thenReturn("name");
        when(violation.getMessage()).thenReturn("must not be null");
        when(validator.validate(any())).thenReturn(new java.util.HashSet(Collections.singleton(violation)));

        mockMvc.perform(multipart("/licks")
                .with(csrf())
                .with(testSecurityContext())
                .file(new org.springframework.mock.web.MockMultipartFile("lick", "", MediaType.APPLICATION_JSON_VALUE, "{}".getBytes())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Validation failed"));
    }

    @Test
    @WithMockAuthentication({ "user" })
    void handleEvents_ShouldReturnEmitter() throws Exception {
        when(sseService.createEmitter()).thenReturn(new org.springframework.web.servlet.mvc.method.annotation.SseEmitter());

        mockMvc.perform(get("/licks/events").with(testSecurityContext()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockAuthentication({ "user" })
    void handleEvents_WithError_ShouldReturnJsonError() throws Exception {
        when(sseService.createEmitter()).thenThrow(new RuntimeException("Something went wrong"));

        mockMvc.perform(get("/licks/events").with(testSecurityContext()).accept(MediaType.TEXT_EVENT_STREAM))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.detail").value("An unexpected error occurred: Something went wrong"));
    }

    @Test
    @WithMockAuthentication({ "user" })
    void uploadGpFile_ShouldReturnOk() throws Exception {
        when(lickService.uploadGpFile(eq(1L), any(byte[].class))).thenReturn(lickDto);

        mockMvc.perform(multipart(org.springframework.http.HttpMethod.PATCH, "/licks/1/gp-file")
                .with(csrf())
                .with(testSecurityContext())
                .file(new org.springframework.mock.web.MockMultipartFile("gpFile", "test.gp", MediaType.APPLICATION_OCTET_STREAM_VALUE, "test content".getBytes())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Lick"));
    }
}
