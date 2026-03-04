package com.example.security;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.*;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String token = null;

        System.out.println("\n=== JWT FILTER ==================================================");
        System.out.println("📍 Request URI: " + path);

        // Try to get token from HTTPOnly cookie first
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("authToken".equals(cookie.getName())) {
                    token = cookie.getValue();
                    System.out.println("🔐 Token Found in HTTPOnly Cookie");
                    break;
                }
            }
        }

        // Fallback to Authorization header
        if (token == null) {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
                System.out.println("🔐 Token Found in Authorization Header");
            }
        }

        if (token != null) {
            System.out.println("🔑 Token: " + token.substring(0, Math.min(20, token.length())) + "...");

            if (jwtUtil.validateToken(token)) {

                String email = jwtUtil.extractEmail(token);
                String role = jwtUtil.extractRole(token);

                System.out.println("✓ Token Valid");
                System.out.println("📧 Email: " + email);
                System.out.println("👤 Role from Token: " + role);

                // Create authorities from the role in the token
                var authorities = Collections.singleton(
                        new SimpleGrantedAuthority("ROLE_" + role)
                );

                var authToken = new UsernamePasswordAuthenticationToken(
                        email,
                        null,
                        authorities
                );

                SecurityContextHolder.getContext().setAuthentication(authToken);
                
                System.out.println("✓ Granted Authority: ROLE_" + role);
                System.out.println("✓ Authentication set in SecurityContext");
            } else {
                System.out.println("✗ Token Validation Failed");
            }
        } else {
            System.out.println("⚠️  No token found in Cookie or Authorization header");
        }
        
        System.out.println("==============================================================\n");

        filterChain.doFilter(request, response);
    }
}