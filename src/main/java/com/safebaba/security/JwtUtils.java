package com.safebaba.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.security.SecureRandom;
import java.util.Date;

@Component
public class JwtUtils {
    private static final Logger log = LoggerFactory.getLogger(JwtUtils.class);

    private final SecretKey key;
    private final long expirationMs;

    /**
     * A chave vem da variável de ambiente APP_JWT_SECRET (Base64, 32 bytes ou mais).
     * Sem ela, uma chave aleatória é criada a cada execução: nada fica gravado no repositório,
     * mas os logins deixam de valer quando o servidor reinicia.
     */
    public JwtUtils(
            @Value("${app.jwt.secret:}") String secret,
            @Value("${app.jwt.expiration-ms}") long expirationMs) {

        if (secret == null || secret.isBlank()) {
            byte[] aleatoria = new byte[48];
            new SecureRandom().nextBytes(aleatoria);
            this.key = Keys.hmacShaKeyFor(aleatoria);
            log.warn("APP_JWT_SECRET não definida: usando uma chave aleatória só desta execução. "
                    + "Os logins serão invalidados ao reiniciar. Defina APP_JWT_SECRET (Base64, 32+ bytes) para manter as sessões.");
        } else {
            byte[] bytes;
            try {
                bytes = Decoders.BASE64.decode(secret.trim());
            } catch (RuntimeException e) {
                throw new IllegalArgumentException("APP_JWT_SECRET precisa estar em Base64.", e);
            }
            if (bytes.length < 32) {
                throw new IllegalArgumentException("APP_JWT_SECRET precisa ter pelo menos 32 bytes em Base64.");
            }
            this.key = Keys.hmacShaKeyFor(bytes);
        }
        this.expirationMs = expirationMs;
    }

    public String gerar(String email) {
        Date agora = new Date();
        return Jwts.builder()
                .subject(email)
                .issuedAt(agora)
                .expiration(new Date(agora.getTime() + expirationMs))
                .signWith(key)
                .compact();
    }

    public String email(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload().getSubject();
    }

    public boolean valido(String token) {
        try {
            email(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
