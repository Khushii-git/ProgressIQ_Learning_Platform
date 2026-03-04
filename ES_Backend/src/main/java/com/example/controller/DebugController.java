package com.example.controller;

import org.springframework.web.bind.annotation.*;


import java.util.Map;

@RestController
@RequestMapping("/debug")
public class DebugController {

    @GetMapping("/test")
    public Map<String, String> test() {
        return Map.of("message", "Debug endpoint working", "timestamp", System.currentTimeMillis() + "");
    }
}
