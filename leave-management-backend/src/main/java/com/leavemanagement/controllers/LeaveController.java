package com.leavemanagement.controllers;

import com.leavemanagement.dtos.LeaveBalanceDTO;
import com.leavemanagement.dtos.LeaveRequestDTO;
import com.leavemanagement.services.LeaveService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/leave")
@RequiredArgsConstructor
public class LeaveController {
    private final LeaveService leaveService;

    @GetMapping
    public ResponseEntity<List<LeaveRequestDTO>> getUserLeaveHistory() {
        // In real implementation, email would come from security context
        String userEmail = "user@example.com";
        return ResponseEntity.ok(leaveService.getUserLeaveHistory(userEmail));
    }

    @GetMapping("/balance")
    public ResponseEntity<LeaveBalanceDTO> getLeaveBalance() {
        // In real implementation, email would come from security context
        String userEmail = "user@example.com";
        return ResponseEntity.ok(leaveService.getLeaveBalance(userEmail));
    }

    @PostMapping
    public ResponseEntity<LeaveRequestDTO> submitLeaveRequest(@RequestBody LeaveRequestDTO leaveRequestDTO) {
        // In real implementation, email would come from security context
        String userEmail = "user@example.com";
        return ResponseEntity.ok(leaveService.submitLeaveRequest(userEmail, leaveRequestDTO));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<LeaveRequestDTO> approveLeaveRequest(
            @PathVariable Long id,
            @RequestParam boolean approved,
            @RequestParam(required = false) String comments) {
        // In real implementation, email would come from security context
        String approverEmail = "manager@example.com";
        return ResponseEntity.ok(leaveService.approveLeaveRequest(id, approverEmail, approved, comments));
    }
}
