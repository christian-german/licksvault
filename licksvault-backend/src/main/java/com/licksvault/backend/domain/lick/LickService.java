package com.licksvault.backend.domain.lick;

import com.licksvault.backend.exception.ResourceNotFoundException;
import com.licksvault.backend.service.SseService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class LickService {

    private final LickRepository lickRepository;
    private final LickMapper lickMapper;
    private final SseService sseService;

    @Transactional(readOnly = true)
    public Page<LickDto> getAllLicks(String name, Integer bpmMin, Integer bpmMax, MusicalKey key, Mode mode,
                                             Integer lengthMin, Integer lengthMax, Genre genre,
                                             int page, int size, String sortBy, String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<Lick> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (name != null && !name.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%"));
            }
            if (bpmMin != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("bpm"), bpmMin));
            }
            if (bpmMax != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("bpm"), bpmMax));
            }
            if (key != null) {
                predicates.add(cb.equal(root.get("rootNote"), key));
            }
            if (mode != null) {
                predicates.add(cb.equal(root.get("mode"), mode));
            }
            if (lengthMin != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("lengthBars"), lengthMin));
            }
            if (lengthMax != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("lengthBars"), lengthMax));
            }
            if (genre != null) {
                predicates.add(cb.equal(root.get("genre"), genre));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Lick> lickPage = lickRepository.findAll(spec, pageable);
        return lickPage.map(lickMapper::toDto);
    }

    @Transactional(readOnly = true)
    public LickDto getLickById(Long id) {
        Lick lick = lickRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lick not found with id: " + id));
        return lickMapper.toDto(lick);
    }

    public LickDto createLick(LickDto lickDto) {
        Lick lick = lickMapper.toEntity(lickDto);
        Lick savedLick = lickRepository.save(lick);
        return lickMapper.toDto(savedLick);
    }

    public LickDto updateLick(Long id, LickDto lickDto) {
        Lick existingLick = lickRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lick not found with id: " + id));
        lickMapper.updateEntityFromDto(lickDto, existingLick);
        Lick updatedLick = lickRepository.save(existingLick);

        LickDto updatedLickDto = lickMapper.toDto(updatedLick);
        sseService.broadcast(LickEvent.builder()
                .type("LICK_UPDATED")
                .lickId(updatedLickDto.getId())
                .updatedAt(updatedLickDto.getUpdatedAt() != null ? updatedLickDto.getUpdatedAt().toString() : null)
                .build());

        return updatedLickDto;
    }

    public void deleteLick(Long id) {
        if (!lickRepository.existsById(id)) {
            throw new ResourceNotFoundException("Lick not found with id: " + id);
        }
        lickRepository.deleteById(id);
    }

    public LickDto uploadGpFile(Long id, byte[] gpFile) {
        Lick existingLick = lickRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lick not found with id: " + id));
        existingLick.setGpFile(gpFile);
        Lick updatedLick = lickRepository.save(existingLick);

        LickDto updatedLickDto = lickMapper.toDto(updatedLick);
        sseService.broadcast(LickEvent.builder()
                .type("LICK_UPDATED")
                .lickId(updatedLickDto.getId())
                .updatedAt(updatedLickDto.getUpdatedAt() != null ? updatedLickDto.getUpdatedAt().toString() : null)
                .build());

        return updatedLickDto;
    }

    public LickDto updateVideoMetadata(Long id, String filename, String thumbnailFilename, String contentType, long size) {
        Lick existingLick = lickRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lick not found with id: " + id));
        existingLick.setVideoFilename(filename);
        existingLick.setVideoThumbnailFilename(thumbnailFilename);
        existingLick.setVideoContentType(contentType);
        existingLick.setVideoSize(size);
        Lick updatedLick = lickRepository.save(existingLick);

        LickDto updatedLickDto = lickMapper.toDto(updatedLick);
        sseService.broadcast(LickEvent.builder()
                .type("LICK_UPDATED")
                .lickId(updatedLickDto.getId())
                .updatedAt(updatedLickDto.getUpdatedAt() != null ? updatedLickDto.getUpdatedAt().toString() : null)
                .build());

        return updatedLickDto;
    }
}
