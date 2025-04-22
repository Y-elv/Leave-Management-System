package com.leavemanagement.dtos;

import com.leavemanagement.models.LeaveStatus;
import com.leavemanagement.models.LeaveType;
import lombok.Data;
import java.time.LocalDate;

@Data
public class LeaveRequestDTO {
    private Long id;
    private LeaveType leaveType;
    private LocalDate startDate;
    private LocalDate endDate;
    private String reason;
    private LeaveStatus status;
    private String documentUrl;
    private String approverComments;
    private double numberOfDays;
    private LocalDate submissionDate;
    private UserDTO user;
}
