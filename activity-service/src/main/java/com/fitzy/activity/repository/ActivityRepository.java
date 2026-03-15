package com.fitzy.activity.repository;

import com.fitzy.activity.model.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, String> {
    List<Activity> findByUserIdOrderByCreatedAtDesc(String userId);
}
