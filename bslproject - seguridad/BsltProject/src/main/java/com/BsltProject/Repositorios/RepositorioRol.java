package com.BsltProject.Repositorios;

import com.BsltProject.Modelos.Rol;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface RepositorioRol extends MongoRepository<Rol, String> {
    Optional<Rol> findByNombre(String nombre);
}

