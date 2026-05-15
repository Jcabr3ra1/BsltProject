package com.BsltProject.Repositorios;

import com.BsltProject.Modelos.RefreshToken;
import com.BsltProject.Modelos.Usuario;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RepositorioRefreshToken extends MongoRepository<RefreshToken, String> {
    Optional<RefreshToken> findByToken(String token);
    Optional<RefreshToken> findByUsuario(Usuario usuario);
    void deleteByUsuario(Usuario usuario);
}
