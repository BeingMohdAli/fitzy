package com.fitzy.recommendation.messaging;

import com.fitzy.recommendation.dto.ActivityEvent;
import com.fitzy.recommendation.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ActivityEventConsumer {

    private final RecommendationService recommendationService;

    @RabbitListener(queues = "fitzy.activity.queue")
    public void onActivityTracked(ActivityEvent event) {
        log.info("Received activity event: {} for user: {}", event.getId(), event.getUserId());
        try {
            recommendationService.generateAndSaveRecommendation(event);
        } catch (Exception e) {
            log.error("Failed to process activity event: {}", e.getMessage());
        }
    }
}
