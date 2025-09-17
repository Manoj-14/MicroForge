package com.microservices.login.security;

import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collections;

public class JwtAuthenticationToken extends AbstractAuthenticationToken {

    private final String principal;
    private final String credentials;

    public JwtAuthenticationToken(String principal, String credentials) {
        super(Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")));
        this.principal = principal;
        this.credentials = credentials;
        setAuthenticated(false);
    }

    @Override
    public Object getCredentials() {
        return credentials;
    }

    @Override
    public Object getPrincipal() {
        return principal;
    }

    @Override
    public String getName() {
        return principal;
    }
}