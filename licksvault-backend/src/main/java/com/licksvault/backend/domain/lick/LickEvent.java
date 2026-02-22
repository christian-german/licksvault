package com.licksvault.backend.domain.lick;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.format.DateTimeFormatter;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LickEvent {
    private String type;
    private Long lickId;
    private String updatedAt;
}
