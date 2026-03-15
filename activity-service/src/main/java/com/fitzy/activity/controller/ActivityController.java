package com.fitzy.activity.controller;

import com.fitzy.activity.dto.ActivityRequest;
import com.fitzy.activity.dto.ActivityResponse;
import com.fitzy.activity.service.ActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    @PostMapping
    public ResponseEntity<ActivityResponse> trackActivity(
            @RequestBody ActivityRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        if (request.getUserId() == null) {
            request.setUserId(jwt.getSubject());
        }
        return ResponseEntity.ok(activityService.trackActivity(request));
    }

    @GetMapping
    public ResponseEntity<List<ActivityResponse>> getUserActivities(
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(activityService.getUserActivities(jwt.getSubject()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ActivityResponse> getActivityById(@PathVariable String id) {
        return ResponseEntity.ok(activityService.getActivityById(id));
    }
}
