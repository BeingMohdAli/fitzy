package com.fitzy.user.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SyncUserRequest {
    private String keycloakId;
    private String email;
    private String firstName;
    private String lastName;
}
