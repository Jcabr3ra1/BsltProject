package com.BsltProject.Repositorios;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.BsltProject.Modelos.Permiso;

public interface RepositorioPermiso extends MongoRepository<Permiso, String> {
    Permiso findByNombre(String nombre);
}

