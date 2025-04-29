package com.leavemanagement.repositories;

import com.leavemanagement.models.LeaveRequest;
import com.leavemanagement.models.LeaveStatus;
import com.leavemanagement.models.LeaveType;
import com.leavemanagement.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDate;
import java.util.List;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByUser(User user);
    
    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.startDate <= ?2 AND lr.endDate >= ?1")
    List<LeaveRequest> findOverlappingLeaves(LocalDate startDate, LocalDate endDate);
    
    List<LeaveRequest> findByUserAndStartDateBetween(User user, LocalDate startDate, LocalDate endDate);

    List<LeaveRequest> findByStatus(LeaveStatus status);
    List<LeaveRequest> findByLeaveType(LeaveType leaveType);
    List<LeaveRequest> findByStatusAndLeaveType(LeaveStatus status, LeaveType leaveType);

}
