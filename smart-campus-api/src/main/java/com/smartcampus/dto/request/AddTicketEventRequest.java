package com.smartcampus.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddTicketEventRequest {

    @NotBlank(message = "Event content is required")
    private String content;

    private String type;
    private boolean isInternal;
    private String authorName;
}
