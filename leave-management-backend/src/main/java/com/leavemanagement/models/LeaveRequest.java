package com.leavemanagement.models;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "leave_requests")
public class LeaveRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LeaveType leaveType;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LeaveStatus status = LeaveStatus.PENDING;

    private String documentUrl;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String approverComments;

    @Column(nullable = false)
    private double numberOfDays;

    @Column(nullable = false)
    private LocalDate submissionDate = LocalDate.now();
}
