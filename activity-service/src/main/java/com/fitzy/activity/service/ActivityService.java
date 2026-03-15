package com.fitzy.activity.service;

import com.fitzy.activity.config.RabbitMQConfig;
import com.fitzy.activity.dto.ActivityRequest;
import com.fitzy.activity.dto.ActivityResponse;
import com.fitzy.activity.model.Activity;
import com.fitzy.activity.repository.ActivityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final RabbitTemplate rabbitTemplate;

    public ActivityResponse trackActivity(ActivityRequest request) {
        Activity activity = Activity.builder()
                .userId(request.getUserId())
                .type(request.getType())
                .duration(request.getDuration())
                .caloriesBurnt(request.getCaloriesBurnt())
                .startTime(request.getStartTime())
                .additionalMetrics(request.getAdditionalMetrics())
                .build();

        Activity saved = activityRepository.save(activity);
        log.info("Activity tracked: {} for user: {}", saved.getId(), saved.getUserId());

        // Publish to RabbitMQ → Recommendation Service will consume
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.ACTIVITY_EXCHANGE,
                RabbitMQConfig.ACTIVITY_ROUTING_KEY,
                toResponse(saved)
        );

        return toResponse(saved);
    }

    public List<ActivityResponse> getUserActivities(String userId) {
        return activityRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ActivityResponse getActivityById(String id) {
        Activity activity = activityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Activity not found: " + id));
        return toResponse(activity);
    }

    private ActivityResponse toResponse(Activity a) {
        return ActivityResponse.builder()
                .id(a.getId())
                .userId(a.getUserId())
                .type(a.getType())
                .duration(a.getDuration())
                .caloriesBurnt(a.getCaloriesBurnt())
                .startTime(a.getStartTime())
                .createdAt(a.getCreatedAt())
                .additionalMetrics(a.getAdditionalMetrics())
                .build();
    }
}
