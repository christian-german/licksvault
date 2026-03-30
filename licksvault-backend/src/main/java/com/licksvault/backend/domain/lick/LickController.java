package com.licksvault.backend.domain.lick;

import com.licksvault.backend.service.SseService;
import com.licksvault.backend.service.VideoService;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import tools.jackson.databind.json.JsonMapper;

import java.io.IOException;
import java.io.InputStream;
import java.util.Set;

@RestController
@RequestMapping("/licks")
@RequiredArgsConstructor
@Validated
public class LickController {

    private final LickService lickService;
    private final SseService sseService;
    private final VideoService videoService;
    private final JsonMapper jsonMapper;
    private final Validator validator;

    @GetMapping
    public Page<LickDto> getAllLicks(@RequestParam(required = false) String name,
                                     @RequestParam(required = false) Integer bpmMin,
                                     @RequestParam(required = false) Integer bpmMax,
                                     @RequestParam(required = false) MusicalKey key,
                                     @RequestParam(required = false) Mode mode,
                                     @RequestParam(required = false) Integer lengthMin,
                                     @RequestParam(required = false) Integer lengthMax,
                                     @RequestParam(required = false) Genre genre,
                                     @RequestParam(defaultValue = "0") int page,
                                     @RequestParam(defaultValue = "20") int size,
                                     @RequestParam(defaultValue = "createdAt") String sortBy,
                                     @RequestParam(defaultValue = "desc") String sortDir) {
        return lickService.getAllLicks(name, bpmMin, bpmMax, key, mode, lengthMin, lengthMax, genre, page, size, sortBy, sortDir);
    }

    @GetMapping("/{id}")
    public LickDto getLickById(@PathVariable Long id) {
        return lickService.getLickById(id);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public LickDto createLick(@RequestPart("lick") String lickJson,
                              @RequestPart(value = "gpFile", required = false) MultipartFile gpFile) throws IOException {

        LickDto lickDto = jsonMapper.readValue(lickJson, LickDto.class);
        Set<ConstraintViolation<LickDto>> violations = validator.validate(lickDto);
        if (!violations.isEmpty()) {
            throw new ConstraintViolationException(violations);
        }
        if (gpFile != null && !gpFile.isEmpty()) {
            lickDto.setGpFile(gpFile.getBytes());
        }

        return lickService.createLick(lickDto);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public LickDto updateLick(@PathVariable Long id,
                              @RequestPart("lick") String lickJson,
                              @RequestPart(value = "gpFile", required = false) MultipartFile gpFile) throws IOException {

        LickDto lickDto = jsonMapper.readValue(lickJson, LickDto.class);
        Set<ConstraintViolation<LickDto>> violations = validator.validate(lickDto);
        if (!violations.isEmpty()) {
            throw new ConstraintViolationException(violations);
        }
        if (gpFile != null && !gpFile.isEmpty()) {
            lickDto.setGpFile(gpFile.getBytes());
        }

        return lickService.updateLick(id, lickDto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteLick(@PathVariable Long id) {
        lickService.deleteLick(id);
    }

    @PatchMapping(value = "/{id}/gp-file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public LickDto uploadGpFile(@PathVariable Long id,
                                @RequestPart("gpFile") MultipartFile gpFile) throws IOException {
        return lickService.uploadGpFile(id, gpFile.getBytes());
    }

    @GetMapping(value = "/events", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter handleEvents() {
        return sseService.createEmitter();
    }

    @PostMapping("/{id}/video")
    public LickDto uploadVideo(@PathVariable Long id, @RequestParam("video") MultipartFile video) {
        String filename = videoService.uploadVideo(video);
        String thumbFilename = videoService.generateThumbnail(video);
        return lickService.updateVideoMetadata(id, filename, thumbFilename, video.getContentType(), video.getSize());
    }

    @GetMapping("/{id}/video")
    public ResponseEntity<InputStreamResource> streamVideo(@PathVariable Long id) {
        LickDto lick = lickService.getLickById(id);
        if (lick.getVideoFilename() == null) {
            return ResponseEntity.notFound().build();
        }

        InputStream videoStream = videoService.getVideoData(lick.getVideoFilename());
        InputStreamResource resource = new InputStreamResource(videoStream);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + lick.getVideoFilename() + "\"")
                .contentType(MediaType.parseMediaType(lick.getVideoContentType()))
                .contentLength(lick.getVideoSize())
                .body(resource);
    }

    @GetMapping("/{id}/thumbnail")
    public ResponseEntity<InputStreamResource> streamThumbnail(@PathVariable Long id) {
        LickDto lick = lickService.getLickById(id);
        if (lick.getVideoThumbnailFilename() == null) {
            return ResponseEntity.notFound().build();
        }

        InputStream thumbStream = videoService.getVideoData(lick.getVideoThumbnailFilename());
        InputStreamResource resource = new InputStreamResource(thumbStream);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + lick.getVideoThumbnailFilename() + "\"")
                .contentType(MediaType.IMAGE_JPEG)
                .body(resource);
    }
}
