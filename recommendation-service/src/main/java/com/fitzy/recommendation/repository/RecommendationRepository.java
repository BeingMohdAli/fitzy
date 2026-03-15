package com.fitzy.recommendation.repository;

import com.fitzy.recommendation.model.Recommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecommendationRepository extends JpaRepository<Recommendation, String> {
    List<Recommendation> findByUserIdOrderByCreatedAtDesc(String userId);
    Optional<Recommendation> findByActivityId(String activityId);
}
