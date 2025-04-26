package com.leavemanagement.services;

import com.leavemanagement.dtos.LeaveBalanceDTO;
import com.leavemanagement.dtos.LeaveRequestDTO;
import com.leavemanagement.models.*;
import com.leavemanagement.repositories.LeaveRequestRepository;
import com.leavemanagement.repositories.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaveService {
    private final LeaveRequestRepository leaveRequestRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    private static final double MONTHLY_ACCRUAL_RATE = 1.66;
    private static final int MAX_CARRY_OVER_DAYS = 5;

    @Transactional
    public LeaveRequestDTO submitLeaveRequest(String userEmail, LeaveRequestDTO leaveRequestDTO) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        validateLeaveRequest(user, leaveRequestDTO);

        LeaveRequest leaveRequest = new LeaveRequest();
        leaveRequest.setUser(user);
        leaveRequest.setLeaveType(leaveRequestDTO.getLeaveType());
        leaveRequest.setStartDate(leaveRequestDTO.getStartDate());
        leaveRequest.setEndDate(leaveRequestDTO.getEndDate());
        leaveRequest.setReason(leaveRequestDTO.getReason());
        leaveRequest.setDocumentUrl(leaveRequestDTO.getDocumentUrl());
        leaveRequest.setNumberOfDays(calculateWorkingDays(leaveRequestDTO.getStartDate(), leaveRequestDTO.getEndDate()));

        return convertToDTO(leaveRequestRepository.save(leaveRequest));
    }

    @Transactional
    public LeaveRequestDTO approveLeaveRequest(Long requestId, String approverEmail, boolean approved, String comments) {
        User approver = userRepository.findByEmail(approverEmail)
                .orElseThrow(() -> new EntityNotFoundException("Approver not found"));

        if (approver.getRole() != UserRole.MANAGER && approver.getRole() != UserRole.ADMIN) {
            throw new IllegalStateException("User not authorized to approve leave requests");
        }

        LeaveRequest leaveRequest = leaveRequestRepository.findById(requestId)
                .orElseThrow(() -> new EntityNotFoundException("Leave request not found"));

        leaveRequest.setStatus(approved ? LeaveStatus.APPROVED : LeaveStatus.REJECTED);
        leaveRequest.setApproverComments(comments);

        if (approved) {
            double daysToDeduct = leaveRequest.getNumberOfDays();
            User requestingUser = leaveRequest.getUser();

            double totalAvailable = requestingUser.getLeaveBalance() + requestingUser.getCarryOverBalance();

            if (totalAvailable < daysToDeduct) {
                throw new IllegalStateException("Insufficient leave balance");
            }

            // Deduct first from carryOverBalance if available
            if (requestingUser.getCarryOverBalance() >= daysToDeduct) {
                requestingUser.setCarryOverBalance(requestingUser.getCarryOverBalance() - daysToDeduct);
            } else {
                double remaining = daysToDeduct - requestingUser.getCarryOverBalance();
                requestingUser.setCarryOverBalance(0.0);
                requestingUser.setLeaveBalance(requestingUser.getLeaveBalance() - remaining);
            }

            userRepository.save(requestingUser);
        }

        return convertToDTO(leaveRequestRepository.save(leaveRequest));
    }


    public List<LeaveRequestDTO> getUserLeaveHistory(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        
        return leaveRequestRepository.findByUser(user).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public LeaveBalanceDTO getLeaveBalance(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        LeaveBalanceDTO balanceDTO = new LeaveBalanceDTO();
        balanceDTO.setCurrentBalance(user.getLeaveBalance());
        balanceDTO.setCarryOverBalance(user.getCarryOverBalance());
        balanceDTO.setTotalBalance(user.getLeaveBalance() + user.getCarryOverBalance());
        balanceDTO.setMonthlyAccrual(MONTHLY_ACCRUAL_RATE);
        balanceDTO.setMaxCarryOverDays(MAX_CARRY_OVER_DAYS);

        return balanceDTO;
    }

    @Scheduled(cron = "0 0 0 1 * *") // Run at midnight on the first day of each month
    @Transactional
    public void accrueMonthlyLeave() {
        List<User> users = userRepository.findAll();
        for (User user : users) {
            userService.updateLeaveBalance(user, MONTHLY_ACCRUAL_RATE);
            System.out.println("Monthly leave accrual: " + MONTHLY_ACCRUAL_RATE + " days added for user: " + user.getEmail());
        }
    }

    @Scheduled(cron = "0 0 0 1 1 *") // Run at midnight on January 1st
    @Transactional
    public void processYearEndLeaveBalance() {
        List<User> users = userRepository.findAll();
        for (User user : users) {
            double currentBalance = user.getLeaveBalance();
            if (currentBalance > MAX_CARRY_OVER_DAYS) {
                user.setCarryOverBalance(MAX_CARRY_OVER_DAYS);
                user.setLeaveBalance(0.0);
            } else {
                user.setCarryOverBalance(currentBalance);
                user.setLeaveBalance(0.0);
            }
            userRepository.save(user);
            System.out.println("Year-end leave balance processed for user: " + user.getEmail());
        }
    }

    private void validateLeaveRequest(User user, LeaveRequestDTO leaveRequestDTO) {
        if (leaveRequestDTO.getStartDate().isAfter(leaveRequestDTO.getEndDate())) {
            throw new IllegalArgumentException("Start date must be before end date");
        }

        double requestedDays = calculateWorkingDays(leaveRequestDTO.getStartDate(), leaveRequestDTO.getEndDate());

        System.out.println("User available balance: " + user.getLeaveBalance());
        System.out.println("Requested days: " + requestedDays);

        if (user.getLeaveBalance() + user.getCarryOverBalance() < requestedDays) {
            throw new IllegalStateException("Insufficient leave balance");
        }

        List<LeaveRequest> overlappingLeaves = leaveRequestRepository.findOverlappingLeaves(
                leaveRequestDTO.getStartDate(), leaveRequestDTO.getEndDate());
        if (!overlappingLeaves.isEmpty()) {
            throw new IllegalStateException("Overlapping leave request exists");
        }
    }

    private double calculateWorkingDays(LocalDate startDate, LocalDate endDate) {
        return ChronoUnit.DAYS.between(startDate, endDate) + 1;
    }

    private LeaveRequestDTO convertToDTO(LeaveRequest leaveRequest) {
        LeaveRequestDTO dto = new LeaveRequestDTO();
        dto.setId(leaveRequest.getId());
        dto.setLeaveType(leaveRequest.getLeaveType());
        dto.setStartDate(leaveRequest.getStartDate());
        dto.setEndDate(leaveRequest.getEndDate());
        dto.setReason(leaveRequest.getReason());
        dto.setStatus(leaveRequest.getStatus());
        dto.setDocumentUrl(leaveRequest.getDocumentUrl());
        dto.setApproverComments(leaveRequest.getApproverComments());
        dto.setNumberOfDays(leaveRequest.getNumberOfDays());
        dto.setSubmissionDate(leaveRequest.getSubmissionDate());
        return dto;
    }
}
