package com.leavemanagement.services;

import com.leavemanagement.dtos.UserDTO;
import com.leavemanagement.models.User;
import com.leavemanagement.repositories.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public UserDTO getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        return convertToDTO(user);
    }

    @Transactional
    public void updateLeaveBalance(User user, double daysToAdd) {
        user.setLeaveBalance(user.getLeaveBalance() + daysToAdd);
        userRepository.save(user);
    }

    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setProfilePictureUrl(user.getProfilePictureUrl());
        dto.setLeaveBalance(user.getLeaveBalance());
        dto.setCarryOverBalance(user.getCarryOverBalance());
        return dto;
    }
}
