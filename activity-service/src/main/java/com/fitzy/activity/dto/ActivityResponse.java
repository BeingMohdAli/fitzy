package com.fitzy.activity.dto;

import com.fitzy.activity.model.ActivityType;
import lombok.*;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityResponse {
    private String id;
    private String userId;
    private ActivityType type;
    private Integer duration;
    private Integer caloriesBurnt;
    private LocalDateTime startTime;
    private LocalDateTime createdAt;
    private Map<String, String> additionalMetrics;
}
