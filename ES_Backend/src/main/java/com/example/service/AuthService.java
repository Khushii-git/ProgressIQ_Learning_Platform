package com.example.service;

import com.example.request.*;
import com.example.response.AuthResponse;
import com.example.entity.*;
import com.example.repository.*;
import com.example.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeacherStudentRepository teacherStudentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setUsername(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.valueOf(request.getRole().toUpperCase()));

        userRepository.save(user);

        // Student must always have a teacher assigned
        if (user.getRole() == User.Role.STUDENT) {
            if (request.getTeacherId() == null) {
                throw new RuntimeException("Please select a teacher to complete registration.");
            }

            User teacher = userRepository.findById(request.getTeacherId())
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));

            if (teacher.getRole() != User.Role.TEACHER) {
                throw new RuntimeException("Selected user is not a teacher");
            }

            TeacherStudentMapping mapping = new TeacherStudentMapping();
            mapping.setTeacher(teacher);
            mapping.setStudent(user);
            teacherStudentRepository.save(mapping);
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        AuthResponse.UserDto userDto = new AuthResponse.UserDto(
                user.getId(),
                user.getEmail(),
                user.getUsername(),
                user.getRole().name()
        );

        return new AuthResponse(token, userDto);
    }

    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        AuthResponse.UserDto userDto = new AuthResponse.UserDto(
                user.getId(),
                user.getEmail(),
                user.getUsername(),
                user.getRole().name()
        );

        return new AuthResponse(token, userDto);
    }

    public List<AuthResponse.UserDto> getAllTeachers() {
        return userRepository.findByRole(User.Role.TEACHER)
                .stream()
                .map(teacher -> new AuthResponse.UserDto(
                        teacher.getId(),
                        teacher.getEmail(),
                        teacher.getUsername(),
                        teacher.getRole().name()
                ))
                .collect(Collectors.toList());
    }
}