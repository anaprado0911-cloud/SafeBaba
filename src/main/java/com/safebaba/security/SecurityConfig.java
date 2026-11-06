package com.safebaba.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http, JwtFilter jwtFilter) throws Exception {
        http.csrf(c -> c.disable()) // API sem cookies de sessão: o token vai no cabeçalho Authorization
            .cors(c -> { })
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(e -> e.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
            .authorizeHttpRequests(a -> a
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/health", "/api/auth/**").permitAll()
                .requestMatchers("/api/babas/minha-disponibilidade", "/api/babas/minha-agenda-config/**").authenticated()
                // Consultas públicas (somente leitura)
                .requestMatchers(HttpMethod.GET, "/api/babas/**", "/api/confianca/**", "/api/avaliacoes/baba/**").permitAll()
                .requestMatchers("/api/**").authenticated()
                // Arquivos do frontend Angular (index.html, js, css)
                .anyRequest().permitAll())
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
