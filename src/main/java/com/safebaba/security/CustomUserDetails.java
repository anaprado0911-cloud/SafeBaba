package com.safebaba.security;
import com.safebaba.model.Usuario; import org.springframework.security.core.userdetails.User; import org.springframework.security.core.userdetails.UserDetails;
public final class CustomUserDetails { private CustomUserDetails(){} public static UserDetails from(Usuario u){return User.withUsername(u.getEmail()).password(u.getSenha()).roles(u.getTipo().name()).build();} }
