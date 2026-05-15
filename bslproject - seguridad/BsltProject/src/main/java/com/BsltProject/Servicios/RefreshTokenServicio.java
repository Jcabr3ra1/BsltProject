package com.BsltProject.Servicios;

import com.BsltProject.Modelos.RefreshToken;
import com.BsltProject.Modelos.Usuario;
import com.BsltProject.Repositorios.RepositorioRefreshToken;
import com.BsltProject.Repositorios.RepositorioUsuario;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenServicio {

    @Value("${jwt.refresh.expiration}")
    private Long refreshTokenDurationMs;

    private final RepositorioRefreshToken repositorioRefreshToken;
    private final RepositorioUsuario repositorioUsuario;

    public RefreshTokenServicio(RepositorioRefreshToken repositorioRefreshToken, RepositorioUsuario repositorioUsuario) {
        this.repositorioRefreshToken = repositorioRefreshToken;
        this.repositorioUsuario = repositorioUsuario;
    }

    public Optional<RefreshToken> findByToken(String token) {
        return repositorioRefreshToken.findByToken(token);
    }

    public RefreshToken crearRefreshToken(String userId) {
        RefreshToken refreshToken = new RefreshToken();

        Optional<Usuario> usuarioOpt = repositorioUsuario.findById(userId);
        if (!usuarioOpt.isPresent()) {
            throw new RuntimeException("Usuario no encontrado con id: " + userId);
        }
        
        Usuario usuario = usuarioOpt.get();
        
        // Primero verificamos si ya existe un refresh token para este usuario
        Optional<RefreshToken> existingToken = repositorioRefreshToken.findByUsuario(usuario);
        if (existingToken.isPresent()) {
            // Si existe, lo revocamos
            RefreshToken token = existingToken.get();
            token.setRevoked(true);
            repositorioRefreshToken.save(token);
        }

        refreshToken.setUsuario(usuario);
        refreshToken.setExpiryDate(Instant.now().plusMillis(refreshTokenDurationMs));
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setRevoked(false);

        refreshToken = repositorioRefreshToken.save(refreshToken);
        
        System.out.println("✅ Refresh token creado para usuario: " + usuario.getEmail());
        return refreshToken;
    }

    public RefreshToken verificarExpiracion(RefreshToken token) {
        if (token.isExpired()) {
            repositorioRefreshToken.delete(token);
            throw new RuntimeException("El refresh token ha expirado. Por favor, inicie sesión nuevamente.");
        }
        return token;
    }

    /**
     * Revoca un refresh token por su valor de token
     * @param token El valor del token a revocar
     * @return true si el token fue revocado exitosamente, false si no se encontró
     */
    public boolean revocarPorToken(String token) {
        return repositorioRefreshToken.findByToken(token)
                .map(refreshToken -> {
                    refreshToken.setRevoked(true);
                    repositorioRefreshToken.save(refreshToken);
                    return true;
                })
                .orElse(false);
    }

    @Transactional
    public void eliminarPorUsuario(Usuario usuario) {
        repositorioRefreshToken.deleteByUsuario(usuario);
    }
}
