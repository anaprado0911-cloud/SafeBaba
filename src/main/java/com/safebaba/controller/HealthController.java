package com.safebaba.controller;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api") public class HealthController { @GetMapping("/health") public Object health(){return java.util.Map.of("status","ok","sistema","Safe Babá");} }
