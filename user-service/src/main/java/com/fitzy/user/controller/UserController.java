package com.fitzy.user.controller;

import com.fitzy.user.dto.SyncUserRequest;
import com.fitzy.user.dto.UserDto;
import com.fitzy.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable String id,
                                               @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PostMapping("/sync")
    public ResponseEntity<UserDto> syncUser(@RequestBody SyncUserRequest request,
                                            @AuthenticationPrincipal Jwt jwt) {
        // Auto-populate from JWT if not provided
        if (request.getKeycloakId() == null) {
            request.setKeycloakId(jwt.getSubject());
        }
        if (request.getEmail() == null) {
            request.setEmail(jwt.getClaimAsString("email"));
        }
        if (request.getFirstName() == null) {
            request.setFirstName(jwt.getClaimAsString("given_name"));
        }
        if (request.getLastName() == null) {
            request.setLastName(jwt.getClaimAsString("family_name"));
        }
        return ResponseEntity.ok(userService.syncUser(request));
    }
}
