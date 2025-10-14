// ProfileResponse.java
package com.aiwebsite_back.api.setting.response;

import lombok.Data;

@Data
public class ProfileResponse {
    private boolean success;
    private String message;
    private String nickname;
}