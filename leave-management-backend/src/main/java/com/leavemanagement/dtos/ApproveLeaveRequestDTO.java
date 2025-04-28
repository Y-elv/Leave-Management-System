package com.leavemanagement.dtos;

import lombok.Data;

@Data
public class ApproveLeaveRequestDTO {
    private boolean approved;
    private String approverComments;
}
