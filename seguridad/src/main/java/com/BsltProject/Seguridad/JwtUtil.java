package com.BsltProject.Seguridad;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.List;
import java.util.function.Function;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secretKey;

    private SecretKey signingKey;

    @PostConstruct
    public void init() {
        this.secretKey = secretKey.trim();

        
        byte[] keyBytes = secretKey.getBytes();

        if (keyBytes.length != 32) {
            throw new IllegalArgumentException("ERROR: La clave secreta debe tener exactamente 32 caracteres.");
        }

        this.signingKey = Keys.hmacShaKeyFor(keyBytes);

    }

    public String generarToken(String username, List<String> roles) {

        String token = Jwts.builder()
                .setHeaderParam("typ", "JWT")
                .setSubject(username)
                .claim("roles", roles)  
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24)) 
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();

        return token;
    }


    public String extraerUsuario(String token) {
        return extraerReclamo(token, Claims::getSubject);
    }

    public Date extraerExpiracion(String token) {
        return extraerReclamo(token, Claims::getExpiration);
    }

    public boolean validarToken(String token, String username) {
        try {
            return (extraerUsuario(token).equals(username) && !estaExpirado(token));
        } catch (Exception e) {
            return false;
        }
    }

    private <T> T extraerReclamo(String token, Function<Claims, T> resolver) {
        final Claims claims = extraerTodosLosReclamos(token);
        return resolver.apply(claims);
    }

    public Claims extraerTodosLosReclamos(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(signingKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            throw e;
        }
    }

    public List<String> extraerRoles(String token) {
        Claims claims = extraerTodosLosReclamos(token);
        return claims.get("roles", List.class); 
    }

    private boolean estaExpirado(String token) {
        return extraerExpiracion(token).before(new Date());
    }
}
