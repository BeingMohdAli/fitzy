package com.fitzy.recommendation.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "recommendations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Recommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private String activityId;

    private String activityType;

    @Column(columnDefinition = "TEXT")
    private String recommendations;

    @ElementCollection
    @CollectionTable(name = "recommendation_improvements", joinColumns = @JoinColumn(name = "recommendation_id"))
    @Column(name = "improvement", columnDefinition = "TEXT")
    private List<String> improvements;

    @ElementCollection
    @CollectionTable(name = "recommendation_suggestions", joinColumns = @JoinColumn(name = "recommendation_id"))
    @Column(name = "suggestion", columnDefinition = "TEXT")
    private List<String> suggestions;

    @ElementCollection
    @CollectionTable(name = "recommendation_safety", joinColumns = @JoinColumn(name = "recommendation_id"))
    @Column(name = "safety_tip", columnDefinition = "TEXT")
    private List<String> safety;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
