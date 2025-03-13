package com.BsltProject.Repositorios;

import com.BsltProject.Modelos.Estado;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface RepositorioEstado extends MongoRepository<Estado, String> { // 
    Optional<Estado> findByNombre(String nombre);
}
