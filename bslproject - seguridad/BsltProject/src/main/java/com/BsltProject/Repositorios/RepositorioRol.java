package com.BsltProject.Repositorios;

import com.BsltProject.Modelos.Rol;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.Optional;

public interface RepositorioRol extends MongoRepository<Rol, String> {
    @Query("{ 'nombre' : ?0 }")
    Optional<Rol> findByNombre(String nombre);
}

