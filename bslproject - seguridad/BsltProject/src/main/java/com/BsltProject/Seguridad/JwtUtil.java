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
import java.util.function.Function;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secretKey;

    private SecretKey signingKey;

    @PostConstruct
    public void init() {
        this.secretKey = secretKey.trim();

        // Convertir clave a bytes sin usar BASE64
        byte[] keyBytes = secretKey.getBytes();

        if (keyBytes.length != 32) {
            throw new IllegalArgumentException("🚨 ERROR: La clave secreta debe tener exactamente 32 caracteres.");
        }

        this.signingKey = Keys.hmacShaKeyFor(keyBytes);

        System.out.println("✅ Clave secreta cargada correctamente.");
    }

    public String generarToken(String username) {
        System.out.println("🚀 Generando token para usuario: " + username);

        String token = Jwts.builder()
                .setHeaderParam("typ", "JWT")
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60)) // 1 hora
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();

        System.out.println("🟢 Token generado correctamente: " + token);
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
            System.out.println("❌ ERROR: Token inválido.");
            return false;
        }
    }

    private <T> T extraerReclamo(String token, Function<Claims, T> resolver) {
        final Claims claims = extraerTodosLosReclamos(token);
        return resolver.apply(claims);
    }

    private Claims extraerTodosLosReclamos(String token) {
        System.out.println("🔍 Validando token...");
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(signingKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            System.out.println("❌ ERROR al validar el token: " + e.getMessage());
            throw e;
        }
    }

    private boolean estaExpirado(String token) {
        return extraerExpiracion(token).before(new Date());
    }
}
