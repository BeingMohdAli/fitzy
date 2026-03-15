package com.fitzy.recommendation.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityEvent {
    private String id;
    private String userId;
    private String type;
    private Integer duration;
    private Integer caloriesBurnt;
    private LocalDateTime startTime;
    private LocalDateTime createdAt;
    private Map<String, String> additionalMetrics;
}
