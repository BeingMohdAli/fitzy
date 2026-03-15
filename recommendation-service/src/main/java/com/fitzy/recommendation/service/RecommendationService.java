package com.fitzy.recommendation.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fitzy.recommendation.client.GeminiClient;
import com.fitzy.recommendation.dto.ActivityEvent;
import com.fitzy.recommendation.dto.RecommendationResponse;
import com.fitzy.recommendation.model.Recommendation;
import com.fitzy.recommendation.repository.RecommendationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationService {

    private final RecommendationRepository recommendationRepository;
    private final GeminiClient geminiClient;
    private final ObjectMapper objectMapper;

    public void generateAndSaveRecommendation(ActivityEvent activity) {
        if (recommendationRepository.findByActivityId(activity.getId()).isPresent()) {
            log.info("Recommendation already exists for activity: {}", activity.getId());
            return;
        }

        log.info("Generating AI recommendation for activity: {}", activity.getId());
        String aiResponse = geminiClient.generateRecommendation(activity);

        Recommendation recommendation = parseAndBuildRecommendation(activity, aiResponse);
        recommendationRepository.save(recommendation);
        log.info("Recommendation saved for activity: {}", activity.getId());
    }

    public List<RecommendationResponse> getUserRecommendations(String userId) {
        return recommendationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public RecommendationResponse getActivityRecommendation(String activityId) {
        Recommendation rec = recommendationRepository.findByActivityId(activityId)
                .orElseThrow(() -> new RuntimeException("No recommendation for activity: " + activityId));
        return toResponse(rec);
    }

    private Recommendation parseAndBuildRecommendation(ActivityEvent activity, String aiResponse) {
        List<String> improvements = new ArrayList<>();
        List<String> suggestions = new ArrayList<>();
        List<String> safety = new ArrayList<>();
        String summary = "";

        try {
            String cleaned = aiResponse.replaceAll("```json", "").replaceAll("```", "").trim();
            JsonNode root = objectMapper.readTree(cleaned);

            summary = root.path("summary").asText("Great workout!");

            // Parse improvements - format with area + recommendation
            root.path("improvements").forEach(n -> {
                String area = n.path("area").asText("");
                String rec = n.path("recommendation").asText("");
                if (!area.isEmpty() && !rec.isEmpty()) {
                    improvements.add("💪 " + area + ": " + rec);
                } else if (!rec.isEmpty()) {
                    improvements.add(rec);
                }
            });

            // Parse suggestions - format with workout + description
            root.path("suggestions").forEach(n -> {
                String workout = n.path("workout").asText("");
                String desc = n.path("description").asText("");
                if (!workout.isEmpty() && !desc.isEmpty()) {
                    suggestions.add("🏋️ " + workout + ": " + desc);
                } else if (!desc.isEmpty()) {
                    suggestions.add(desc);
                }
            });

            // Parse safety - simple string array
            root.path("safety").forEach(n -> safety.add(n.asText()));

        } catch (Exception e) {
            log.warn("Failed to parse Gemini response, using defaults. Error: {}", e.getMessage());
            summary = "Great " + activity.getType() + " session! " + activity.getCaloriesBurnt() + " calories burned in " + activity.getDuration() + " minutes.";
            improvements.add("Maintain consistent effort throughout your workout");
            suggestions.add("Stay well hydrated before and after exercise");
            safety.add("Always warm up before intense exercise");
        }

        return Recommendation.builder()
                .userId(activity.getUserId())
                .activityId(activity.getId())
                .activityType(activity.getType())
                .recommendations(summary)
                .improvements(improvements)
                .suggestions(suggestions)
                .safety(safety)
                .build();
    }

    private RecommendationResponse toResponse(Recommendation r) {
        return RecommendationResponse.builder()
                .id(r.getId())
                .userId(r.getUserId())
                .activityId(r.getActivityId())
                .activityType(r.getActivityType())
                .recommendations(r.getRecommendations())
                .improvements(r.getImprovements())
                .suggestions(r.getSuggestions())
                .safety(r.getSafety())
                .createdAt(r.getCreatedAt())
                .build();
    }
}