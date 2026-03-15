package com.fitzy.recommendation.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fitzy.recommendation.dto.ActivityEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Component
@Slf4j
public class GeminiClient {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public GeminiClient(WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        this.webClient = webClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    public String generateRecommendation(ActivityEvent activity) {
        String prompt = buildPrompt(activity);

        Map<String, Object> requestBody = Map.of(
                "contents", new Object[]{
                        Map.of("parts", new Object[]{
                                Map.of("text", prompt)
                        })
                },
                "generationConfig", Map.of(
                        "temperature", 0.7,
                        "maxOutputTokens", 8192
                )
        );

        try {
            String url = apiUrl + "?key=" + apiKey;
            String response = webClient.post()
                    .uri(url)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode root = objectMapper.readTree(response);
            return root.path("candidates")
                    .path(0)
                    .path("content")
                    .path("parts")
                    .path(0)
                    .path("text")
                    .asText();
        } catch (Exception e) {
            log.error("Gemini API error: {}", e.getMessage());
            return getFallbackRecommendation(activity);
        }
    }
    private String buildPrompt(ActivityEvent activity) {
        return String.format("""
            Analyze this fitness activity and provide detailed recommendations in the following EXACT JSON format.
            Every field must be detailed, specific and at least 2-3 sentences long. No short one-liners.
            Improvements and suggestions must have at least 8-10 items each. Safety must have at least 8 items.
            
            {
              "summary": "Write 5-6 detailed sentences covering: overall performance assessment, calorie burn analysis, duration evaluation, comparison to fitness guidelines, strengths identified, and motivation for next steps",
              "improvements": [
                {"area": "Area name", "recommendation": "2-3 sentence detailed recommendation specific to this activity"},
                {"area": "Area name", "recommendation": "2-3 sentence detailed recommendation specific to this activity"},
                {"area": "Area name", "recommendation": "2-3 sentence detailed recommendation specific to this activity"},
                {"area": "Area name", "recommendation": "2-3 sentence detailed recommendation specific to this activity"},
                {"area": "Area name", "recommendation": "2-3 sentence detailed recommendation specific to this activity"},
                {"area": "Area name", "recommendation": "2-3 sentence detailed recommendation specific to this activity"},
                {"area": "Area name", "recommendation": "2-3 sentence detailed recommendation specific to this activity"},
                {"area": "Area name", "recommendation": "2-3 sentence detailed recommendation specific to this activity"},
                {"area": "Area name", "recommendation": "2-3 sentence detailed recommendation specific to this activity"},
                {"area": "Area name", "recommendation": "2-3 sentence detailed recommendation specific to this activity"}
              ],
              "suggestions": [
                {"workout": "Workout name", "description": "2-3 sentence detailed description of this workout and why it benefits this athlete"},
                {"workout": "Workout name", "description": "2-3 sentence detailed description of this workout and why it benefits this athlete"},
                {"workout": "Workout name", "description": "2-3 sentence detailed description of this workout and why it benefits this athlete"},
                {"workout": "Workout name", "description": "2-3 sentence detailed description of this workout and why it benefits this athlete"},
                {"workout": "Workout name", "description": "2-3 sentence detailed description of this workout and why it benefits this athlete"},
                {"workout": "Workout name", "description": "2-3 sentence detailed description of this workout and why it benefits this athlete"},
                {"workout": "Workout name", "description": "2-3 sentence detailed description of this workout and why it benefits this athlete"},
                {"workout": "Workout name", "description": "2-3 sentence detailed description of this workout and why it benefits this athlete"},
                {"workout": "Workout name", "description": "2-3 sentence detailed description of this workout and why it benefits this athlete"},
                {"workout": "Workout name", "description": "2-3 sentence detailed description of this workout and why it benefits this athlete"}
              ],
              "safety": [
                "2-3 sentence detailed safety tip 1 specific to this activity",
                "2-3 sentence detailed safety tip 2 specific to this activity",
                "2-3 sentence detailed safety tip 3 specific to this activity",
                "2-3 sentence detailed safety tip 4 specific to this activity",
                "2-3 sentence detailed safety tip 5 specific to this activity",
                "2-3 sentence detailed safety tip 6 specific to this activity",
                "2-3 sentence detailed safety tip 7 specific to this activity",
                "2-3 sentence detailed safety tip 8 specific to this activity"
              ]
            }
            
            Analyze this activity:
            Activity Type: %s
            Duration: %d minutes
            Calories Burned: %d kcal
            Date: %s
            
            Ensure the response follows the EXACT JSON format shown above with no markdown or code blocks.
            """,
                activity.getType(),
                activity.getDuration(),
                activity.getCaloriesBurnt(),
                activity.getStartTime() != null ? activity.getStartTime().toString() : "Unknown"
        );
    }

    private String getFallbackRecommendation(ActivityEvent activity) {
        return String.format("""
            {
              "summary": "Great %s session! You burned %d calories in %d minutes showing excellent dedication. Your consistency is building a strong fitness foundation. Keep pushing your limits progressively and track your progress for better results!",
              "improvements": [
                "Increase your session duration by 5-10 minutes each week to build endurance progressively and challenge your cardiovascular system",
                "Focus on maintaining proper form throughout the entire %s workout to maximize muscle engagement and prevent compensatory injuries",
                "Add interval training to your routine alternating between high and low intensity every 2-3 minutes to boost calorie burn by up to 30 percent",
                "Track your heart rate zones using a fitness watch to ensure you are training at the right intensity for your specific fitness goals",
                "Incorporate cross-training 2 times per week with complementary activities to prevent muscle imbalances and overuse injuries"
              ],
              "suggestions": [
                "Consume 20-30g of lean protein within 30 minutes after your %s session for optimal muscle recovery and growth hormone response",
                "Drink at least 500ml of water before your next session and sip 150-200ml every 15 minutes during exercise to maintain peak performance",
                "Get 7-9 hours of quality sleep tonight as growth hormone peaks during deep sleep stages aiding muscle repair and mental recovery",
                "Consider adding a 10-15 minute foam rolling session after your workout targeting the major muscle groups used during %s",
                "Plan your next workout session 48 hours from now to allow adequate muscle recovery time and come back stronger"
              ],
              "safety": [
                "Always spend 5-10 minutes warming up with dynamic stretches and light cardio before starting your %s session to prevent cold muscle injuries",
                "Stop immediately and seek medical attention if you feel sharp pain, sudden dizziness, chest tightness or shortness of breath during exercise",
                "Cool down with 5 minutes of light activity followed by static stretching held for 30 seconds each to prevent blood pooling in extremities",
                "Wear appropriate footwear and activity-specific gear for %s to provide proper joint support and reduce risk of stress injuries"
              ]
            }
            """,
                activity.getType(), activity.getCaloriesBurnt(), activity.getDuration(),
                activity.getType(), activity.getType(), activity.getType(),
                activity.getType(), activity.getType()
        );
    }
}
