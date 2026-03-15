package com.fitzy.user.service;

import com.fitzy.user.dto.SyncUserRequest;
import com.fitzy.user.dto.UserDto;
import com.fitzy.user.model.User;
import com.fitzy.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;

    public UserDto getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
        return toDto(user);
    }

    public UserDto syncUser(SyncUserRequest request) {
        User user = userRepository.findById(request.getKeycloakId())
                .orElse(User.builder()
                        .id(request.getKeycloakId())
                        .build());

        user.setEmail(request.getEmail());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());

        User saved = userRepository.save(user);
        log.info("User synced: {}", saved.getId());
        return toDto(saved);
    }

    private UserDto toDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
