package com.leavemanagement.controllers;

import com.leavemanagement.dtos.ApproveLeaveRequestDTO;
import com.leavemanagement.dtos.LeaveBalanceDTO;
import com.leavemanagement.dtos.LeaveRequestDTO;
import com.leavemanagement.models.LeaveRequest;
import com.leavemanagement.models.LeaveStatus;
import com.leavemanagement.models.LeaveType;
import com.leavemanagement.services.JwtService;
import com.leavemanagement.services.LeaveService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/leave")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
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

    @PutMapping("/{id}/approve")
    public ResponseEntity<LeaveRequestDTO> approveLeaveRequest(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable Long id,
            @RequestBody ApproveLeaveRequestDTO approveRequest) {

        String token = extractToken(authorizationHeader);
        String approverEmail = jwtService.extractEmail(token);
        return ResponseEntity.ok(leaveService.approveLeaveRequest(id, approverEmail, approveRequest.isApproved(), approveRequest.getApproverComments()));
    }

    @GetMapping("/all") // <=== NEW endpoint to track all leaves in database
    public ResponseEntity<List<LeaveRequestDTO>> getAllLeaveRequests(@RequestHeader("Authorization") String authorizationHeader) {
        String token = extractToken(authorizationHeader);
        String requesterEmail = jwtService.extractEmail(token);
        return ResponseEntity.ok(leaveService.getAllLeaveRequests(requesterEmail));
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportLeaveRequests(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String leaveType) {

        byte[] csvData = leaveService.exportLeaveRequests(status, leaveType);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=leave-requests.csv")
                .header("Content-Type", "text/csv")
                .body(csvData);
    }



    private String extractToken(String authorizationHeader) {
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            return authorizationHeader.substring(7);
        }
        throw new IllegalArgumentException("Invalid Authorization header");
    }
}
