package com.fitzy.activity.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "activities")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ActivityType type;

    @Column(nullable = false)
    private Integer duration; // minutes

    @Column(nullable = false)
    private Integer caloriesBurnt;

    private LocalDateTime startTime;

    @ElementCollection
    @CollectionTable(name = "activity_metrics", joinColumns = @JoinColumn(name = "activity_id"))
    @MapKeyColumn(name = "metric_key")
    @Column(name = "metric_value")
    private Map<String, String> additionalMetrics;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (startTime == null) startTime = LocalDateTime.now();
    }
}
