package com.BsltProject.Repositorios;

import com.BsltProject.Modelos.PermisosRoles;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface RepositorioPermisosRoles extends MongoRepository<PermisosRoles, String> {

    // 🔹 Buscar si ya existe la relación de un Rol y un Permiso usando sus IDs
    Optional<PermisosRoles> findByRol_IdAndPermiso_Id(String rolId, String permisoId);
}
