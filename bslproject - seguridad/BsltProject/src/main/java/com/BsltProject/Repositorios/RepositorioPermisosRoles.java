package com.BsltProject.Repositorios;

import com.BsltProject.Modelos.PermisosRoles;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RepositorioPermisosRoles extends MongoRepository<PermisosRoles, String> { // 🔹 Cambié Long por String
}
