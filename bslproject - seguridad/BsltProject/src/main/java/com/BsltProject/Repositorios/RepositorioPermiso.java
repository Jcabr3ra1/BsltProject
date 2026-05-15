package com.BsltProject.Repositorios;

import com.BsltProject.Modelos.Permiso;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RepositorioPermiso extends MongoRepository<Permiso, String> {
    Optional<Permiso> findByNombre(String nombre);

    List<Permiso> findByNombreIn(List<String> nombres);
}



