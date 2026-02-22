package com.licksvault.backend.service;

import com.licksvault.backend.domain.lick.LickEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
@Slf4j
public class SseService {

    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    public SseEmitter createEmitter() {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        emitters.add(emitter);

        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onError((e) -> emitters.remove(emitter));

        return emitter;
    }

    public void broadcast(LickEvent event) {
        List<SseEmitter> deadEmitters = new CopyOnWriteArrayList<>();
        emitters.forEach(emitter -> {
            try {
                log.debug("Sending SSE event: {} to emitter", event.getType());
                emitter.send(SseEmitter.event()
                        .name(event.getType())
                        .data(event));
            } catch (Exception e) {
                deadEmitters.add(emitter);
                log.error("Failed to send SSE event", e);
            }
        });
        emitters.removeAll(deadEmitters);
    }
}
