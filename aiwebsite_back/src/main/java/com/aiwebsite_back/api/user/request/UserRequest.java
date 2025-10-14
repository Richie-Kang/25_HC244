package com.aiwebsite_back.api.user.request;

import lombok.Data;

@Data
public class UserRequest {
    private String email;
    private String password;

}
