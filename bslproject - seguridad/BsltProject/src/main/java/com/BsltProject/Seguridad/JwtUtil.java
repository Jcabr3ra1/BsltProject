package com.BsltProject.Seguridad;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;

@Component
public class JwtUtil {

    private final String SECRET_KEY = "vQmatW7Mo/DUNpapm4JL/p5V8v4G8ObEgaQ1Qu9uVqE="; // 🔒 Clave privada

    // ✅ Generar token
    public String generarToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60)) // 1 hora
                .signWith(getSignKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // ✅ Extraer el usuario del token
    public String extraerUsuario(String token) {
        return extraerReclamo(token, Claims::getSubject);
    }

    // ✅ Extraer la fecha de expiración del token
    public Date extraerExpiracion(String token) {
        return extraerReclamo(token, Claims::getExpiration);
    }

    // ✅ Validar el token
    public boolean validarToken(String token, String username) {
        return (extraerUsuario(token).equals(username) && !estaExpirado(token));
    }

    // ✅ Métodos auxiliares
    private <T> T extraerReclamo(String token, Function<Claims, T> resolver) {
        final Claims claims = extraerTodosLosReclamos(token);
        return resolver.apply(claims);
    }

    private Claims extraerTodosLosReclamos(String token) {
        return Jwts.parser()
                .verifyWith(getSignKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private boolean estaExpirado(String token) {
        return extraerExpiracion(token).before(new Date());
    }

    private SecretKey getSignKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
