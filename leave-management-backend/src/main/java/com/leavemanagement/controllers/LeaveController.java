package com.leavemanagement.controllers;

import com.leavemanagement.dtos.LeaveBalanceDTO;
import com.leavemanagement.dtos.LeaveRequestDTO;
import com.leavemanagement.services.JwtService;
import com.leavemanagement.services.LeaveService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leave")
@RequiredArgsConstructor
public class LeaveController {
    private final LeaveService leaveService;
    private final JwtService jwtService;

    @GetMapping
    public ResponseEntity<List<LeaveRequestDTO>> getUserLeaveHistory(@RequestHeader("Authorization") String authorizationHeader) {
        String token = extractToken(authorizationHeader);
        String userEmail = jwtService.extractEmail(token);
        return ResponseEntity.ok(leaveService.getUserLeaveHistory(userEmail));
    }

    @GetMapping("/balance")
    public ResponseEntity<LeaveBalanceDTO> getLeaveBalance(@RequestHeader("Authorization") String authorizationHeader) {
        String token = extractToken(authorizationHeader);
        String userEmail = jwtService.extractEmail(token);
        return ResponseEntity.ok(leaveService.getLeaveBalance(userEmail));
    }

    @PostMapping
    public ResponseEntity<LeaveRequestDTO> submitLeaveRequest(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestBody LeaveRequestDTO leaveRequestDTO) {
        String token = extractToken(authorizationHeader);
        String userEmail = jwtService.extractEmail(token);
        return ResponseEntity.ok(leaveService.submitLeaveRequest(userEmail, leaveRequestDTO));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<LeaveRequestDTO> approveLeaveRequest(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable Long id,
            @RequestParam boolean approved,
            @RequestParam(required = false) String comments) {
        String token = extractToken(authorizationHeader);
        String approverEmail = jwtService.extractEmail(token);
        return ResponseEntity.ok(leaveService.approveLeaveRequest(id, approverEmail, approved, comments));
    }

    private String extractToken(String authorizationHeader) {
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            return authorizationHeader.substring(7);
        }
        throw new IllegalArgumentException("Invalid Authorization header");
    }
}
