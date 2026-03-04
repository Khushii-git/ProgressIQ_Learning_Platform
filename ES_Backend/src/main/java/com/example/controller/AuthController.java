package com.example.controller;

import com.example.request.*;
import com.example.response.AuthResponse;
import com.example.service.AuthService;
import com.example.service.RefreshTokenService;
import com.example.entity.RefreshToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Cookie;
import jakarta.validation.Valid;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @GetMapping("/teachers")
    public List<AuthResponse.UserDto> getTeachers() {
        return authService.getAllTeachers();
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            return ResponseEntity.ok(authService.register(request));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        try {
            AuthResponse authResponse = authService.login(request);
            
            // Create refresh token
            RefreshToken refreshToken = refreshTokenService.createRefreshToken(request.getEmail());
            
            // Set HTTPOnly cookie with JWT access token (1 hour expiration)
            Cookie cookie = new Cookie("authToken", authResponse.getToken());
            cookie.setHttpOnly(true);
            cookie.setSecure(false); // Set to true in production with HTTPS
            cookie.setPath("/");
            cookie.setMaxAge(3600); // 1 hour
            response.addCookie(cookie);
            
            // Return response with refresh token (client stores in sessionStorage or memory)
            return ResponseEntity.ok(Map.of(
                    "token", authResponse.getToken(),
                    "refreshToken", refreshToken.getToken(),
                    "user", authResponse.getUser()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@Valid @RequestBody RefreshTokenRequest request, HttpServletResponse response) {
        try {
            String newAccessToken = refreshTokenService.refreshAccessToken(request.getRefreshToken());
            
            // Set new HTTPOnly cookie with new access token
            Cookie cookie = new Cookie("authToken", newAccessToken);
            cookie.setHttpOnly(true);
            cookie.setSecure(false); // Set to true in production with HTTPS
            cookie.setPath("/");
            cookie.setMaxAge(3600); // 1 hour
            response.addCookie(cookie);
            
            return ResponseEntity.ok(Map.of(
                    "token", newAccessToken,
                    "message", "Token refreshed successfully"
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response, @RequestParam(required = false) String email) {
        // Clear the HTTPOnly cookie
        Cookie cookie = new Cookie("authToken", null);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        
        // Revoke refresh token if email provided
        if (email != null && !email.isBlank()) {
            try {
                refreshTokenService.revokeRefreshToken(email);
            } catch (Exception e) {
                // Silently fail if revocation fails
            }
        }
        
        return ResponseEntity.ok(new ErrorResponse("Logged out successfully"));
    }

    @GetMapping("/status")
    public ResponseEntity<?> getAuthStatus() {
        // This endpoint checks if user is authenticated
        // Spring Security will handle the 401 if not authenticated
        return ResponseEntity.ok(new ErrorResponse("User is authenticated"));
    }

    public static class ErrorResponse {
        public String message;
        public ErrorResponse(String message) { this.message = message; }
    }
}