package com.safebaba.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.Map;
import java.util.NoSuchElementException;

@RestControllerAdvice
public class ApiExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);

    private static ResponseEntity<Map<String, String>> erro(HttpStatus status, String msg) {
        return ResponseEntity.status(status).body(Map.of("erro", msg));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    ResponseEntity<Map<String, String>> invalido(IllegalArgumentException e) {
        return erro(HttpStatus.BAD_REQUEST, e.getMessage());
    }

    @ExceptionHandler(AccessDeniedException.class)
    ResponseEntity<Map<String, String>> negado(AccessDeniedException e) {
        return erro(HttpStatus.FORBIDDEN, "Acesso negado.");
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<Map<String, String>> validacao(MethodArgumentNotValidException e) {
        var f = e.getBindingResult().getFieldErrors().stream().findFirst().orElse(null);
        return erro(HttpStatus.BAD_REQUEST, f == null ? "Dados inválidos." : "Campo '" + f.getField() + "': " + f.getDefaultMessage());
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    ResponseEntity<Map<String, String>> corpo(HttpMessageNotReadableException e) {
        return erro(HttpStatus.BAD_REQUEST, "Corpo da requisição inválido.");
    }

    @ExceptionHandler({NoSuchElementException.class, NoResourceFoundException.class})
    ResponseEntity<Map<String, String>> naoEncontrado(Exception e) {
        return erro(HttpStatus.NOT_FOUND, "Registro não encontrado.");
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<Map<String, String>> generico(Exception e) {
        log.error("Erro inesperado", e);
        return erro(HttpStatus.INTERNAL_SERVER_ERROR, "Ocorreu um erro inesperado.");
    }
}
