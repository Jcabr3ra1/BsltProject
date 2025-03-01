package com.BsltProject.Repositorios;

import com.BsltProject.Modelos.Rol;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RepositorioRol extends MongoRepository<Rol, String> { // 🔹 Cambié Long por String

    Optional<Rol> findByNombre(String nombre);
}
