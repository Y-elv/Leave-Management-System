package com.leavemanagement.services;

import com.leavemanagement.dtos.UserDTO;
import com.leavemanagement.models.User;
import com.leavemanagement.models.UserRole;
import com.leavemanagement.repositories.UserRepository;
import com.leavemanagement.utils.JwtTokenUtil;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    @Autowired
    private JwtTokenUtil jwtTokenUtil;
    private final UserRepository userRepository;

    public User getCurrentUser(OAuth2User principal) {
        String email = principal.getAttribute("email");
        return userRepository.findByEmail(email)
                .orElseGet(() -> createNewUser(principal));
    }

    private User createNewUser(OAuth2User principal) {
        User user = new User();
        user.setEmail(principal.getAttribute("email"));
        user.setFullName(principal.getAttribute("name"));
        user.setProfilePictureUrl(principal.getAttribute("picture"));
        user.setRole(UserRole.STAFF); // Default role for new users
        user.setLeaveBalance(0.0);
        user.setCarryOverBalance(0.0);
        return userRepository.save(user);
    }

    public List<UserDTO> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(this::convertToDTO)
                .toList();
    }

    @Transactional
    public void updateLeaveBalance(User user, double daysToAdd) {
        user.setLeaveBalance(user.getLeaveBalance() + daysToAdd);
        userRepository.save(user);
    }

    public UserDTO convertToDTO(User user) {
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

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found with email: " + email));
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return getUserByEmail(email);
    }

    public UserDTO getCurrentUserDTO() {
        return convertToDTO(getCurrentUser());
    }

    public User getUserFromToken(String token) {
        try {
            String email = jwtTokenUtil.getEmailFromToken(token);
            return getUserByEmail(email);
        } catch (Exception e) {
            return null;
        }
    }

    @Transactional
    public UserDTO changeUserRole(Long userId, String requesterEmail, UserRole role) {
        // Find the requester (who is trying to change role)
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new EntityNotFoundException("Requester not found"));

        // Only Admins are allowed
        if (requester.getRole() != UserRole.ADMIN) {
            throw new IllegalStateException("Only admins can change user roles");
        }

        // Find the target user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User to update not found"));

        // Update the user's role
        user.setRole(role);

        // Save and return updated user
        User updatedUser = userRepository.save(user);
        return convertToDTO(updatedUser);
    }

}
