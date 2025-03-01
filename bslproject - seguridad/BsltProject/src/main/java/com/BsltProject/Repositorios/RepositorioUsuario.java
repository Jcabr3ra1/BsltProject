package com.BsltProject.Repositorios;

import com.BsltProject.Modelos.Usuario;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RepositorioUsuario extends MongoRepository<Usuario, String> {
    Optional<Usuario> findByEmail(String email);
}
